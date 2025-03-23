import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertChildProfileSchema, 
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

  // --- Advanced Book Generation Routes ---
  
  // Generate book content with AI
  app.post("/api/books/generate-content", async (req: Request, res: Response) => {
    try {
      const { childProfileId, themeId } = req.body;
      
      if (!childProfileId || !themeId) {
        return res.status(400).json({ message: "Child profile ID and theme ID are required" });
      }
      
      const profile = await storage.getChildProfile(parseInt(childProfileId.toString()));
      const theme = await storage.getBookTheme(parseInt(themeId.toString()));
      
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      if (!theme) {
        return res.status(404).json({ message: "Book theme not found" });
      }

      // Get chat history for additional context
      const chatHistory = await storage.getChatMessages(childProfileId);
      
      // Generate book content with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `Create a personalized children's storybook with the theme: "${theme.name}". 
                     The story should be appropriate for a child aged ${profile.age || '5-8'}.
                     The story should incorporate the child's interests, favorite things, and personality traits.
                     
                     Create a JSON object with the following structure:
                     {
                       "title": "Story title including the child's name",
                       "pages": [
                         {
                          "pageNumber": 1,
                          "text": "Page text with the story narrative (2-3 sentences)",
                          "imagePrompt": "Detailed description for illustrating this page in children's book style"
                         },
                         ...
                       ],
                       "summary": "Brief summary of the story",
                       "targetAge": "Age range the story is appropriate for",
                       "theme": "${theme.name}",
                       "mainCharacter": "${profile.name}"
                     }
                     
                     The book should have 8-12 pages total including a cover page.
                     Each page should have engaging, age-appropriate text that moves the story forward.
                     Image prompts should be detailed enough to create consistent, child-friendly illustrations.`
          },
          {
            role: "user",
            content: `Create a story for ${profile.name}, age ${profile.age || 'unknown'}.
                     
                     Child's interests: ${profile.interests ? profile.interests.join(', ') : 'various activities'}
                     Favorite things: ${profile.favorites ? JSON.stringify(profile.favorites) : 'unknown'}
                     Friends: ${profile.friends ? profile.friends.join(', ') : 'friends and family'}
                     Personality traits: ${profile.traits ? profile.traits.join(', ') : 'friendly, curious'}
                     
                     Theme of the book: ${theme.name}
                     Theme description: ${theme.description}
                     
                     Make the story personalized and engaging, incorporating elements from their profile.`
          }
        ],
        response_format: { type: "json_object" }
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
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Create a children's book illustration for a story about ${processedContent.mainCharacter}: ${page.imagePrompt}. Make it colorful, child-friendly, and engaging. Style should be appropriate for a ${processedContent.targetAge} year old child.`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
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
      
      // Verificar que el perfil de niño existe
      const childProfile = await storage.getChildProfile(deliveryData.childProfileId);
      if (!childProfile) {
        return res.status(400).json({ message: "El perfil del niño no existe" });
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

  return httpServer;
}
