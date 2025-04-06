/**
 * Sistema de logging estructurado para Utale
 * 
 * Proporciona un sistema de logging con niveles (ERROR, WARN, INFO, DEBUG)
 * y estructura consistente para facilitar el diagnóstico de problemas.
 */

// Definición de niveles de log
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Interfaz para datos adicionales del log
export interface LogContext {
  [key: string]: any;
}

// Clase que implementa el logger
export class Logger {
  private source: string;
  private showTimestamp: boolean;
  
  constructor(source: string, options: { showTimestamp?: boolean } = {}) {
    this.source = source;
    this.showTimestamp = options.showTimestamp !== false;
  }
  
  /**
   * Registra un mensaje de error (nivel más alto)
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }
  
  /**
   * Registra una advertencia
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * Registra información general
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * Registra información de depuración (nivel más bajo)
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  /**
   * Método interno para registrar mensajes con nivel específico
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = this.showTimestamp ? new Date().toISOString() : undefined;
    const logEntry = {
      level,
      source: this.source,
      message,
      timestamp,
      ...context
    };
    
    // Formato del log para mejor legibilidad en consola
    let logPrefix = `[${level}] [${this.source}]`;
    if (timestamp) {
      logPrefix = `[${timestamp}] ${logPrefix}`;
    }
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logPrefix, message, context || '');
        break;
      case LogLevel.WARN:
        console.warn(logPrefix, message, context || '');
        break;
      case LogLevel.DEBUG:
        console.debug(logPrefix, message, context || '');
        break;
      case LogLevel.INFO:
      default:
        console.log(logPrefix, message, context || '');
    }
    
    // Aquí podríamos implementar la persistencia de logs si fuera necesario
  }
}

// Exportamos una instancia por defecto para el servidor
export const serverLogger = new Logger('server');

// Función para crear loggers para componentes específicos
export function createLogger(source: string, options?: { showTimestamp?: boolean }): Logger {
  return new Logger(source, options);
}