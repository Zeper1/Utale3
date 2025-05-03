import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "290082779890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-NLQK6PJVCC"
};

// Implementar patrón singleton para evitar inicializaciones múltiples
// Solo inicializar Firebase si aún no hay una instancia
let firebaseApp;
try {
  // Si ya existe una app, usarla
  if (getApps().length) {
    firebaseApp = getApp();
  } else {
    // Si no, inicializar una nueva app
    firebaseApp = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Error inicializando Firebase: ", error);
  // Inicializar con un nombre alternativo si hay un error
  firebaseApp = initializeApp(firebaseConfig, "utale-app");
}

export { firebaseApp };
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

/**
 * Estructura de almacenamiento:
 * - usuarios/{userId}/libros/{bookId}/imagenes/portada.jpg
 * - usuarios/{userId}/libros/{bookId}/imagenes/pagina_1.jpg
 * - usuarios/{userId}/libros/{bookId}/imagenes/pagina_2.jpg
 * - usuarios/{userId}/libros/{bookId}/libro_completo.pdf
 */

/**
 * Carga una imagen en Firebase Storage
 * @param userId - ID del usuario
 * @param bookId - ID del libro
 * @param file - Archivo a subir
 * @param pagina - Número de página (0 para portada, 1-N para páginas)
 * @returns URL de la imagen subida
 */
export async function uploadBookImage(
  userId: number, 
  bookId: number, 
  file: File | Blob, 
  pagina: number
): Promise<string> {
  try {
    const fileName = pagina === 0 ? "portada.jpg" : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
}

/**
 * Carga un PDF en Firebase Storage
 * @param userId - ID del usuario
 * @param bookId - ID del libro
 * @param file - Archivo PDF a subir
 * @returns URL del PDF subido
 */
export async function uploadBookPDF(
  userId: number, 
  bookId: number, 
  file: File | Blob
): Promise<string> {
  try {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error al subir PDF:", error);
    throw new Error(`Error al subir PDF: ${error.message}`);
  }
}

/**
 * Obtiene la URL de descarga de una imagen
 * @param userId - ID del usuario
 * @param bookId - ID del libro
 * @param pagina - Número de página (0 para portada, 1-N para páginas)
 * @returns URL de la imagen
 */
export async function getBookImageURL(
  userId: number, 
  bookId: number, 
  pagina: number
): Promise<string> {
  try {
    const fileName = pagina === 0 ? "portada.jpg" : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error al obtener URL de imagen página ${pagina}:`, error);
    throw new Error(`Error al obtener URL de imagen: ${error.message}`);
  }
}

/**
 * Obtiene la URL de descarga del PDF de un libro
 * @param userId - ID del usuario
 * @param bookId - ID del libro
 * @returns URL del PDF
 */
export async function getBookPDFURL(userId: number, bookId: number): Promise<string> {
  try {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    const storageRef = ref(storage, filePath);
    
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error al obtener URL de PDF:", error);
    throw new Error(`Error al obtener URL de PDF: ${error.message}`);
  }
}

/**
 * Elimina una imagen de Firebase Storage
 * @param userId - ID del usuario
 * @param bookId - ID del libro
 * @param pagina - Número de página (0 para portada, 1-N para páginas)
 */
export async function deleteBookImage(
  userId: number, 
  bookId: number, 
  pagina: number
): Promise<void> {
  try {
    const fileName = pagina === 0 ? "portada.jpg" : `pagina_${pagina}.jpg`;
    const filePath = `usuarios/${userId}/libros/${bookId}/imagenes/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error(`Error al eliminar imagen página ${pagina}:`, error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}

/**
 * Elimina el PDF de un libro de Firebase Storage
 * @param userId - ID del usuario
 * @param bookId - ID del libro
 */
export async function deleteBookPDF(userId: number, bookId: number): Promise<void> {
  try {
    const filePath = `usuarios/${userId}/libros/${bookId}/libro_completo.pdf`;
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error al eliminar PDF:", error);
    throw new Error(`Error al eliminar PDF: ${error.message}`);
  }
}
