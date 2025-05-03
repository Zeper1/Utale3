import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { log } from '../vite';

// Inicializamos Firebase Admin SDK (para el backend)
let firebaseApp: App;

try {
  // Verificamos si ya hay una aplicación inicializada
  const apps = getApps();
  if (apps.length > 0) {
    firebaseApp = apps[0];
    log('Firebase Admin ya estaba inicializado', 'firebase-storage');
  } else {
    // Usamos una ruta fija para mayor consistencia en vez de depender de variables de entorno
    const serviceAccountPath = './server/firebase-service-account.json';
    
    log(`Usando archivo de credenciales en: ${serviceAccountPath}`, 'firebase-storage');
    
    // Verificamos que el archivo existe
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`El archivo de credenciales no existe en: ${serviceAccountPath}`);
    }
    
    // Cargamos el archivo de credenciales
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );
    
    log('Archivo de credenciales cargado correctamente', 'firebase-storage');

    // Inicializamos Firebase Admin
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'crafty-shelter-458717-d8.firebasestorage.app'
    });

    log('Firebase Admin inicializado correctamente', 'firebase-storage');
  }
} catch (error) {
  console.error('Error al inicializar Firebase Admin:', error);
  throw error;
}

// Obtenemos una referencia al bucket de almacenamiento
const bucket = getStorage().bucket();

/**
 * Clase para gestionar el almacenamiento de archivos en Firebase Storage desde el backend
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
    try {
      const file = bucket.file(filePath);
      
      // Creamos un stream de escritura
      const writeStream = file.createWriteStream({
        metadata: {
          contentType: contentType
        }
      });
      
      // Creamos un stream de lectura desde el buffer
      const readStream = new Readable();
      readStream.push(buffer);
      readStream.push(null); // Indicamos el fin del stream
      
      // Retornamos una promesa que se resuelve cuando se completa la subida
      return new Promise((resolve, reject) => {
        readStream
          .pipe(writeStream)
          .on('error', (error) => {
            reject(error);
          })
          .on('finish', async () => {
            try {
              // Configuramos el archivo para que sea accesible públicamente
              await file.makePublic();
              
              // Obtenemos la URL de descarga
              const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500' // Fecha lejana en el futuro
              });
              
              resolve(url);
            } catch (error) {
              reject(error);
            }
          });
      });
    } catch (error) {
      console.error('Error al subir archivo a Firebase Storage:', error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
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
    try {
      const file = bucket.file(filePath);
      
      // Verificamos si el archivo existe
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`El archivo ${filePath} no existe en Firebase Storage`);
      }
      
      // Descargamos el archivo
      const [buffer] = await file.download();
      
      return buffer;
    } catch (error) {
      console.error('Error al descargar archivo de Firebase Storage:', error);
      throw new Error(`Error al descargar archivo: ${error.message}`);
    }
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
    try {
      const file = bucket.file(filePath);
      
      // Verificamos si el archivo existe
      const [exists] = await file.exists();
      if (!exists) {
        log(`El archivo ${filePath} no existe, no es necesario eliminarlo`, 'firebase-storage');
        return;
      }
      
      // Eliminamos el archivo
      await file.delete();
      
      log(`Archivo ${filePath} eliminado correctamente`, 'firebase-storage');
    } catch (error) {
      console.error('Error al eliminar archivo de Firebase Storage:', error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
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
    try {
      const prefix = `usuarios/${userId}/libros/${bookId}/`;
      
      // Obtenemos todos los archivos que empiezan con el prefijo
      const [files] = await bucket.getFiles({ prefix });
      
      // Eliminamos todos los archivos
      await Promise.all(files.map(file => file.delete()));
      
      log(`Todos los archivos del libro ${bookId} eliminados correctamente`, 'firebase-storage');
    } catch (error) {
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
      const prefix = `usuarios/${userId}/`;
      
      // Obtenemos todos los archivos que empiezan con el prefijo
      const [files] = await bucket.getFiles({ prefix });
      
      // Eliminamos todos los archivos
      await Promise.all(files.map(file => file.delete()));
      
      log(`Todos los archivos del usuario ${userId} eliminados correctamente`, 'firebase-storage');
    } catch (error) {
      console.error('Error al eliminar todos los archivos del usuario:', error);
      throw new Error(`Error al eliminar archivos del usuario: ${error.message}`);
    }
  }
}

// Exportamos una instancia única del servicio
export const storageService = new StorageService();