import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { serverLogger, createLogger } from "./lib/logger";

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

(async () => {
  // Verificar la conexión a la base de datos antes de iniciar el servidor
  try {
    const { testDatabaseConnection } = await import("./db");
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      serverLogger.error("No se pudo establecer conexión con la base de datos. Verificar configuración.");
      process.exit(1);
    }
    
    serverLogger.info("Conexión a la base de datos verificada correctamente");
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
