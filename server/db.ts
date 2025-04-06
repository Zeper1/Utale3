import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createLogger } from './lib/logger';

// Validamos que la URL de conexión exista
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno');
}

// Creamos y configuramos la conexión a la base de datos
const connectionString = process.env.DATABASE_URL;

// Conexión para consultas SQL regulares
export const queryClient = postgres(connectionString, {
  max: 10, // máximo número de conexiones
  idle_timeout: 30, // tiempo máximo de inactividad en segundos
  prepare: false, // desactivamos la preparación de consultas para mayor compatibilidad
});

// Creamos un logger específico para la base de datos
const dbLogger = createLogger('database');

// Exportamos el cliente Drizzle
export const db = drizzle(queryClient, {
  logger: {
    logQuery(query, params) {
      dbLogger.debug(`SQL Query: ${query}`, { params: params });
    }
  }
});

// Función para verificar la conexión a la base de datos
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Ejecutamos una consulta simple para verificar la conexión
    await queryClient`SELECT 1 AS test`;
    dbLogger.info('Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    dbLogger.error(`Error al conectar a la base de datos: ${error instanceof Error ? error.message : String(error)}`, { 
      error: error instanceof Error ? error.stack : String(error) 
    });
    return false;
  }
}

// Función para cerrar la conexión a la base de datos (útil para tests y cierre de la aplicación)
export async function closeDatabase(): Promise<void> {
  try {
    await queryClient.end();
    dbLogger.info('Conexión a la base de datos cerrada correctamente');
  } catch (error) {
    dbLogger.error(`Error al cerrar la conexión a la base de datos: ${error instanceof Error ? error.message : String(error)}`, { 
      error: error instanceof Error ? error.stack : String(error) 
    });
  }
}