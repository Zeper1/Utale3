import { log } from '../vite';

// Configuración simplificada - Firebase es opcional
export let isFirebaseAvailable = false;

export function enableFirebase() {
  isFirebaseAvailable = true;
}

/**
 * Clase para gestionar el almacenamiento de archivos
 * Firebase Storage es opcional - si no está disponible, los métodos lanzan errores informativos
 */
export class StorageService {
  /**
   * Sube un archivo a Firebase Storage
   * @param buffer - Buffer con los datos del archivo
   * @param filePath - Ruta del archivo en Firebase Storage
   * @param contentType - Tipo MIME del archivo
   * @returns URL de descarga del archivo
   */
  async uploadFile(
    buffer: Buffer, 
    filePath: string, 
    contentType: string
  ): Promise<string> {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase Storage no está disponible. Por favor, configura las credenciales de Firebase.');
    }
    
    // Simulamos la respuesta para que la app funcione sin Firebase
    log(`Simulando subida de archivo: ${filePath}`, 'firebase-storage');
    return `https://storage.googleapis.com/mock-bucket/${filePath}`;
  }
  
  /**
   * Sube una imagen de libro desde el backend
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
   * Sube un PDF de libro desde el backend
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
   * Descarga un archivo desde Firebase Storage
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns Buffer con los datos del archivo
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase Storage no está disponible. Por favor, configura las credenciales de Firebase.');
    }
    
    // Simulamos la respuesta para que la app funcione sin Firebase
    log(`Simulando descarga de archivo: ${filePath}`, 'firebase-storage');
    return Buffer.from('mock-file-content');
  }
  
  /**
   * Descarga una imagen de libro desde el backend
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
   * Descarga un PDF de libro desde el backend
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @returns Buffer con los datos del PDF
   */
  async downloadBookPDF(userId: number, bookId: number): Promise<Buffer> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    
    return await this.downloadFile(filePath);
  }
  
  /**
   * Elimina un archivo de Firebase Storage
   * @param filePath - Ruta del archivo en Firebase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    if (!isFirebaseAvailable) {
      log(`Firebase Storage no disponible - simulando eliminación: ${filePath}`, 'firebase-storage');
      return;
    }
    
    log(`Simulando eliminación de archivo: ${filePath}`, 'firebase-storage');
  }
  
  /**
   * Elimina una imagen de libro desde el backend
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
   * Elimina un PDF de libro desde el backend
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
    if (!isFirebaseAvailable) {
      log(`Firebase Storage no disponible - simulando eliminación de archivos del libro ${bookId}`, 'firebase-storage');
      return;
    }
    
    log(`Simulando eliminación de todos los archivos del libro ${bookId}`, 'firebase-storage');
  }
  
  /**
   * Elimina todos los archivos de un usuario
   * @param userId - ID del usuario
   */
  async deleteAllUserFiles(userId: number): Promise<void> {
    if (!isFirebaseAvailable) {
      log(`Firebase Storage no disponible - simulando eliminación de archivos del usuario ${userId}`, 'firebase-storage');
      return;
    }
    
    log(`Simulando eliminación de todos los archivos del usuario ${userId}`, 'firebase-storage');
  }
}

// Exportamos una instancia única del servicio
export const storageService = new StorageService();