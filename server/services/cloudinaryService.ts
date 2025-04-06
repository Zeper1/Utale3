import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { log } from '../vite';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

type ResourceType = 'image' | 'raw' | 'video' | 'auto';

interface UploadOptions extends Omit<UploadApiOptions, 'resource_type'> {
  folder?: string;
  public_id?: string;
  transformation?: any[];
  format?: string;
  resource_type?: ResourceType;
}

/**
 * Servicio para gestionar imágenes en Cloudinary
 */
export class CloudinaryService {
  /**
   * Sube una imagen a Cloudinary
   * @param imageData Base64 o URL de la imagen
   * @param options Opciones de carga
   */
  async uploadImage(
    imageData: string, 
    options: UploadOptions = {}
  ): Promise<{url: string; public_id: string}> {
    try {
      const defaultOptions: UploadOptions = {
        folder: 'utale',
        resource_type: 'image',
        format: 'jpg'
      };

      // Extraemos resource_type del objeto de opciones para evitar errores de tipado
      const { resource_type, ...restOptions } = {...defaultOptions, ...options};
      
      // Agregamos resource_type como un parámetro separado para cumplir con la API de Cloudinary
      const result = await cloudinary.uploader.upload(
        imageData, 
        {
          ...restOptions,
          resource_type: resource_type as "image" | "raw" | "video" | "auto" | undefined
        }
      );
      
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } catch (error) {
      log(`Error al subir imagen a Cloudinary: ${error instanceof Error ? error.message : String(error)}`, 'cloudinary');
      throw new Error('No se pudo cargar la imagen');
    }
  }

  /**
   * Sube una imagen de libro a Cloudinary
   * @param userId ID del usuario
   * @param bookId ID del libro
   * @param pageNumber Número de página
   * @param imageData Base64 o URL de la imagen
   */
  async uploadBookImage(
    userId: number,
    bookId: number,
    pageNumber: number,
    imageData: string
  ): Promise<{url: string; public_id: string}> {
    const folder = `utale/users/${userId}/books/${bookId}`;
    const public_id = `page_${pageNumber}`;
    
    return this.uploadImage(imageData, {
      folder,
      public_id,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Sube una imagen de portada de libro a Cloudinary
   * @param userId ID del usuario
   * @param bookId ID del libro
   * @param imageData Base64 o URL de la imagen
   */
  async uploadBookCover(
    userId: number,
    bookId: number,
    imageData: string
  ): Promise<{url: string; public_id: string}> {
    const folder = `utale/users/${userId}/books/${bookId}`;
    const public_id = 'cover';
    
    return this.uploadImage(imageData, {
      folder,
      public_id,
      transformation: [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Sube una imagen de perfil de personaje a Cloudinary
   * @param userId ID del usuario
   * @param characterId ID del personaje
   * @param imageData Base64 o URL de la imagen
   */
  async uploadCharacterImage(
    userId: number,
    characterId: number,
    imageData: string
  ): Promise<{url: string; public_id: string}> {
    const folder = `utale/users/${userId}/characters`;
    const public_id = `character_${characterId}`;
    
    return this.uploadImage(imageData, {
      folder,
      public_id,
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Elimina una imagen de Cloudinary
   * @param public_id ID público de la imagen
   */
  async deleteImage(public_id: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(public_id);
      return result.result === 'ok';
    } catch (error) {
      log(`Error al eliminar imagen de Cloudinary: ${error instanceof Error ? error.message : String(error)}`, 'cloudinary');
      return false;
    }
  }

  /**
   * Optimiza una URL de imagen existente para diferentes propósitos
   * @param url URL original de Cloudinary
   * @param purpose Propósito (thumbnail, preview, full)
   */
  getOptimizedUrl(url: string, purpose: 'thumbnail' | 'preview' | 'full' = 'full'): string {
    if (!url.includes('cloudinary.com')) {
      return url; // No es una URL de Cloudinary
    }

    const transformations = {
      thumbnail: 'c_thumb,w_200,h_200,q_auto:good',
      preview: 'w_600,q_auto:good',
      full: 'q_auto:good,f_auto'
    };

    // Buscar el patrón /upload/ y reemplazarlo por /upload/TRANSFORMACIÓN/
    return url.replace(/\/upload\//, `/upload/${transformations[purpose]}/`);
  }
}

// Exportamos una instancia única del servicio
export const cloudinaryService = new CloudinaryService();