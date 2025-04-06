import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCharacterSchema, 
  insertBookSchema, 
  insertChatMessageSchema, 
  insertOrderSchema,
  insertSubscriptionSchema,
  insertSubscriptionTierSchema,
  insertBookDeliverySchema
} from "@shared/schema";
import { getPriceTier, getRecommendedTiers } from "@shared/pricing";
import OpenAI from "openai";
import { z } from "zod";
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";
import * as crypto from "crypto";

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
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json({ 
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user account" });
    }
  });

  app.post("/api/auth/firebase-auth", async (req, res) => {
    try {
      const { firebaseUserId, email, displayName } = req.body;
      
      if (!firebaseUserId || !email) {
        return res.status(400).json({ message: "Firebase user ID and email are required" });
      }
      
      // Check if user exists by Firebase ID
      let user = await storage.getUserByFirebaseId(firebaseUserId);
      
      if (!user) {
        // Check if user exists by email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update existing user with Firebase ID
          user = await storage.updateUser(user.id, { firebaseUserId });
        } else {
          // Create new user
          const username = email.split('@')[0];
          user = await storage.createUser({
            username,
            email,
            password: Math.random().toString(36).slice(2), // Random password for Firebase users
            displayName: displayName || username,
            firebaseUserId
          });
        }
      }
      
      res.status(200).json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName 
      });
    } catch (error) {
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

  // --- Chat Routes ---
  app.get("/api/profiles/:profileId/chat", async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const messages = await storage.getChatMessages(profileId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const newMessage = await storage.createChatMessage(messageData);
      
      // If this is a user message, generate a system response
      if (messageData.sender === 'user') {
        const character = await storage.getCharacter(messageData.characterId);
        
        if (character) {
          // Get previous chat messages for context
          const previousMessages = await storage.getChatMessages(messageData.characterId);
          
          // Format messages for OpenAI
          const formattedMessages = previousMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.message
          }));
          
          // Add system instruction
          formattedMessages.unshift({
            role: "system" as const,
            content: `Eres un asistente amigable que ayuda a recopilar información sobre un personaje llamado ${character.name} (${character.type}) para crear un libro de cuentos personalizado. Haz preguntas de seguimiento para aprender más sobre los intereses, amigos, familia, mascotas, actividades favoritas y rasgos de personalidad. Sé conversacional, cálido y atractivo.`
          });
          
          try {
            // Generate AI response
            const completion = await openai.chat.completions.create({
              model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
              messages: formattedMessages,
              max_tokens: 300,
            });
            
            // Save AI response
            const aiResponse = completion.choices[0].message.content;
            if (aiResponse) {
              await storage.createChatMessage({
                userId: messageData.userId,
                characterId: messageData.characterId,
                message: aiResponse,
                sender: 'system'
              });
              
              // Extract new information from conversation to update profile
              const extractCompletion = await openai.chat.completions.create({
                model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages: [
                  {
                    role: "system" as const,
                    content: `Basado en esta conversación, extrae cualquier información nueva sobre ${character.name} que debería guardarse en su perfil. Devuelve un objeto JSON con cualquiera de estos campos si hay información disponible: interests (array de strings), favorites (objeto con claves como color, food, animal, etc.), friends (array de nombres), traits (array de rasgos de personalidad).`
                  },
                  ...formattedMessages,
                  {
                    role: "user" as const,
                    content: "Extrae información del perfil de nuestra conversación."
                  }
                ],
                response_format: { type: "json_object" }
              });
              
              const extractedInfo = JSON.parse(extractCompletion.choices[0].message.content || "{}");
              
              // Update profile with extracted information
              if (Object.keys(extractedInfo).length > 0) {
                const updatedCharacter = {
                  ...character,
                  interests: [...(character.interests || []), ...(extractedInfo.interests || [])].filter((v, i, a) => a.indexOf(v) === i),
                  favorites: { ...(character.favorites || {}), ...(extractedInfo.favorites || {}) },
                  friends: [...(character.relationships?.friends || []), ...(extractedInfo.friends || [])].filter((v, i, a) => a.indexOf(v) === i),
                  traits: [...(character.traits || []), ...(extractedInfo.traits || [])].filter((v, i, a) => a.indexOf(v) === i),
                };
                
                await storage.updateCharacter(character.id, updatedCharacter);
              }
            }
            
            // Return both messages
            res.status(201).json({
              userMessage: newMessage,
              aiResponse: aiResponse
            });
          } catch (error) {
            console.error("OpenAI error:", error);
            res.status(201).json({ userMessage: newMessage });
          }
        } else {
          res.status(201).json({ userMessage: newMessage });
        }
      } else {
        res.status(201).json({ userMessage: newMessage });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send chat message" });
    }
  });

  // --- Book Generation with OpenAI ---
  app.post("/api/generate-book", async (req, res) => {
    try {
      const { characterId, themeId } = req.body;
      
      if (!characterId || !themeId) {
        return res.status(400).json({ message: "Character ID and theme ID are required" });
      }
      
      const character = await storage.getCharacter(parseInt(characterId));
      const theme = await storage.getBookTheme(parseInt(themeId));
      
      if (!character) {
        return res.status(404).json({ message: "Character profile not found" });
      }
      
      if (!theme) {
        return res.status(404).json({ message: "Book theme not found" });
      }
      
      // Generate book content with OpenAI
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
      
      const bookContent = JSON.parse(completion.choices[0].message.content || "{}");
      
      res.status(200).json(bookContent);
    } catch (error) {
      console.error("Book generation error:", error);
      res.status(500).json({ message: "Failed to generate book content" });
    }
  });

  // --- Payment Routes ---
  // Stripe Payment Intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookId, userId, format } = req.body;
      
      if (!amount || !bookId || !userId || !format) {
        return res.status(400).json({ message: "Amount, book ID, user ID, and format are required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookId: bookId.toString(),
          userId: userId.toString(),
          format
        }
      });
      
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Stripe error:", error);
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
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      } else {
        event = payload;
      }
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Handle successful payment
        const bookId = parseInt(paymentIntent.metadata.bookId);
        const userId = parseInt(paymentIntent.metadata.userId);
        const format = paymentIntent.metadata.format;
        
        // Update book status
        await storage.updateBook(bookId, { 
          status: 'completed',
          format,
          orderReference: paymentIntent.id
        });
        
        // Create order record
        await storage.createOrder({
          userId,
          bookId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentMethod: 'stripe',
          paymentId: paymentIntent.id,
          status: 'completed',
          shippingAddress: {} // This would be populated with actual shipping info
        });
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
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
      const { characterIds, themeId, storyDetails } = req.body;
      
      if (!characterIds || !themeId || !Array.isArray(characterIds) || characterIds.length === 0) {
        return res.status(400).json({ message: "Al menos un ID de personaje y un ID de tema son requeridos" });
      }
      
      // Obtener el número de páginas solicitado (excluyendo la portada)
      const requestedPageCount = storyDetails?.pageCount || 12;
      
      // Obtener todos los personajes
      const characters = [];
      for (const id of characterIds) {
        const character = await storage.getCharacter(parseInt(id.toString()));
        if (!character) {
          return res.status(404).json({ message: `Personaje con ID ${id} no encontrado` });
        }
        characters.push(character);
      }
      
      // Obtener el tema
      const theme = await storage.getBookTheme(parseInt(themeId.toString()));
      if (!theme) {
        return res.status(404).json({ message: "Book theme not found" });
      }

      // Personaje principal (el primero de la lista)
      const mainCharacter = characters[0];
      
      // Personajes secundarios (resto de la lista)
      const supportingCharacters = characters.slice(1);
      
      // Get chat history for additional context for the main character
      const chatHistory = await storage.getChatMessages(mainCharacter.id);
      
      // Preparar el contexto del chat para una comprensión más profunda del personaje principal
      const chatContext = chatHistory.length > 0 
        ? `Basado en conversaciones previas con ${mainCharacter.name}, se ha aprendido que: 
          ${chatHistory.filter(m => m.sender === 'user').slice(-5).map(m => `- ${m.message}`).join('\n')}`
        : '';
      
      // Crear descripciones de los personajes secundarios para el prompt
      const supportingCharactersText = supportingCharacters.length > 0 
        ? `PERSONAJES SECUNDARIOS:
          ${supportingCharacters.map(char => `
            - Nombre: ${char.name}
            - Tipo: ${char.type || 'personaje'}
            - Edad: ${char.age || 'no especificada'}
            - Descripción: ${char.physicalDescription || 'No disponible'}
            - Personalidad: ${char.personality || 'No disponible'}
            - Intereses: ${char.interests ? char.interests.join(', ') : 'No disponibles'}
          `).join('\n')}`
        : '';
      
      // Generate book content with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `Eres un experto narrador de cuentos infantiles que crea historias mágicas con múltiples personajes.
                     
                     INSTRUCCIONES PARA LA CREACIÓN DE HISTORIAS:
                     - Crea un libro infantil personalizado con el tema: "${theme.name}"
                     - La historia debe incluir ${characters.length} personaje(s), con ${mainCharacter.name} como protagonista principal
                     ${supportingCharacters.length > 0 ? `- Incluye a los personajes secundarios como parte importante de la trama: ${supportingCharacters.map(c => c.name).join(', ')}` : ''}
                     - La historia debe ser apropiada para niños de ${theme.ageRange || '5-10'} años
                     - La narrativa debe incorporar los intereses y personalidad de todos los personajes
                     - Incorpora interacciones significativas entre los personajes que reflejen sus personalidades
                     - Utiliza un lenguaje sencillo pero enriquecedor, adaptado a la edad objetivo
                     - Incluye enseñanzas sutiles o valores positivos (amistad, valentía, respeto, etc.)
                     - Asegúrate de que la historia tenga un arco narrativo claro: introducción, desarrollo, clímax y resolución
                     - Las ilustraciones deben incluir a todos los personajes que participan en cada escena
                     - Evita cualquier contenido inapropiado, terrorífico o angustiante
                     
                     ESTRUCTURA DE LA HISTORIA:
                     - Página 1: Portada con título e introducción de los personajes principales (no se considera en el número total de páginas)
                     - Páginas 2-${Math.floor(requestedPageCount * 0.25) + 1}: Establecimiento del escenario y situación inicial con los personajes
                     - Páginas ${Math.floor(requestedPageCount * 0.25) + 2}-${Math.floor(requestedPageCount * 0.6)}: Desarrollo de la aventura que involucre a todos los personajes
                     - Páginas ${Math.floor(requestedPageCount * 0.6) + 1}-${Math.floor(requestedPageCount * 0.8)}: Clímax o momento crucial
                     - Páginas ${Math.floor(requestedPageCount * 0.8) + 1}-${requestedPageCount}: Resolución y final feliz con mensaje positivo
                     
                     Debes generar un objeto JSON con la siguiente estructura exacta:
                     {
                       "title": "Título de la historia incluyendo los nombres de los personajes principales",
                       "pages": [
                         {
                          "pageNumber": 1,
                          "text": "Texto de la página con narración de la historia (2-3 frases)",
                          "imagePrompt": "Descripción detallada para ilustrar esta página con todos los personajes participantes"
                         },
                         ...
                       ],
                       "summary": "Breve resumen de la historia",
                       "targetAge": "Rango de edad apropiado para la historia",
                       "theme": "${theme.name}",
                       "characters": ${JSON.stringify(characters.map(c => c.name))}
                     }
                     
                     REQUISITOS TÉCNICOS:
                     - El libro debe tener exactamente ${requestedPageCount + 1} páginas en total: 1 portada + ${requestedPageCount} páginas de contenido
                     - La portada (página 1) no cuenta para el número de páginas solicitado por el usuario
                     - Cada página debe tener texto atractivo y apropiado para la edad que haga avanzar la historia
                     - Los prompts de imagen deben ser detallados para crear ilustraciones que incluyan a todos los personajes relevantes
                     - Usa el estilo ilustrativo "acuarela infantil" o "ilustración infantil digital colorida" para consistencia
                     - Menciona colores específicos y elementos de la escena en cada prompt de imagen
                     - Proporciona descripciones físicas de los personajes en los prompts de imagen basadas en los perfiles`
          },
          {
            role: "user",
            content: `Crea una historia mágica y personalizada con ${mainCharacter.name} como protagonista principal${supportingCharacters.length > 0 ? ` y con ${supportingCharacters.map(c => c.name).join(', ')} como personaje(s) secundario(s)` : ''}.
                     
                     PERFIL DEL PERSONAJE PRINCIPAL:
                     - Nombre: ${mainCharacter.name}
                     - Tipo: ${mainCharacter.type || 'niño/a'}
                     - Edad: ${mainCharacter.age || 'escolar'}
                     - Descripción física: ${mainCharacter.physicalDescription || 'No disponible'}
                     - Personalidad: ${mainCharacter.personality || 'amigable, curioso y valiente'}
                     - Intereses: ${mainCharacter.interests ? mainCharacter.interests.join(', ') : 'juegos, aventuras, animales y descubrimientos'}
                     - Le gusta: ${mainCharacter.likes || 'No especificado'}
                     - No le gusta: ${mainCharacter.dislikes || 'No especificado'}
                     - Cosas favoritas: ${mainCharacter.favorites ? JSON.stringify(mainCharacter.favorites, null, 2) : '(color favorito, animal favorito, etc. - usar lo que se deduzca del perfil)'}
                     - Amigos y familia: ${mainCharacter.relationships?.friends ? mainCharacter.relationships.friends.join(', ') : 'amigos, familia y posibles mascotas'}
                     - Rasgos de personalidad: ${mainCharacter.traits ? mainCharacter.traits.join(', ') : 'amigable, curioso y valiente'}
                     
                     ${supportingCharactersText}
                     
                     TEMA DEL LIBRO:
                     - Tema: ${theme.name}
                     - Descripción del tema: ${theme.description}
                     
                     ${chatContext ? `CONTEXTO ADICIONAL DE CONVERSACIONES:\n${chatContext}` : ''}
                     
                     INSTRUCCIONES ESPECÍFICAS PARA MÚLTIPLES PERSONAJES:
                     - Asegúrate de que todos los personajes tengan un papel significativo en la historia
                     - Involucra a todos los personajes en la resolución del conflicto o aventura
                     - Refleja las personalidades y características únicas de cada personaje en sus diálogos y acciones
                     - Crea interacciones entre los personajes que muestren amistad, cooperación y apoyo mutuo
                     - Los personajes secundarios deben tener momentos destacados donde brillen por sus habilidades o cualidades
                     - El protagonista debe aprender algo importante con la ayuda de los demás personajes
                     - Todas las ilustraciones deben incluir representaciones visuales adecuadas de todos los personajes relevantes en cada escena
                     
                     Crea una historia única y encantadora que realmente se sienta como si fuera escrita específicamente para estos personajes,
                     incorporando sus intereses y personalidades de manera natural en la narrativa.
                     
                     Asegúrate de que la historia sea apropiada para la edad, educativa, divertida y con un mensaje positivo.
                     Las ilustraciones deben ser coherentes con la historia y apropiadas para niños.
                     `
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2500
      });
      
      const bookContent = JSON.parse(completion.choices[0].message.content || "{}");
      
      res.status(200).json(bookContent);
    } catch (error) {
      console.error("Error generating book content:", error);
      res.status(500).json({ message: "Failed to generate book content" });
    }
  });

  // Generate images for book
  app.post("/api/books/generate-images", async (req: Request, res: Response) => {
    try {
      const { bookContent } = req.body;
      
      if (!bookContent || !bookContent.pages) {
        return res.status(400).json({ message: "Book content with pages is required" });
      }
      
      // Create a directory for storing the generated images if it doesn't exist
      const imageDir = path.join(process.cwd(), 'public', 'book-images');
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }
      
      // Process each page and generate an image
      const processedContent = { ...bookContent };
      
      // Generate images for each page (sequentially to avoid rate limiting)
      for (let i = 0; i < processedContent.pages.length; i++) {
        const page = processedContent.pages[i];
        try {
          // Preparamos un prompt más detallado y controlado
          const baseStyle = "Ilustración infantil en estilo acuarela digital, colorida y alegre, con colores vibrantes y apto para niños";
          
          // Mejoramos el prompt para DALL-E
          const enhancedPrompt = `
