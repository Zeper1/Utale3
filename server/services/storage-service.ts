import admin from 'firebase-admin';
import { log } from '../vite';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

let bucket: admin.storage.Storage['Bucket'] | null = null;

try {
  if (projectId && clientEmail && privateKey && storageBucket) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
    bucket = admin.storage().bucket();
  } else {
    log('Firebase configuration variables missing; storage disabled', 'firebase-storage');
  }
} catch (err) {
  log(`Error initializing Firebase: ${err instanceof Error ? err.message : String(err)}`, 'firebase-storage');
}

function ensureBucket(): admin.storage.Storage['Bucket'] {
  if (!bucket) {
    throw new Error('Firebase Storage is not configured');
  }
  return bucket;
}

export class StorageService {
  async uploadFile(buffer: Buffer, filePath: string, contentType: string): Promise<string> {
    const b = ensureBucket();
    const file = b.file(filePath);
    await file.save(buffer, { contentType, resumable: false });
    return `https://storage.googleapis.com/${b.name}/${filePath}`;
  }

  async uploadBookImage(userId: number, bookId: number, buffer: Buffer, pagina: number): Promise<string> {
    const fileName = pagina === 0 ? 'portada.jpg' : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    return this.uploadFile(buffer, filePath, 'image/jpeg');
  }

  async uploadBookPDF(userId: number, bookId: number, buffer: Buffer): Promise<string> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    return this.uploadFile(buffer, filePath, 'application/pdf');
  }

  async uploadCharacterImage(userId: number, characterId: number, buffer: Buffer): Promise<string> {
    const filePath = `usuarios/${userId}/characters/character_${characterId}.jpg`;
    return this.uploadFile(buffer, filePath, 'image/jpeg');
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    const b = ensureBucket();
    const [data] = await b.file(filePath).download();
    return data;
  }

  async downloadBookImage(userId: number, bookId: number, pagina: number): Promise<Buffer> {
    const fileName = pagina === 0 ? 'portada.jpg' : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    return this.downloadFile(filePath);
  }

  async downloadBookPDF(userId: number, bookId: number): Promise<Buffer> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    return this.downloadFile(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    const b = ensureBucket();
    await b.file(filePath).delete({ ignoreNotFound: true });
  }

  async deleteBookImage(userId: number, bookId: number, pagina: number): Promise<void> {
    const fileName = pagina === 0 ? 'portada.jpg' : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    await this.deleteFile(filePath);
  }

  async deleteBookPDF(userId: number, bookId: number): Promise<void> {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    await this.deleteFile(filePath);
  }

  async deleteAllBookFiles(userId: number, bookId: number): Promise<void> {
    const b = ensureBucket();
    await b.deleteFiles({ prefix: `usuarios/${userId}/libros/${bookId}/` });
  }

  async deleteAllUserFiles(userId: number): Promise<void> {
    const b = ensureBucket();
    await b.deleteFiles({ prefix: `usuarios/${userId}/` });
  }
}

export const storageService = new StorageService();
