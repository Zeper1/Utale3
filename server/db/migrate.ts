import { resolve } from "path";
import fs from "fs";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { log } from "../vite";

// Configuramos la conexión a la base de datos
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Garantiza que sea un string para TypeScript
const dbUrl: string = process.env.DATABASE_URL;

/**
 * Ejecuta las migraciones de la base de datos
 */
async function main() {
  log("Iniciando migración de base de datos...", "db-migrate");
  
  try {
    const client = postgres(dbUrl, { max: 1 });
    const db = drizzle(client);
    
    // Directorio que contiene los archivos de migración generados por drizzle-kit
    const migrationsFolder = resolve("./migrations");
    
    // Verificamos que el directorio exista
    if (!fs.existsSync(migrationsFolder)) {
      log(`El directorio de migraciones ${migrationsFolder} no existe. Creándolo...`, "db-migrate");
      fs.mkdirSync(migrationsFolder, { recursive: true });
    }
    
    // Ejecutamos las migraciones
    log(`Ejecutando migraciones desde ${migrationsFolder}...`, "db-migrate");
    await migrate(db, { migrationsFolder });
    
    log("Migración completada con éxito", "db-migrate");
    await client.end();
    
    return true;
  } catch (error: any) {
    log(`Error durante la migración: ${error.message}`, "db-migrate");
    console.error(error);
    process.exit(1);
  }
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error en la migración:", err);
      process.exit(1);
    });
}

export default main;