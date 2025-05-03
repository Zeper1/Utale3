import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCharacterSchema, 
  insertBookSchema, 
  insertOrderSchema,
  insertSubscriptionSchema,
  insertSubscriptionTierSchema,
  insertBookDeliverySchema,
  insertBookDraftSchema
} from "@shared/schema";
import { getPriceTier, getRecommendedTiers } from "@shared/pricing";
import OpenAI from "openai";
import { z } from "zod";
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";
import * as crypto from "crypto";
import { createLogger, LogLevel } from "./lib/logger";
import { 
  generateSystemPrompt, 
  generateUserPrompt, 
  generateEnhancedImagePrompt, 
  processCharacterWithStoryDetails,
  type ExtendedCharacter 
} from "./lib/promptEngineering";
import { 
  validateWithSchema, 
  generateBookContentSchema, 
  generateBookImagesSchema 
} from "./lib/validationHelpers";
import { storageService } from "./services/storage-service";

// Crear loggers específicos para diferentes operaciones
const apiLogger = createLogger('api');
const authLogger = createLogger('auth');
const bookLogger = createLogger('books');
const characterLogger = createLogger('characters');
const paymentLogger = createLogger('payments');
const subscriptionLogger = createLogger('subscriptions');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_development"
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_development", {
  apiVersion: "2025-02-24.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // --- User Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      authLogger.info("Intento de registro de nuevo usuario", { 
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      const userData = insertUserSchema.parse(req.body);
      authLogger.debug("Datos de usuario validados correctamente", { 
        email: userData.email, 
        username: userData.username 
      });
      
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        authLogger.warn("Intento de registro con email ya existente", { 
          email: userData.email 
        });
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      authLogger.info("Usuario registrado exitosamente", { 
        userId: newUser.id,
        username: newUser.username 
      });
      
      res.status(201).json({ 
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        authLogger.warn("Datos de registro inválidos", { 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        });
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      authLogger.error("Error en registro de usuario", { 
        error: error instanceof Error ? error.stack : String(error) 
      });
      res.status(500).json({ message: "Failed to create user account" });
    }
  });

  app.post("/api/auth/firebase-auth", async (req, res) => {
    try {
      const { firebaseUserId, email, displayName } = req.body;
      
      authLogger.info("Intento de autenticación con Firebase", { 
        firebaseUserId: firebaseUserId ? firebaseUserId.substring(0, 8) + '...' : 'undefined',
        email: email || 'undefined',
        ip: req.ip
      });
      
      if (!firebaseUserId || !email) {
        authLogger.warn("Autenticación Firebase rechazada: datos incompletos", {
          hasFirebaseId: !!firebaseUserId,
          hasEmail: !!email,
          ip: req.ip
        });
        return res.status(400).json({ message: "Firebase user ID and email are required" });
      }
      
      // Check if user exists by Firebase ID
      let user = await storage.getUserByFirebaseId(firebaseUserId);
      
      if (!user) {
        authLogger.debug("Usuario no encontrado por Firebase ID, buscando por email", { email });
        // Check if user exists by email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          authLogger.info("Vinculando cuenta existente con Firebase", { 
            userId: user.id, 
            email: user.email 
          });
          // Update existing user with Firebase ID
          user = await storage.updateUser(user.id, { firebaseUserId });
        } else {
          // Create new user
          const username = email.split('@')[0];
          authLogger.info("Creando nuevo usuario desde Firebase", { 
            email, 
            username 
          });
          
          user = await storage.createUser({
            username,
            email,
            password: Math.random().toString(36).slice(2), // Random password for Firebase users
            displayName: displayName || username,
            firebaseUserId
          });
        }
      } else {
        authLogger.info("Usuario autenticado con Firebase", { 
          userId: user.id, 
          email: user.email 
        });
      }
      
      if (!user) {
        authLogger.error("Error crítico: Usuario nulo después de autenticación", {
          firebaseUserId: firebaseUserId.substring(0, 8) + '...'
        });
        return res.status(500).json({ message: "Error en la autenticación de Firebase" });
      }
      
      res.status(200).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName 
      });
    } catch (error) {
      authLogger.error("Error en autenticación Firebase", { 
        error: error instanceof Error ? error.stack : String(error) 
      });
      res.status(500).json({ message: "Failed to process Firebase authentication" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  // --- Character Routes ---
  app.get("/api/users/:userId/characters", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const characters = await storage.getCharacters(userId);
      res.status(200).json(characters);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener personajes" });
    }
  });
  
  // Ruta legacy para mantener compatibilidad
  app.get("/api/users/:userId/profiles", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const characters = await storage.getCharacters(userId);
      res.status(200).json(characters);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener perfiles de personajes" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character profile not found" });
      }
      
      res.status(200).json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve character profile" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse(req.body);
      const newCharacter = await storage.createCharacter(characterData);
      res.status(201).json(newCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create character profile" });
    }
  });

  app.put("/api/profiles/:id", async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const characterData = req.body;
      
      const updatedCharacter = await storage.updateCharacter(characterId, characterData);
      
      if (!updatedCharacter) {
        return res.status(404).json({ message: "Character profile not found" });
      }
      
      res.status(200).json(updatedCharacter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update character profile" });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const success = await storage.deleteCharacter(characterId);
      
      if (!success) {
        return res.status(404).json({ message: "Character profile not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character profile" });
    }
  });

  // --- Book Theme Routes ---
  app.get("/api/book-themes", async (req, res) => {
    try {
      const themes = await storage.getBookThemes();
      res.status(200).json(themes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve book themes" });
    }
  });

  app.get("/api/book-themes/:id", async (req, res) => {
    try {
      const themeId = parseInt(req.params.id);
      const theme = await storage.getBookTheme(themeId);
      
      if (!theme) {
        return res.status(404).json({ message: "Book theme not found" });
      }
      
      res.status(200).json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve book theme" });
    }
  });

  // --- Book Routes ---
  app.get("/api/users/:userId/books", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const books = await storage.getBooks(userId);
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve books" });
    }
  });

  app.get("/api/profiles/:profileId/books", async (req, res) => {
    try {
      const characterId = parseInt(req.params.profileId);
      const books = await storage.getBooksByCharacter(characterId);
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Obtener los personajes asociados con este libro
      const bookCharacters = await storage.getBookCharacters(bookId);
      
      // Crear un objeto de respuesta con el libro y sus personajes
      const response = {
        ...book,
        characters: bookCharacters
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to retrieve book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const newBook = await storage.createBook(bookData);
      res.status(201).json(newBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const bookData = req.body;
      
      const updatedBook = await storage.updateBook(bookId, bookData);
      
      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(200).json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const success = await storage.deleteBook(bookId);
      
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Las rutas de chat han sido eliminadas

  // --- Book Generation with OpenAI ---
  app.post("/api/generate-book", async (req, res) => {
    try {
      const { characterId, themeId } = req.body;
      
      bookLogger.info("Solicitud de generación de libro recibida", {
        characterId,
        themeId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      if (!characterId || !themeId) {
        bookLogger.warn("Solicitud rechazada: faltan datos requeridos", {
          hasCharacterId: !!characterId,
          hasThemeId: !!themeId
        });
        return res.status(400).json({ message: "Character ID and theme ID are required" });
      }
      
      const character = await storage.getCharacter(parseInt(characterId));
      const theme = await storage.getBookTheme(parseInt(themeId));
      
      if (!character) {
        bookLogger.warn("Personaje no encontrado", { characterId });
        return res.status(404).json({ message: "Character profile not found" });
      }
      
      if (!theme) {
        bookLogger.warn("Tema no encontrado", { themeId });
        return res.status(404).json({ message: "Book theme not found" });
      }
      
      bookLogger.info("Iniciando generación de contenido con OpenAI", {
        characterName: character.name,
        characterType: character.type,
        themeName: theme.name,
        model: "gpt-4o"
      });
      
      // Generate book content with OpenAI
      const startTime = Date.now();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Crea un libro infantil personalizado con el tema: ${theme.name}. 
                     La historia debe ser apropiada para niños de ${theme.ageRange || '5-10'} años.
                     Crea un objeto JSON con la siguiente estructura:
                     {
                       "title": "Título de la historia incluyendo el nombre del personaje",
                       "pages": [
                         {
                          "text": "Texto de la página con narración de la historia",
                          "illustration_prompt": "Descripción detallada para ilustrar esta página"
                         }
                         // 10 páginas en total
                       ]
                     }`
          },
          {
            role: "user",
            content: `Crea una historia para ${character.name}, tipo: ${character.type || 'niño'}, edad: ${character.age || 'escolar'}.
                     Intereses: ${character.interests ? character.interests.join(', ') : 'juegos, aventuras, descubrimientos'}
                     Cosas favoritas: ${character.favorites ? JSON.stringify(character.favorites) : '{"color": "azul", "animal": "perro"}'}
                     Amigos: ${character.relationships?.friends ? character.relationships.friends.join(', ') : 'amigos imaginarios'}
                     Rasgos de personalidad: ${character.traits ? character.traits.join(', ') : 'curioso, amigable, creativo'}`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      const bookContent = JSON.parse(completion.choices[0].message.content || "{}");
      
      bookLogger.info("Contenido del libro generado exitosamente", {
        title: bookContent.title,
        pageCount: bookContent.pages?.length || 0,
        characterId,
        themeId,
        processingTimeMs: processingTime,
        modelUsed: "gpt-4o",
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      });
      
      res.status(200).json(bookContent);
    } catch (error) {
      bookLogger.error("Error en la generación del libro", {
        error: error instanceof Error ? error.stack : String(error),
        characterId: req.body.characterId,
        themeId: req.body.themeId,
      });
      res.status(500).json({ message: "Failed to generate book content" });
    }
  });

  // --- Payment Routes ---
  // Stripe Payment Intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookId, userId, format } = req.body;
      
      paymentLogger.info("Solicitud de intención de pago recibida", {
        amount,
        bookId,
        userId,
        format,
        ip: req.ip
      });
      
      if (!amount || !bookId || !userId || !format) {
        paymentLogger.warn("Solicitud de pago rechazada: datos incompletos", {
          hasAmount: !!amount,
          hasBookId: !!bookId, 
          hasUserId: !!userId,
          hasFormat: !!format,
          ip: req.ip
        });
        return res.status(400).json({ message: "Amount, book ID, user ID, and format are required" });
      }
      
      paymentLogger.debug("Creando intención de pago en Stripe", {
        amountInCents: Math.round(amount * 100),
        currency: "eur",
        bookId,
        userId,
        format
      });
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur", // Cambiado a euros para el mercado español
        metadata: {
          bookId: bookId.toString(),
          userId: userId.toString(),
          format
        }
      });
      
      paymentLogger.info("Intención de pago creada exitosamente", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        userId,
        bookId
      });
      
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      paymentLogger.error("Error al crear intención de pago en Stripe", {
        error: error instanceof Error ? error.stack : String(error),
        amount: req.body?.amount,
        bookId: req.body?.bookId,
        userId: req.body?.userId
      });
      res.status(500).json({ message: "Payment processing error" });
    }
  });
  
  // Stripe Webhook
  app.post("/api/stripe-webhook", async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'] as string;
    let event;
    
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      paymentLogger.info("Webhook de Stripe recibido", {
        hasSignature: !!sig,
        hasEndpointSecret: !!endpointSecret,
        payloadSize: JSON.stringify(payload).length
      });
      
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        paymentLogger.debug("Evento de Stripe verificado correctamente", {
          eventType: event.type,
          eventId: event.id
        });
      } else {
        event = payload;
        paymentLogger.warn("Webhook procesado sin verificación de firma", {
          eventType: event.type,
          environment: process.env.NODE_ENV
        });
      }
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Handle successful payment
        const bookId = parseInt(paymentIntent.metadata.bookId);
        const userId = parseInt(paymentIntent.metadata.userId);
        const format = paymentIntent.metadata.format;
        
        paymentLogger.info("Pago exitoso recibido", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          bookId,
          userId,
          format
        });
        
        // Update book status
        const updatedBook = await storage.updateBook(bookId, { 
          status: 'completed',
          format,
          orderReference: paymentIntent.id
        });
        
        paymentLogger.debug("Estado del libro actualizado", {
          bookId,
          newStatus: 'completed',
          format,
          orderReference: paymentIntent.id
        });
        
        // Create order record
        const newOrder = await storage.createOrder({
          userId,
          bookId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentMethod: 'stripe',
          paymentId: paymentIntent.id,
          status: 'completed',
          shippingAddress: {} // This would be populated with actual shipping info
        });
        
        paymentLogger.info("Pedido creado correctamente", {
          orderId: newOrder.id,
          userId,
          bookId,
          status: 'completed'
        });
      } else {
        paymentLogger.debug("Evento de Stripe ignorado (no es payment_intent.succeeded)", {
          eventType: event.type
        });
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      paymentLogger.error("Error en webhook de Stripe", {
        error: error instanceof Error ? error.stack : String(error),
        hasSignature: !!sig,
        eventType: event?.type
      });
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // --- Order Routes ---
  app.get("/api/users/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrders(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  });

  // --- Advanced Book Generation Routes ---
  
  // Generate book content with AI
  app.post("/api/books/generate-content", async (req: Request, res: Response) => {
    try {
      // Validar datos usando el esquema
      const validation = validateWithSchema(generateBookContentSchema, req.body);
      if (!validation.success) {
        bookLogger.warn("Validación fallida para generación de contenido", {
          errors: validation.errors
        });
        return res.status(400).json({ 
          message: "Datos de solicitud inválidos", 
          errors: validation.errors 
        });
      }

      const { characterIds, themeId, storyDetails } = validation.data;
      
      bookLogger.info("Solicitud de generación avanzada de contenido recibida", {
        characterCount: characterIds.length,
        themeId: themeId || 'personalizado',
        requestedPageCount: storyDetails?.pageCount || 12,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Obtener el número de páginas solicitado (excluyendo la portada)
      const requestedPageCount = storyDetails?.pageCount || 12;
      
      bookLogger.debug("Procesando solicitud de generación de libro multi-personaje", {
        characterIds,
        pageCount: requestedPageCount,
        hasThemeId: !!themeId,
        hasStoryDetails: !!storyDetails
      });
      
      // Obtener todos los personajes y procesar con detalles específicos
      const enrichedCharacters = [];
      for (const id of characterIds) {
        const character = await storage.getCharacter(id);
        if (!character) {
          return res.status(404).json({ message: `Personaje con ID ${id} no encontrado` });
        }
        
        // Buscar detalles específicos para este personaje en esta historia (si existen)
        const characterDetails = storyDetails?.characterDetails?.[id.toString()];
        
        // Procesar el personaje con los detalles específicos
        const enrichedCharacter = processCharacterWithStoryDetails(character, characterDetails);
        enrichedCharacters.push(enrichedCharacter);
      }
      
      // Obtener el tema (ya sea ID o detalles personalizados)
      let theme;
      if (themeId) {
        theme = await storage.getBookTheme(themeId);
        if (!theme) {
          return res.status(404).json({ message: "Tema de libro no encontrado" });
        }
      } else if (storyDetails) {
        // Si no hay ID de tema pero hay detalles de la historia, usamos esos directamente
        theme = {
          name: storyDetails.setting || "Aventura personalizada",
          description: storyDetails.message || "Una historia personalizada",
          ageRange: "5-10" // Valor predeterminado
        };
      } else {
        return res.status(400).json({ message: "Se requiere un tema o detalles de la historia" });
      }

      // Personaje principal (el primero de la lista)
      const mainCharacter = enrichedCharacters[0];
      
      // Personajes secundarios (resto de la lista)
      const supportingCharacters = enrichedCharacters.slice(1);
      
      // Generate book content with OpenAI
      bookLogger.info("Iniciando generación de contenido avanzado con OpenAI", {
        modelo: "gpt-4o",
        characterCount: enrichedCharacters.length,
        supportingCharacterCount: supportingCharacters.length,
        themeName: theme.name,
        pageCount: requestedPageCount
      });
      
      const startTime = Date.now();
      
      // Generar el prompt del sistema utilizando nuestra función de ingeniería de prompts
      const systemPrompt = generateSystemPrompt(theme.name);
      
      // Generar el prompt del usuario con todos los detalles de personajes y tema
      const userPrompt = generateUserPrompt(
        mainCharacter,
        supportingCharacters,
        theme as any, // Hack temporal para manejar los diferentes tipos de theme
        requestedPageCount,
        storyDetails
      );
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2500
      });
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      const bookContent = JSON.parse(completion.choices[0].message.content || "{}");
      
      bookLogger.info("Contenido del libro multi-personaje generado exitosamente", {
        title: bookContent.title,
        pageCount: bookContent.pages?.length || 0,
        characterCount: enrichedCharacters.length,
        themeName: theme.name,
        processingTimeMs: processingTime,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      });
      
      res.status(200).json(bookContent);
    } catch (error) {
      bookLogger.error("Error en la generación avanzada del libro", {
        error: error instanceof Error ? error.stack : String(error),
        characterCount: req.body.characterIds?.length || 0,
        themeId: req.body.themeId,
        requestedPageCount: req.body.storyDetails?.pageCount
      });
      res.status(500).json({ message: "Failed to generate book content" });
    }
  });

  // Generate images for book
  app.post("/api/books/generate-images", async (req: Request, res: Response) => {
    try {
      const { bookContent, bookId } = req.body;
      
      bookLogger.info("Solicitud de generación de imágenes recibida", {
        bookId: bookId || 'preview',
        pageCount: bookContent?.pages?.length || 0,
        title: bookContent?.title || 'unknown',
        ip: req.ip
      });
      
      if (!bookContent || !bookContent.pages) {
        bookLogger.warn("Solicitud de imágenes rechazada: falta contenido", {
          hasBookContent: !!bookContent,
          hasPages: !!(bookContent && bookContent.pages)
        });
        return res.status(400).json({ message: "Book content with pages is required" });
      }
      
      // Obtenemos el usuario autenticado para guardar las imágenes en su carpeta
      // Si no hay usuario autenticado, usamos un ID predeterminado solo para desarrollo
      const userId = (req as any).user && 'id' in (req as any).user ? ((req as any).user.id as number) : 1;
      
      bookLogger.debug("Iniciando generación de imágenes para libro", {
        userId,
        bookId: bookId || 'preview',
        pageCount: bookContent.pages.length
      });
      
      // Importamos el servicio de Cloudinary
      const { cloudinaryService } = await import('./services/cloudinaryService');
      
      // Process each page and generate an image
      const processedContent = { ...bookContent };
      const generationStartTime = Date.now();
      let successCount = 0;
      let failureCount = 0;
      
      // Generate images for each page (sequentially to avoid rate limiting)
      for (let i = 0; i < processedContent.pages.length; i++) {
        const page = processedContent.pages[i];
        const pageStartTime = Date.now();
        
        try {
          bookLogger.debug(`Generando imagen para página ${i+1}/${processedContent.pages.length}`, {
            pageNumber: page.pageNumber,
            bookId: bookId || 'preview'
          });
          
          // Obtener los personajes del libro si están disponibles
          let charactersList: ExtendedCharacter[] = [];
          if (processedContent.characters && Array.isArray(processedContent.characters)) {
            // Crear objetos de personaje a partir de los nombres
            charactersList = processedContent.characters.map((name: string, index: number) => ({
              id: index + 1,
              name,
              type: 'personaje',
              createdAt: new Date(),
              updatedAt: new Date(),
              userId: userId,
              age: null,
              gender: null,
              physicalDescription: null,
              personality: null,
              interests: [],
              likes: null,
              dislikes: null,
              favorites: {},
              relationships: null,
              additionalInfo: null,
              // Campos extendidos para personajes
              specificRole: null,
              specialAbilities: null,
              storySpecificDetails: null,
              relationToMainCharacter: index === 0 ? null : 'personaje secundario'
            }));
          }

          // Usar nuestra función avanzada de generación de prompts para imágenes
          const enhancedPrompt = generateEnhancedImagePrompt(
            {
              pageNumber: page.pageNumber,
              text: page.text,
              imagePrompt: page.imagePrompt
            },
            {
              title: processedContent.title,
              targetAge: processedContent.targetAge,
              theme: processedContent.theme
            },
            charactersList
          );

          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd", // Calidad mejorada
            style: "vivid", // Estilo más colorido y vibrante
          });
          
          // Obtiene la URL de la imagen generada por DALL-E
          const tempImageUrl = imageResponse.data[0].url;
          
          // Asegurarnos de que tenemos una URL válida
          if (!tempImageUrl) {
            throw new Error("No se obtuvo URL de imagen desde OpenAI");
          }
          
          bookLogger.debug(`Imagen generada con DALL-E, subiendo a Cloudinary`, {
            pageNumber: page.pageNumber,
            hasImageUrl: !!tempImageUrl,
            processTimeMs: Date.now() - pageStartTime
          });
          
          // Subimos la imagen a Cloudinary y obtenemos una URL permanente
          let cloudinaryResult;
          
          if (bookId) {
            // Si tenemos un ID de libro, almacenamos en la estructura de carpetas correcta
            cloudinaryResult = await cloudinaryService.uploadBookImage(
              userId, 
              typeof bookId === 'string' ? parseInt(bookId) : bookId, 
              page.pageNumber, 
              tempImageUrl
            );
          } else {
            // Si no hay ID (modo preview), usamos una carpeta temporal
            cloudinaryResult = await cloudinaryService.uploadImage(tempImageUrl, {
              folder: `utale/temp/${userId}`,
              public_id: `preview_page_${page.pageNumber}_${Date.now()}`,
              transformation: [
                { quality: "auto:good" },
                { fetch_format: "auto" }
              ]
            });
          }
          
          // Guardamos la URL optimizada de Cloudinary
          processedContent.pages[i].imageUrl = cloudinaryResult.url;
          
          // También guardamos el public_id para posible eliminación futura si es necesario
          processedContent.pages[i].imagePublicId = cloudinaryResult.public_id;
          
          bookLogger.info(`Imagen para página ${page.pageNumber} generada y almacenada correctamente`, {
            pageNumber: page.pageNumber,
            bookId: bookId || 'preview',
            cloudinaryPublicId: cloudinaryResult.public_id,
            cloudinaryFolder: (cloudinaryResult as any).folder,
            totalProcessTimeMs: Date.now() - pageStartTime
          });
          
          successCount++;
        } catch (imgError) {
          bookLogger.error(`Error al generar imagen para página ${i+1}`, {
            error: imgError instanceof Error ? imgError.stack : String(imgError),
            pageNumber: page.pageNumber,
            bookId: bookId || 'preview',
            processTimeMs: Date.now() - pageStartTime
          });
          failureCount++;
          // Continue with other pages even if one fails
        }
      }
      
      const totalProcessTime = Date.now() - generationStartTime;
      
      bookLogger.info("Proceso de generación de imágenes completado", {
        bookId: bookId || 'preview',
        totalPages: processedContent.pages.length,
        successCount,
        failureCount,
        totalProcessTimeMs: totalProcessTime,
        avgTimePerPageMs: totalProcessTime / processedContent.pages.length
      });
      
      res.status(200).json(processedContent);
    } catch (error) {
      bookLogger.error("Error general en generación de imágenes", {
        error: error instanceof Error ? error.stack : String(error),
        bookId: req.body.bookId || 'unknown'
      });
      res.status(500).json({ message: "Failed to generate book images" });
    }
  });

  // Create PDF version of the book
  app.post("/api/books/create-pdf", async (req: Request, res: Response) => {
    try {
      const { bookId } = req.body;
      
      bookLogger.info("Solicitud de creación de PDF recibida", {
        bookId: bookId || 'unknown',
        ip: req.ip
      });
      
      if (!bookId) {
        bookLogger.warn("Solicitud rechazada: ID de libro requerido", {
          ip: req.ip
        });
        return res.status(400).json({ message: "Book ID is required" });
      }
      
      const book = await storage.getBook(parseInt(bookId.toString()));
      
      if (!book) {
        bookLogger.warn("Libro no encontrado para generación de PDF", {
          bookId
        });
        return res.status(404).json({ message: "Book not found" });
      }
      
      bookLogger.debug("Iniciando generación de PDF para libro", {
        bookId: book.id,
        title: book.title,
        userId: book.userId
      });
      
      // In a real implementation, you would use a PDF generation library
      // For now, we'll just simulate PDF creation
      const pdfUrl = `/api/books/${bookId}/download`;
      
      // Update book with PDF URL
      const updatedBook = await storage.updateBook(book.id, { 
        orderReference: pdfUrl,
        status: 'completed'
      });
      
      bookLogger.info("PDF generado exitosamente para libro", {
        bookId: book.id,
        pdfUrl,
        newStatus: 'completed'
      });
      
      res.status(200).json({ url: pdfUrl });
    } catch (error) {
      bookLogger.error("Error al crear PDF de libro", {
        error: error instanceof Error ? error.stack : String(error),
        bookId: req.body?.bookId
      });
      res.status(500).json({ message: "Failed to create PDF" });
    }
  });

  // Download book as PDF
  app.get("/api/books/:id/download", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      
      bookLogger.info("Solicitud de descarga de libro recibida", {
        bookId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        bookLogger.warn("Libro no encontrado para descarga", {
          bookId,
          ip: req.ip
        });
        return res.status(404).json({ message: "Book not found" });
      }
      
      bookLogger.debug("Procesando descarga de libro", {
        bookId: book.id,
        userId: book.userId,
        title: book.title,
        status: book.status
      });
      
      // In a real implementation, you would generate a PDF file
      // For now, we'll just send a mock response
      res.setHeader('Content-Type', 'application/json');
      
      bookLogger.info("Libro descargado exitosamente", {
        bookId: book.id,
        userId: book.userId,
        format: 'JSON (simulado)'
      });
      
      res.status(200).json({ 
        message: "This endpoint would serve the PDF file for download", 
        bookTitle: book.title 
      });
    } catch (error) {
      bookLogger.error("Error al descargar libro", {
        error: error instanceof Error ? error.stack : String(error),
        bookId: req.params.id
      });
      res.status(500).json({ message: "Failed to download book" });
    }
  });
  
  // Update book status
  app.patch("/api/books/:id/status", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const { status } = req.body;
      
      bookLogger.info("Solicitud de actualización de estado de libro recibida", {
        bookId,
        newStatus: status || 'undefined',
        ip: req.ip
      });
      
      if (!status) {
        bookLogger.warn("Solicitud rechazada: estado requerido", {
          bookId,
          ip: req.ip
        });
        return res.status(400).json({ message: "Status is required" });
      }
      
      const book = await storage.getBook(bookId);
      if (!book) {
        bookLogger.warn("Libro no encontrado para actualización de estado", {
          bookId
        });
        return res.status(404).json({ message: "Book not found" });
      }
      
      bookLogger.debug("Actualizando estado de libro", {
        bookId,
        oldStatus: book.status,
        newStatus: status,
        userId: book.userId
      });
      
      const updatedBook = await storage.updateBook(bookId, { status });
      
      if (!updatedBook) {
        bookLogger.error("Error al actualizar estado del libro", {
          bookId,
          status
        });
        return res.status(404).json({ message: "Book not found" });
      }
      
      bookLogger.info("Estado de libro actualizado exitosamente", {
        bookId: updatedBook.id,
        oldStatus: book.status,
        newStatus: updatedBook.status
      });
      
      res.status(200).json(updatedBook);
    } catch (error) {
      bookLogger.error("Error en la actualización de estado de libro", {
        error: error instanceof Error ? error.stack : String(error),
        bookId: req.params.id,
        status: req.body?.status
      });
      res.status(500).json({ message: "Failed to update book status" });
    }
  });
  
  // Create book preview
  app.post("/api/books/:id/preview", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      
      bookLogger.info("Solicitud de creación de previsualización recibida", {
        bookId,
        ip: req.ip
      });
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        bookLogger.warn("Libro no encontrado para crear previsualización", {
          bookId
        });
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Generate a preview image for the book (first page/cover)
      const bookContent = book.content as any;
      if (!bookContent || !bookContent.pages || bookContent.pages.length === 0) {
        bookLogger.warn("Libro sin contenido para crear previsualización", {
          bookId,
          hasContent: !!bookContent,
          hasPages: !!(bookContent && bookContent.pages),
          pageCount: bookContent?.pages?.length || 0
        });
        return res.status(400).json({ message: "Book has no content" });
      }
      
      const coverPage = bookContent.pages[0];
      
      bookLogger.debug("Procesando previsualización del libro", {
        bookId,
        userId: book.userId,
        hasCoverImage: !!coverPage.imageUrl
      });
      
      // Si no hay una imagen de portada, no podemos crear una previsualización
      if (!coverPage.imageUrl) {
        bookLogger.warn("Portada sin imagen para crear previsualización", {
          bookId
        });
        return res.status(400).json({ message: "El libro no tiene imagen de portada" });
      }
      
      // Importamos el servicio de Cloudinary
      const { cloudinaryService } = await import('./services/cloudinaryService');
      
      try {
        // Subir la imagen de portada a Cloudinary como portada del libro
        const uploadResult = await cloudinaryService.uploadBookCover(
          book.userId,
          bookId,
          coverPage.imageUrl
        );
        
        bookLogger.debug("Imagen de portada subida a Cloudinary", {
          bookId,
          publicId: uploadResult.public_id
        });
        
        // Obtener una URL optimizada para la previsualización (tamaño reducido)
        const previewImage = cloudinaryService.getOptimizedUrl(uploadResult.url, 'preview');
        
        // Actualizar el libro con la URL de la previsualización
        const updatedBook = await storage.updateBook(bookId, { previewImage });
        
        bookLogger.info("Previsualización del libro creada exitosamente", {
          bookId,
          hasPreviewImage: !!updatedBook?.previewImage
        });
        
        res.status(200).json({ 
          previewImage,
          fullCoverUrl: cloudinaryService.getOptimizedUrl(uploadResult.url, 'full')
        });
      } catch (cloudinaryError) {
        bookLogger.error("Error con Cloudinary al procesar la imagen de portada", {
          error: cloudinaryError instanceof Error ? cloudinaryError.stack : String(cloudinaryError),
          bookId,
          coverImageUrl: 'usando URL original como fallback'
        });
        
        // En caso de error de Cloudinary, usar la URL original como fallback
        const previewImage = coverPage.imageUrl;
        await storage.updateBook(bookId, { previewImage });
        
        res.status(200).json({ previewImage });
      }
    } catch (error) {
      bookLogger.error("Error al crear previsualización del libro", {
        error: error instanceof Error ? error.stack : String(error),
        bookId: req.params.id
      });
      res.status(500).json({ message: "Failed to create book preview" });
    }
  });

  // Configuración para subida de imágenes
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Asegurarnos de que el directorio de uploads existe
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configurar almacenamiento para multer
  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      // Generar un nombre de archivo único para evitar colisiones
      const randomName = crypto.randomBytes(16).toString('hex');
      const fileExt = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomName}${fileExt}`);
    }
  });
  
  // Filtrar solo imágenes
  const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  };
  
  const upload = multer({ 
    storage: multerStorage, 
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
  });
  
  // Ruta para subir imagen de personaje usando Cloudinary
  app.post('/api/characters/:id/avatar', upload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
      }
      
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        // Eliminar archivo si el personaje no existe
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: 'Personaje no encontrado' });
      }
      
      // Importamos el servicio de Cloudinary
      const { cloudinaryService } = await import('./services/cloudinaryService');
      
      // Obtener el userId para la estructura de carpetas
      const userId = character.userId;
      
      // Leer el archivo temporal subido
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      
      try {
        // Subir imagen a Cloudinary 
        const uploadResult = await cloudinaryService.uploadCharacterImage(
          userId,
          characterId,
          base64Image
        );
        
        // Eliminar el archivo temporal
        fs.unlinkSync(req.file.path);
        
        // Si el personaje ya tenía una imagen en Cloudinary, eliminarla
        if (character.avatarUrl && character.avatarUrl.includes('cloudinary.com')) {
          try {
            // Intentar extraer el public_id del URL anterior
            const oldPublicId = character.avatarUrl.split('/').slice(-2).join('/').split('.')[0];
            if (oldPublicId) {
              await cloudinaryService.deleteImage(oldPublicId);
            }
          } catch (cloudError) {
            console.error('Error al eliminar imagen anterior:', cloudError);
            // Continuamos aunque falle la eliminación
          }
        }
        
        // Actualizar el personaje con la URL de la imagen
        const updatedCharacter = await storage.updateCharacter(characterId, { 
          avatarUrl: uploadResult.url 
        });
        
        if (!updatedCharacter) {
          return res.status(500).json({ message: 'Error al actualizar el personaje' });
        }
        
        res.status(200).json({ 
          characterId, 
          avatarUrl: uploadResult.url, 
          message: 'Imagen de personaje actualizada exitosamente' 
        });
      } catch (cloudinaryError) {
        console.error('Error al subir imagen a Cloudinary:', cloudinaryError);
        
        // En caso de error, eliminar el archivo temporal
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ message: 'Error al procesar la imagen en Cloudinary' });
      }
    } catch (error) {
      console.error('Error en subida de imagen:', error);
      
      // Asegurarnos de limpiar el archivo temporal si existe
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: 'Error en la subida de la imagen del personaje' });
    }
  });
  
  // Servir archivos estáticos de la carpeta public
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // -----------------------------------------------------------------
  // Endpoints para borradores de libros (book drafts)
  // -----------------------------------------------------------------
  
  // Obtener todos los borradores de un usuario
  app.get("/api/book-drafts", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Acceso no autorizado" });
      }
      
      const userId = req.user.id;
      const drafts = await storage.getUserBookDrafts(userId);
      res.json(drafts);
    } catch (error) {
      apiLogger.error(`Error en endpoint GET /api/book-drafts: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: "Error al obtener los borradores" });
    }
  });
  
  // Obtener un borrador específico
  app.get("/api/book-drafts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Acceso no autorizado" });
      }
      
      const userId = req.user.id;
      const draftId = parseInt(req.params.id);
      
      if (isNaN(draftId)) {
        return res.status(400).json({ error: "ID de borrador inválido" });
      }
      
      const draft = await storage.getBookDraft(draftId);
      
      if (!draft) {
        return res.status(404).json({ error: "Borrador no encontrado" });
      }
      
      // Verificar que el borrador pertenece al usuario
      if (draft.userId !== userId) {
        return res.status(403).json({ error: "No tienes permiso para acceder a este borrador" });
      }
      
      res.json(draft);
    } catch (error) {
      apiLogger.error(`Error en endpoint GET /api/book-drafts/:id: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: "Error al obtener el borrador" });
    }
  });
  
  // Guardar o actualizar un borrador
  app.post("/api/book-drafts", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Acceso no autorizado" });
      }
      
      const userId = req.user.id;
      const draftData = req.body;
      
      // Asegurar que el userId del borrador es el del usuario autenticado
      draftData.userId = userId;
      
      // Guardar el borrador
      const draft = await storage.saveBookDraft(draftData);
      
      res.json(draft);
    } catch (error) {
      apiLogger.error(`Error en endpoint POST /api/book-drafts: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: "Error al guardar el borrador" });
    }
  });
  
  // Actualizar un borrador existente
  app.put("/api/book-drafts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Acceso no autorizado" });
      }
      
      const userId = req.user.id;
      const draftId = parseInt(req.params.id);
      const draftData = req.body;
      
      if (isNaN(draftId)) {
        return res.status(400).json({ error: "ID de borrador inválido" });
      }
      
      const existingDraft = await storage.getBookDraft(draftId);
      
      if (!existingDraft) {
        return res.status(404).json({ error: "Borrador no encontrado" });
      }
      
      // Verificar que el borrador pertenece al usuario
      if (existingDraft.userId !== userId) {
        return res.status(403).json({ error: "No tienes permiso para modificar este borrador" });
      }
      
      // Actualizar el borrador
      const updatedDraft = await storage.updateBookDraft(draftId, draftData);
      
      res.json(updatedDraft);
    } catch (error) {
      apiLogger.error(`Error en endpoint PUT /api/book-drafts/:id: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: "Error al actualizar el borrador" });
    }
  });
  
  // Eliminar un borrador
  app.delete("/api/book-drafts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Acceso no autorizado" });
      }
      
      const userId = req.user.id;
      const draftId = parseInt(req.params.id);
      
      if (isNaN(draftId)) {
        return res.status(400).json({ error: "ID de borrador inválido" });
      }
      
      const draft = await storage.getBookDraft(draftId);
      
      if (!draft) {
        return res.status(404).json({ error: "Borrador no encontrado" });
      }
      
      // Verificar que el borrador pertenece al usuario
      if (draft.userId !== userId) {
        return res.status(403).json({ error: "No tienes permiso para eliminar este borrador" });
      }
      
      const deleted = await storage.deleteBookDraft(draftId);
      
      if (deleted) {
        res.status(200).json({ success: true, message: "Borrador eliminado con éxito" });
      } else {
        res.status(500).json({ error: "No se pudo eliminar el borrador" });
      }
    } catch (error) {
      apiLogger.error(`Error en endpoint DELETE /api/book-drafts/:id: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: "Error al eliminar el borrador" });
    }
  });

  const httpServer = createServer(app);
  // --- Subscription Tier Routes ---
  app.get("/api/subscription-tiers", async (req, res) => {
    try {
      const tiers = await storage.getSubscriptionTiers();
      res.status(200).json(tiers);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener niveles de suscripción" });
    }
  });

  app.get("/api/subscription-tiers/recommended", async (req, res) => {
    try {
      // Obtenemos los tiers recomendados definidos en pricing.ts
      const recommendedTiers = getRecommendedTiers();
      
      // Buscamos los datos completos en la base de datos
      const fullTiers = await Promise.all(
        recommendedTiers.map(async (tier) => {
          const dbTiers = await storage.getSubscriptionTiers();
          return dbTiers.find(t => t.books === tier.books && t.pages === tier.pages);
        })
      );
      
      res.status(200).json(fullTiers.filter(Boolean));
    } catch (error) {
      res.status(500).json({ message: "Error al obtener niveles de suscripción recomendados" });
    }
  });

  app.get("/api/subscription-tiers/:id", async (req, res) => {
    try {
      const tierId = parseInt(req.params.id);
      const tier = await storage.getSubscriptionTier(tierId);
      
      if (!tier) {
        return res.status(404).json({ message: "Nivel de suscripción no encontrado" });
      }
      
      res.status(200).json(tier);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener nivel de suscripción" });
    }
  });

  // --- Subscription Routes ---
  app.get("/api/users/:userId/subscriptions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.status(200).json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener suscripciones del usuario" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.getSubscription(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Suscripción no encontrada" });
      }
      
      res.status(200).json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener suscripción" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      
      // Verificar que el tier existe
      const tier = await storage.getSubscriptionTier(subscriptionData.tierId);
      if (!tier) {
        return res.status(400).json({ message: "El nivel de suscripción no existe" });
      }
      
      // Establecer fechas del período actual (una semana por defecto)
      const now = new Date();
      const currentPeriodStart = now;
      const currentPeriodEnd = new Date(now);
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7); // Una semana
      
      // Crear la suscripción
      const newSubscription = await storage.createSubscription({
        ...subscriptionData,
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false
      });
      
      res.status(201).json(newSubscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de suscripción inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al crear suscripción" });
    }
  });

  app.patch("/api/subscriptions/:id/cancel", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const { cancelAtPeriodEnd = true } = req.body;
      
      const updatedSubscription = await storage.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
      
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Suscripción no encontrada" });
      }
      
      res.status(200).json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ message: "Error al cancelar suscripción" });
    }
  });

  // --- Book Delivery Routes ---
  app.get("/api/users/:userId/deliveries", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const deliveries = await storage.getBookDeliveries(userId);
      res.status(200).json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener entregas de libros" });
    }
  });

  app.get("/api/subscriptions/:subscriptionId/deliveries", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);
      const deliveries = await storage.getBookDeliveriesBySubscription(subscriptionId);
      res.status(200).json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener entregas de la suscripción" });
    }
  });

  app.get("/api/deliveries/:id", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const delivery = await storage.getBookDelivery(deliveryId);
      
      if (!delivery) {
        return res.status(404).json({ message: "Entrega no encontrada" });
      }
      
      res.status(200).json(delivery);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener entrega" });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = insertBookDeliverySchema.parse(req.body);
      
      // Verificar que la suscripción existe
      const subscription = await storage.getSubscription(deliveryData.subscriptionId);
      if (!subscription) {
        return res.status(400).json({ message: "La suscripción no existe" });
      }
      
      // Verificar que el libro existe
      const book = await storage.getBook(deliveryData.bookId);
      if (!book) {
        return res.status(400).json({ message: "El libro no existe" });
      }
      
      // Verificar que el personaje existe
      const character = await storage.getCharacter(deliveryData.characterId);
      if (!character) {
        return res.status(400).json({ message: "El personaje no existe" });
      }
      
      // Construir semana de entrega (formato: YYYY-WW)
      const deliveryDate = new Date(deliveryData.deliveryDate);
      const year = deliveryDate.getFullYear();
      const week = Math.ceil((deliveryDate.getDate() - 1 + new Date(year, 0, 1).getDay()) / 7);
      const deliveryWeek = `${year}-${week.toString().padStart(2, '0')}`;
      
      // Crear la entrega
      const newDelivery = await storage.createBookDelivery({
        ...deliveryData,
        status: 'pending',
        deliveryWeek,
        emailSent: false
      });
      
      res.status(201).json(newDelivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de entrega inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al crear entrega" });
    }
  });

  app.patch("/api/deliveries/:id/status", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "El estado es requerido" });
      }
      
      const updatedDelivery = await storage.updateBookDeliveryStatus(deliveryId, status);
      
      if (!updatedDelivery) {
        return res.status(404).json({ message: "Entrega no encontrada" });
      }
      
      res.status(200).json(updatedDelivery);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar estado de entrega" });
    }
  });

  app.patch("/api/deliveries/:id/email-sent", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const updatedDelivery = await storage.markDeliveryEmailSent(deliveryId);
      
      if (!updatedDelivery) {
        return res.status(404).json({ message: "Entrega no encontrada" });
      }
      
      res.status(200).json(updatedDelivery);
    } catch (error) {
      res.status(500).json({ message: "Error al marcar el email como enviado" });
    }
  });

  // --- Stripe Routes for Subscriptions ---
  app.post("/api/create-subscription-payment", async (req, res) => {
    try {
      const { tierId, userId, returnUrl } = req.body;
      
      if (!tierId || !userId) {
        return res.status(400).json({ message: "ID de nivel de suscripción y ID de usuario son requeridos" });
      }
      
      // Obtener el tier de suscripción
      const tier = await storage.getSubscriptionTier(parseInt(tierId));
      if (!tier) {
        return res.status(404).json({ message: "Nivel de suscripción no encontrado" });
      }
      
      // Obtener el usuario
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      let stripeCustomerId = user.stripeCustomerId;
      
      // Si el usuario no tiene un ID de cliente de Stripe, crear uno
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName || user.username,
        });
        
        stripeCustomerId = customer.id;
        await storage.updateStripeCustomerId(user.id, stripeCustomerId);
      }
      
      // Crear una sesión de pago con Stripe
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `StoryMagic - ${tier.name}`,
                description: tier.description,
              },
              unit_amount: tier.pricePerWeek, // Ya está en céntimos
              recurring: {
                interval: 'week',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id.toString(),
          tierId: tier.id.toString(),
        },
        success_url: returnUrl || `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: returnUrl || `${req.headers.origin}/subscription/cancel`,
      });
      
      res.status(200).json({ 
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      console.error("Error creating subscription payment:", error);
      res.status(500).json({ message: "Error al crear pago de suscripción" });
    }
  });

  app.post("/api/webhooks/stripe", async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;
    
    // Verificar que la solicitud proviene de Stripe
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'dummy_webhook_secret'
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    
    // Manejar eventos de suscripción
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Solo procesar eventos de suscripción
      if (session.mode === 'subscription') {
        try {
          const userId = parseInt(session.metadata.userId);
          const tierId = parseInt(session.metadata.tierId);
          const stripeSubscriptionId = session.subscription;
          
          // Obtener detalles de la suscripción de Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          
          // Crear la suscripción en nuestra base de datos
          const now = new Date();
          const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
          const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
          
          await storage.createSubscription({
            userId,
            tierId,
            status: 'active',
            stripeSubscriptionId,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false
          });
          
          console.log(`Suscripción creada para usuario ${userId}, nivel ${tierId}`);
        } catch (error) {
          console.error('Error procesando suscripción:', error);
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const stripeSubscription = event.data.object;
      
      try {
        // Encontrar nuestra suscripción por ID de Stripe
        const subscriptions = await storage.getUserSubscriptions(0); // Obtener todas, no tenemos índice por stripeSubscriptionId
        const subscription = subscriptions.find(s => s.stripeSubscriptionId === stripeSubscription.id);
        
        if (subscription) {
          // Actualizar fechas de período
          await storage.updateSubscription(subscription.id, {
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            status: stripeSubscription.status,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
          });
          
          console.log(`Suscripción ${subscription.id} actualizada`);
        }
      } catch (error) {
        console.error('Error actualizando suscripción:', error);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const stripeSubscription = event.data.object;
      
      try {
        // Encontrar nuestra suscripción por ID de Stripe
        const subscriptions = await storage.getUserSubscriptions(0); // Obtener todas, no tenemos índice por stripeSubscriptionId
        const subscription = subscriptions.find(s => s.stripeSubscriptionId === stripeSubscription.id);
        
        if (subscription) {
          // Marcar como cancelada
          await storage.updateSubscription(subscription.id, {
            status: 'canceled',
            cancelAtPeriodEnd: false
          });
          
          console.log(`Suscripción ${subscription.id} cancelada`);
        }
      } catch (error) {
        console.error('Error cancelando suscripción:', error);
      }
    }
    
    res.status(200).json({ received: true });
  });
  
  // --- Book Characters routes ---
  app.get("/api/books/:bookId/characters", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const bookCharacters = await storage.getBookCharacters(bookId);
      res.status(200).json(bookCharacters);
    } catch (error) {
      console.error("Error fetching book characters:", error);
      res.status(500).json({ message: "Failed to fetch book characters" });
    }
  });
  
  app.post("/api/book-characters", async (req: Request, res: Response) => {
    try {
      const { bookId, characterId, role } = req.body;
      
      if (!bookId || !characterId) {
        return res.status(400).json({ message: "Book ID and Character ID are required" });
      }
      
      // Verificar que existan el libro y el personaje
      const book = await storage.getBook(parseInt(bookId.toString()));
      const character = await storage.getCharacter(parseInt(characterId.toString()));
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      // Crear la relación entre libro y personaje
      const bookCharacter = await storage.addCharacterToBook({
        bookId: parseInt(bookId.toString()),
        characterId: parseInt(characterId.toString()),
        role: role || 'secondary'
      });
      
      res.status(201).json(bookCharacter);
    } catch (error) {
      console.error("Error adding character to book:", error);
      res.status(500).json({ message: "Failed to add character to book" });
    }
  });
  
  app.delete("/api/books/:bookId/characters/:characterId", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const characterId = parseInt(req.params.characterId);
      
      // Eliminar la relación entre libro y personaje
      const success = await storage.removeCharacterFromBook(bookId, characterId);
      
      if (!success) {
        return res.status(404).json({ message: "Book character relationship not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing character from book:", error);
      res.status(500).json({ message: "Failed to remove character from book" });
    }
  });

  return httpServer;
}
