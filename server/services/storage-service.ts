import { log } from '../vite';
import admin, { ServiceAccount } from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Inicialización de Firebase Admin
let isFirebaseAvailable = false;
let bucket: admin.storage.Bucket | null = null;

try {
  let serviceAccount: ServiceAccount | undefined;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.resolve(__dirname, '../firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${serviceAccount.project_id}.appspot.com`,
    });
    bucket = admin.storage().bucket();
    isFirebaseAvailable = true;
    log(`Firebase Admin inicializado con bucket ${bucket.name}`, 'firebase-storage');
  } else {
    log('Credenciales de Firebase no encontradas. Firebase Storage deshabilitado', 'firebase-storage');
  }
} catch (error) {
  log(
    `Error al inicializar Firebase Admin: ${error instanceof Error ? error.message : String(error)}`,
    'firebase-storage'
  );
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
    if (!isFirebaseAvailable || !bucket) {
      throw new Error(
        'Firebase Storage no está disponible. Por favor, configura las credenciales de Firebase.'
      );
    }

    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType } });
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
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
    if (!isFirebaseAvailable || !bucket) {
      throw new Error(
        'Firebase Storage no está disponible. Por favor, configura las credenciales de Firebase.'
      );
    }

    const [data] = await bucket.file(filePath).download();
    return data;
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
    if (!isFirebaseAvailable || !bucket) {
      log(
        `Firebase Storage no disponible - simulando eliminación: ${filePath}`,
        'firebase-storage'
      );
      return;
    }

    await bucket.file(filePath).delete({ ignoreNotFound: true });
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
    if (!isFirebaseAvailable || !bucket) {
      log(
        `Firebase Storage no disponible - simulando eliminación de archivos del libro ${bookId}`,
        'firebase-storage'
      );
      return;
    }

    await bucket.deleteFiles({ prefix: `usuarios/${userId}/libros/${bookId}/` });
  }
  
  /**
   * Elimina todos los archivos de un usuario
   * @param userId - ID del usuario
   */
  async deleteAllUserFiles(userId: number): Promise<void> {
    if (!isFirebaseAvailable || !bucket) {
      log(
        `Firebase Storage no disponible - simulando eliminación de archivos del usuario ${userId}`,
        'firebase-storage'
      );
      return;
    }

    await bucket.deleteFiles({ prefix: `usuarios/${userId}/` });
  }
}

// Exportamos una instancia única del servicio
export const storageService = new StorageService();