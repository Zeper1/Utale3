import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { serverLogger, createLogger } from "./lib/logger";
import admin from "firebase-admin";
import fs from "fs";
import { enableFirebase } from "./services/storage-service";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const statusCode = res.statusCode;
      let responseData;
      
      if (capturedJsonResponse) {
        const responseStr = JSON.stringify(capturedJsonResponse);
        responseData = responseStr.length > 100 
          ? responseStr.substring(0, 100) + "..." 
          : responseStr;
      }
      
      // Determinamos el nivel de log según el código de estado
      if (statusCode >= 500) {
        serverLogger.error(`${req.method} ${path} ${statusCode} in ${duration}ms`, { 
          responseData, 
          duration,
          statusCode
        });
      } else if (statusCode >= 400) {
        serverLogger.warn(`${req.method} ${path} ${statusCode} in ${duration}ms`, { 
          responseData, 
          duration,
          statusCode
        });
      } else {
        serverLogger.info(`${req.method} ${path} ${statusCode} in ${duration}ms`, { 
          responseData, 
          duration,
          statusCode
        });
      }
    }
  });

  next();
});

// CORS handling for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Middleware para extraer información de autenticación del JWT o ID de Firebase
// y adjuntarla como req.user para que los endpoints puedan utilizarla
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si hay un encabezado de autorización
    const authHeader = req.headers.authorization;
    
    // Verificar si hay un encabezado 'x-firebase-uid'
    const firebaseUid = req.headers['x-firebase-uid'] as string;
    
    // Extraer token de la cabecera 'Authorization'
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extraer el token (sin 'Bearer ')
      const token = authHeader.substring(7);
      
      // Aquí normalmente verificaríamos el token, pero por ahora solo buscamos usuario por ID
      // Esto es una simplificación
      const userId = parseInt(token);
      if (!isNaN(userId)) {
        const { storage } = await import("./storage");
        const user = await storage.getUser(userId);
        if (user) {
          (req as any).user = user; // Asignamos el usuario a req.user
        }
      }
    } 
    // O intentar usar el ID de Firebase si está disponible
    else if (firebaseUid) {
      const { storage } = await import("./storage");
      const user = await storage.getUserByFirebaseId(firebaseUid);
      if (user) {
        (req as any).user = user; // Asignamos el usuario a req.user
      }
    }
    
    // Si no hay autenticación, continuamos sin req.user
    next();
  } catch (error) {
    serverLogger.error("Error en el middleware de autenticación", {
      error: error instanceof Error ? error.stack : String(error)
    });
    // Continuar sin establecer req.user en caso de error
    next();
  }
});

(async () => {
  try {
    let credentials: admin.ServiceAccount | undefined;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf8");
        credentials = JSON.parse(content);
      }
    }

    if (credentials) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        storageBucket: `${credentials.project_id}.appspot.com`,
      });
      enableFirebase();
      serverLogger.info("Firebase inicializado correctamente");
    } else {
      serverLogger.warn("Credenciales de Firebase no proporcionadas. Storage deshabilitado");
    }
  } catch (firebaseError) {
    serverLogger.error("No se pudo inicializar Firebase", {
      error: firebaseError instanceof Error ? firebaseError.stack : String(firebaseError)
    });
  }
  // Verificar la conexión a la base de datos antes de iniciar el servidor
  try {
    const { testDatabaseConnection } = await import("./db");
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      serverLogger.error("No se pudo establecer conexión con la base de datos. Verificar configuración.");
      process.exit(1);
    }
    
    serverLogger.info("Conexión a la base de datos verificada correctamente");
    
    // Ejecutar migraciones si es necesario
    try {
      const migrate = (await import("./db/migrate")).default;
      await migrate();
      serverLogger.info("Migraciones de base de datos aplicadas correctamente");
    } catch (migrateError) {
      serverLogger.error(`Error al aplicar migraciones: ${migrateError instanceof Error ? migrateError.message : String(migrateError)}`, {
        error: migrateError instanceof Error ? migrateError.stack : String(migrateError)
      });
      // No detenemos la aplicación en caso de error de migración, 
      // puede ser que ya esté en el estado correcto
    }
  } catch (dbError) {
    serverLogger.error(`Error al verificar la conexión a la base de datos: ${dbError instanceof Error ? dbError.message : String(dbError)}`, {
      error: dbError instanceof Error ? dbError.stack : String(dbError)
    });
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Inicializar niveles de suscripción
  try {
    const { initializeSubscriptionTiers } = await import("./initialize-subscription-tiers");
    await initializeSubscriptionTiers();
    serverLogger.info("Niveles de suscripción inicializados correctamente");
  } catch (error) {
    serverLogger.error("Error al inicializar niveles de suscripción", { 
      error: error instanceof Error ? error.stack : String(error) 
    });
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    serverLogger.error("Error en la aplicación", { 
      error: err instanceof Error ? err.stack : String(err),
      status: err.status || err.statusCode || 500,
      message: err.message || "Internal Server Error"
    });
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    serverLogger.info(`Utale server running on port ${port}`);
  });
})();