Crea una ilustración de libro infantil de alta calidad para un cuento sobre ${processedContent.mainCharacter}:

${page.imagePrompt}

ESTILO ARTÍSTICO REQUERIDO:
- ${baseStyle}
- Diseño apropiado para niños de ${processedContent.targetAge} años
- Colores brillantes y amigables, escenas bien iluminadas
- Personajes con expresiones faciales claras y amigables
- Estilo consistente con ilustraciones de libros infantiles profesionales
- Sin texto, solo la imagen
- Proporciones correctas y anatomía apropiada para personajes infantiles

NO INCLUIR:
- Elementos aterradores, oscuros o inapropiados
- Texto o letras dentro de la ilustración
- Elementos que puedan causar miedo o ansiedad
- Escenas violentas o perturbadoras

Esta imagen es para un libro infantil que será leído por niños.
`;

          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd", // Calidad mejorada
            style: "vivid", // Estilo más colorido y vibrante
          });
          
          const imageUrl = imageResponse.data[0].url;
          
          // Save the image URL to the page
          processedContent.pages[i].imageUrl = imageUrl;
        } catch (imgError) {
          console.error(`Error generating image for page ${i+1}:`, imgError);
          // Continue with other pages even if one fails
        }
      }
      
      res.status(200).json(processedContent);
    } catch (error) {
      console.error("Error generating book images:", error);
      res.status(500).json({ message: "Failed to generate book images" });
    }
  });

  // Create PDF version of the book
  app.post("/api/books/create-pdf", async (req: Request, res: Response) => {
    try {
      const { bookId } = req.body;
      
      if (!bookId) {
        return res.status(400).json({ message: "Book ID is required" });
      }
      
      const book = await storage.getBook(parseInt(bookId.toString()));
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // In a real implementation, you would use a PDF generation library
      // For now, we'll just simulate PDF creation
      const pdfUrl = `/api/books/${bookId}/download`;
      
      // Update book with PDF URL
      await storage.updateBook(book.id, { 
        orderReference: pdfUrl,
        status: 'completed'
      });
      
      res.status(200).json({ url: pdfUrl });
    } catch (error) {
      console.error("Error creating PDF:", error);
      res.status(500).json({ message: "Failed to create PDF" });
    }
  });

  // Download book as PDF
  app.get("/api/books/:id/download", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // In a real implementation, you would generate a PDF file
      // For now, we'll just send a mock response
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ 
        message: "This endpoint would serve the PDF file for download", 
        bookTitle: book.title 
      });
    } catch (error) {
      console.error("Error downloading book:", error);
      res.status(500).json({ message: "Failed to download book" });
    }
  });
  
  // Update book status
  app.patch("/api/books/:id/status", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedBook = await storage.updateBook(bookId, { status });
      
      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(200).json(updatedBook);
    } catch (error) {
      console.error("Error updating book status:", error);
      res.status(500).json({ message: "Failed to update book status" });
    }
  });
  
  // Create book preview
  app.post("/api/books/:id/preview", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Generate a preview image for the book (first page/cover)
      const bookContent = book.content as any;
      if (!bookContent || !bookContent.pages || bookContent.pages.length === 0) {
        return res.status(400).json({ message: "Book has no content" });
      }
      
      const coverPage = bookContent.pages[0];
      
      // In a real implementation, you would use the cover page image
      // For now, just update with a placeholder
      const previewImage = coverPage.imageUrl || `/api/books/${bookId}/cover`;
      
      const updatedBook = await storage.updateBook(bookId, { previewImage });
      
      res.status(200).json({ previewImage });
    } catch (error) {
      console.error("Error creating book preview:", error);
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
  
  // Ruta para subir imagen de personaje
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
      
      // Si el personaje ya tenía una imagen, eliminarla
      if (character.avatarUrl) {
        const oldAvatarPath = path.join(process.cwd(), 'public', character.avatarUrl.replace(/^\//, ''));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      // La URL relativa para acceder a la imagen
      const avatarUrl = `/uploads/${path.basename(req.file.path)}`;
      
      // Actualizar el personaje con la URL de la imagen
      const updatedCharacter = await storage.updateCharacter(characterId, { avatarUrl });
      
      if (!updatedCharacter) {
        return res.status(500).json({ message: 'Error al actualizar el personaje' });
      }
      
      res.status(200).json({ 
        characterId, 
        avatarUrl, 
        message: 'Imagen de personaje actualizada exitosamente' 
      });
    } catch (error) {
      console.error('Error en subida de imagen:', error);
      res.status(500).json({ message: 'Error en la subida de la imagen del personaje' });
    }
  });
  
  // Servir archivos estáticos de la carpeta public
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

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
