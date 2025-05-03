import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { log } from '../vite';
 
/**
 * Clase simplificada para gestionar el almacenamiento de archivos
 * Esta versión no depende de Firebase Storage y sólo guarda y sirve archivos localmente
 * como medida temporal mientras completamos la configuración de Firebase
 */
export class StorageService {
  private uploadDir: string;
  
  constructor() {
    // Directorio base para los uploads
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Asegurarnos de que el directorio existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    
    log('Servicio de almacenamiento local inicializado correctamente', 'local-storage');
  }
  
  /**
   * Sube un archivo al sistema de archivos local
   * @param buffer - Buffer con los datos del archivo
   * @param filePath - Ruta del archivo (relativa al directorio de uploads)
   * @param contentType - Tipo MIME del archivo
   * @returns URL del archivo subido (relativa al servidor)
   */
  async uploadFile(
    buffer: Buffer, 
    filePath: string, 
    contentType: string
  ): Promise<string> {
    try {
      // Crear la estructura de directorios
      const fullPath = path.join(this.uploadDir, filePath);
      const dirPath = path.dirname(fullPath);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Guardar el archivo
      fs.writeFileSync(fullPath, buffer);
      
      log(`Archivo subido exitosamente: ${filePath}`, 'local-storage');
      
      // Devolver la URL relativa
      return `/uploads/${filePath}`;
    } catch (error: any) {
      console.error('Error al subir archivo localmente:', error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }
  
  /**
   * Sube una imagen de libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @param buffer - Buffer con los datos de la imagen
   * @param pagina - Número de página (0 para portada, 1-N para páginas)
   * @returns URL de la imagen subida
   */
  async uploadBookImage(
    userId: number, 
    bookId: number, 
    buffer: Buffer, 
    pagina: number
  ): Promise<string> {
    const fileName = pagina === 0 ? "portada.jpg" : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    
    return await this.uploadFile(buffer, filePath, 'image/jpeg');
  }
  
  /**
   * Sube un PDF de libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @param buffer - Buffer con los datos del PDF
   * @returns URL del PDF subido
   */
  async uploadBookPDF(
    userId: number, 
    bookId: number, 
    buffer: Buffer
  ): Promise<string> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    
    return await this.uploadFile(buffer, filePath, 'application/pdf');
  }
  
  /**
   * Descarga un archivo desde el sistema de archivos local
   * @param filePath - Ruta del archivo (relativa al directorio de uploads)
   * @returns Buffer con los datos del archivo
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(fullPath)) {
        throw new Error(`El archivo ${filePath} no existe`);
      }
      
      // Leer el archivo
      const buffer = fs.readFileSync(fullPath);
      
      log(`Archivo descargado exitosamente: ${filePath}`, 'local-storage');
      
      return buffer;
    } catch (error: any) {
      console.error('Error al descargar archivo localmente:', error);
      throw new Error(`Error al descargar archivo: ${error.message}`);
    }
  }
  
  /**
   * Descarga una imagen de libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @param pagina - Número de página (0 para portada, 1-N para páginas)
   * @returns Buffer con los datos de la imagen
   */
  async downloadBookImage(
    userId: number, 
    bookId: number, 
    pagina: number
  ): Promise<Buffer> {
    const fileName = pagina === 0 ? "portada.jpg" : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    
    return await this.downloadFile(filePath);
  }
  
  /**
   * Descarga un PDF de libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @returns Buffer con los datos del PDF
   */
  async downloadBookPDF(userId: number, bookId: number): Promise<Buffer> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    
    return await this.downloadFile(filePath);
  }
  
  /**
   * Elimina un archivo del sistema de archivos local
   * @param filePath - Ruta del archivo (relativa al directorio de uploads)
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(fullPath)) {
        log(`El archivo ${filePath} no existe, no es necesario eliminarlo`, 'local-storage');
        return;
      }
      
      // Eliminar el archivo
      fs.unlinkSync(fullPath);
      
      log(`Archivo eliminado correctamente: ${filePath}`, 'local-storage');
    } catch (error: any) {
      console.error('Error al eliminar archivo localmente:', error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }
  
  /**
   * Elimina una imagen de libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @param pagina - Número de página (0 para portada, 1-N para páginas)
   */
  async deleteBookImage(
    userId: number, 
    bookId: number, 
    pagina: number
  ): Promise<void> {
    const fileName = pagina === 0 ? "portada.jpg" : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    
    await this.deleteFile(filePath);
  }
  
  /**
   * Elimina un PDF de libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   */
  async deleteBookPDF(userId: number, bookId: number): Promise<void> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    
    await this.deleteFile(filePath);
  }
  
  /**
   * Elimina todos los archivos de un libro
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   */
  async deleteAllBookFiles(userId: number, bookId: number): Promise<void> {
    try {
      const basePath = path.join(this.uploadDir, `usuarios/${userId}/libros/${bookId}`);
      
      // Verificar si el directorio existe
      if (!fs.existsSync(basePath)) {
        log(`El directorio para el libro ${bookId} no existe`, 'local-storage');
        return;
      }
      
      // Función recursiva para eliminar directorios
      const deleteDirectory = (dirPath: string) => {
        if (fs.existsSync(dirPath)) {
          fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteDirectory(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(dirPath);
        }
      };
      
      deleteDirectory(basePath);
      
      log(`Todos los archivos del libro ${bookId} eliminados correctamente`, 'local-storage');
    } catch (error: any) {
      console.error('Error al eliminar todos los archivos del libro:', error);
      throw new Error(`Error al eliminar archivos del libro: ${error.message}`);
    }
  }
  
  /**
   * Elimina todos los archivos de un usuario
   * @param userId - ID del usuario
   */
  async deleteAllUserFiles(userId: number): Promise<void> {
    try {
      const basePath = path.join(this.uploadDir, `usuarios/${userId}`);
      
      // Verificar si el directorio existe
      if (!fs.existsSync(basePath)) {
        log(`El directorio para el usuario ${userId} no existe`, 'local-storage');
        return;
      }
      
      // Función recursiva para eliminar directorios
      const deleteDirectory = (dirPath: string) => {
        if (fs.existsSync(dirPath)) {
          fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteDirectory(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(dirPath);
        }
      };
      
      deleteDirectory(basePath);
      
      log(`Todos los archivos del usuario ${userId} eliminados correctamente`, 'local-storage');
    } catch (error: any) {
      console.error('Error al eliminar todos los archivos del usuario:', error);
      throw new Error(`Error al eliminar archivos del usuario: ${error.message}`);
    }
  }
}

// Exportamos una instancia única del servicio
export const storageService = new StorageService();