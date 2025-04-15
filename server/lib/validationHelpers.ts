import { z } from "zod";
import { insertCharacterSchema, insertBookSchema } from "@shared/schema";

/**
 * Esquema de validación mejorado para los personajes
 * Incluye reglas sobre campos obligatorios basados en el tipo de personaje
 */
export const enhancedCharacterSchema = insertCharacterSchema
  .refine(
    (data) => data.name && data.name.trim().length > 0,
    {
      message: "El nombre del personaje es obligatorio",
      path: ["name"],
    }
  )
  .refine(
    (data) => data.type && data.type.trim().length > 0,
    {
      message: "El tipo de personaje es obligatorio",
      path: ["type"],
    }
  )
  .refine(
    (data) => {
      // La edad es obligatoria solo para tipos específicos
      if (["niño", "niña", "adulto", "adulta"].includes(data.type || "")) {
        // Verificar si age es un número o string
        if (typeof data.age === 'number') {
          return data.age > 0;
        } else if (typeof data.age === 'string') {
          return data.age.trim().length > 0;
        }
        return false;
      }
      return true;
    },
    {
      message: "La edad es obligatoria para personajes de tipo niño/a o adulto",
      path: ["age"],
    }
  );

/**
 * Esquema de validación mejorado para los libros
 * Incluye reglas sobre campos obligatorios
 */
export const enhancedBookSchema = insertBookSchema
  .refine(
    (data) => data.title && data.title.trim().length > 0,
    {
      message: "El título del libro es obligatorio",
      path: ["title"],
    }
  )
  .refine(
    (data) => data.userId !== undefined && data.userId !== null,
    {
      message: "El ID de usuario es obligatorio",
      path: ["userId"],
    }
  )
  .refine(
    (data) => {
      // Validar que el contenido tenga la estructura mínima necesaria
      if (!data.content) return false;
      
      // Si es string, intentar parsearlo como JSON
      const content = typeof data.content === 'string' 
        ? JSON.parse(data.content) 
        : data.content;
      
      return (
        content &&
        Array.isArray(content.pages) &&
        content.pages.length > 0 &&
        content.title
      );
    },
    {
      message: "El contenido del libro debe incluir al menos título y páginas",
      path: ["content"],
    }
  );

/**
 * Esquema para validar los detalles específicos de la historia
 */
export const storyDetailsSchema = z.object({
  pageCount: z.number().min(1).max(40).optional(),
  style: z.string().optional(),
  tone: z.string().optional(),
  setting: z.string().optional(),
  message: z.string().optional(),
  specificElements: z.array(z.string()).optional(),
  characterDetails: z.record(z.string(), z.object({
    role: z.string().optional(),
    abilities: z.string().optional(),
    details: z.string().optional(),
    relationToMain: z.string().optional()
  })).optional()
});

/**
 * Esquema para validar solicitudes de generación de contenido de libro
 */
export const generateBookContentSchema = z.object({
  characterIds: z.array(z.number()).min(1, {
    message: "Al menos un ID de personaje es requerido"
  }),
  themeId: z.number().optional(),
  storyDetails: storyDetailsSchema.optional()
});

/**
 * Esquema para validar solicitudes de generación de imágenes
 */
export const generateBookImagesSchema = z.object({
  bookContent: z.object({
    title: z.string(),
    pages: z.array(z.object({
      pageNumber: z.number(),
      text: z.string(),
      imagePrompt: z.string()
    })),
    targetAge: z.string().optional(),
    theme: z.string().optional()
  }),
  bookId: z.union([z.number(), z.string()]).optional(),
  characterDetails: z.array(z.any()).optional()
});

/**
 * Valida si un objeto cumple con el esquema, devolviendo errores formateados
 * @param schema Esquema zod a aplicar
 * @param data Datos a validar
 * @returns Un objeto con éxito/fracaso y errores formateados si los hay
 */
export function validateWithSchema<T>(schema: z.ZodSchema<any>, data: any): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors: formattedErrors };
    }
    
    return { 
      success: false, 
      errors: ['Error de validación desconocido'] 
    };
  }
}