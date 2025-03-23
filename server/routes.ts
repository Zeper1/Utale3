import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChildProfileSchema, insertBookSchema, insertChatMessageSchema, insertOrderSchema } from "@shared/schema";
import OpenAI from "openai";
import { z } from "zod";
import Stripe from "stripe";

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

  // --- Child Profile Routes ---
  app.get("/api/users/:userId/profiles", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profiles = await storage.getChildProfiles(userId);
      res.status(200).json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve child profiles" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getChildProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve child profile" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profileData = insertChildProfileSchema.parse(req.body);
      const newProfile = await storage.createChildProfile(profileData);
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create child profile" });
    }
  });

  app.put("/api/profiles/:id", async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profileData = req.body;
      
      const updatedProfile = await storage.updateChildProfile(profileId, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      res.status(200).json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update child profile" });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const success = await storage.deleteChildProfile(profileId);
      
      if (!success) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete child profile" });
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
      const profileId = parseInt(req.params.profileId);
      const books = await storage.getBooksByChildProfile(profileId);
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
      
      res.status(200).json(book);
    } catch (error) {
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
        const profile = await storage.getChildProfile(messageData.childProfileId);
        
        if (profile) {
          // Get previous chat messages for context
          const previousMessages = await storage.getChatMessages(messageData.childProfileId);
          
          // Format messages for OpenAI
          const formattedMessages = previousMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.message
          }));
          
          // Add system instruction
          formattedMessages.unshift({
            role: "system" as const,
            content: "You are a friendly assistant helping to gather information about a child for creating a personalized storybook. Ask follow-up questions to learn more about the child's interests, friends, family, pets, favorite activities, and personality traits. Be conversational, warm, and engaging."
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
                childProfileId: messageData.childProfileId,
                message: aiResponse,
                sender: 'system'
              });
              
              // Extract new information from conversation to update profile
              const extractCompletion = await openai.chat.completions.create({
                model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages: [
                  {
                    role: "system" as const,
                    content: "Based on this conversation, extract any new information about the child that should be saved to their profile. Return a JSON object with any of these fields if information is available: interests (array of strings), favorites (object with keys like color, food, animal, etc.), friends (array of names), traits (array of personality traits)."
                  },
                  ...formattedMessages,
                  {
                    role: "user" as const,
                    content: "Extract profile information from our conversation."
                  }
                ],
                response_format: { type: "json_object" }
              });
              
              const extractedInfo = JSON.parse(extractCompletion.choices[0].message.content || "{}");
              
              // Update profile with extracted information
              if (Object.keys(extractedInfo).length > 0) {
                const updatedProfile = {
                  ...profile,
                  interests: [...(profile.interests || []), ...(extractedInfo.interests || [])].filter((v, i, a) => a.indexOf(v) === i),
                  favorites: { ...(profile.favorites || {}), ...(extractedInfo.favorites || {}) },
                  friends: [...(profile.friends || []), ...(extractedInfo.friends || [])].filter((v, i, a) => a.indexOf(v) === i),
                  traits: [...(profile.traits || []), ...(extractedInfo.traits || [])].filter((v, i, a) => a.indexOf(v) === i),
                };
                
                await storage.updateChildProfile(profile.id, updatedProfile);
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
      const { profileId, themeId } = req.body;
      
      if (!profileId || !themeId) {
        return res.status(400).json({ message: "Profile ID and theme ID are required" });
      }
      
      const profile = await storage.getChildProfile(parseInt(profileId));
      const theme = await storage.getBookTheme(parseInt(themeId));
      
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
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
            content: `Create a personalized children's storybook with the theme: ${theme.name}. 
                     The story should be appropriate for children aged ${theme.ageRange}.
                     Create a JSON object with the following structure:
                     {
                       "title": "Story title including the child's name",
                       "pages": [
                         {
                          "text": "Page text with the story narrative",
                          "illustration_prompt": "Detailed description for illustrating this page"
                         }
                         // 10 pages total
                       ]
                     }`
          },
          {
            role: "user",
            content: `Create a story for ${profile.name}, age ${profile.age || 'unknown'}.
                     Child's interests: ${profile.interests ? profile.interests.join(', ') : 'unknown'}
                     Child's favorite things: ${profile.favorites ? JSON.stringify(profile.favorites) : 'unknown'}
                     Child's friends: ${profile.friends ? profile.friends.join(', ') : 'unknown'}
                     Child's personality traits: ${profile.traits ? profile.traits.join(', ') : 'unknown'}`
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

  const httpServer = createServer(app);
  return httpServer;
}
