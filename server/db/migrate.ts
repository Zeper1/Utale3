import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, queryClient } from "../db";
import { log } from "../vite";
import path from "path";
import { fileURLToPath } from "url";

// Obtiene la ruta actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtiene la ruta a la carpeta de migraciones
const migrationsFolder = path.join(__dirname, "../../migrations");

/**
 * Ejecuta las migraciones de la base de datos
 */
async function main() {
  log("Iniciando proceso de migración...", "migration");
  
  try {
    // Ejecuta la migración
    await migrate(db, { migrationsFolder });
    log("Migración completada exitosamente", "migration");
  } catch (error) {
    log(`Error durante la migración: ${error instanceof Error ? error.message : String(error)}`, "migration");
    process.exit(1);
  } finally {
    // Cierra la conexión a la base de datos
    await queryClient.end();
  }
}

// Ejecuta la migración
main();