import { db } from "./db";
import { IStorage } from "./storage";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter,
  bookThemes, type BookTheme, type InsertBookTheme,
  customBookThemes, type CustomBookTheme, type InsertCustomBookTheme,
  books, type Book, type InsertBook,
  bookCharacters, type BookCharacter, type InsertBookCharacter,
  orders, type Order, type InsertOrder,
  subscriptions, type Subscription, type InsertSubscription,
  subscriptionTiers, type SubscriptionTier, type InsertSubscriptionTier,
  bookDeliveries, type BookDelivery, type InsertBookDelivery,
  bookDrafts, type BookDraft, type InsertBookDraft
} from "@shared/schema";
import { log } from "./vite";

/**
 * Implementación de IStorage que utiliza PostgreSQL como base de datos
 * a través de Drizzle ORM.
 */
export class DatabaseStorage implements IStorage {
  /******************************
   * OPERACIONES DE USUARIO
   ******************************/
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getUser: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getUserByEmail: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.firebaseUserId, firebaseId)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getUserByFirebaseId: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      // En Drizzle, no necesitamos pasar explícitamente createdAt y updatedAt 
      // si están configurados con defaultNow() en el schema
      const [user] = await db.insert(users).values({
        ...userData
      }).returning();
      return user;
    } catch (error) {
      log(`Error en createUser: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const now = new Date();
      const [updatedUser] = await db.update(users)
        .set({
          ...userData,
          updatedAt: now
        })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      log(`Error en updateUser: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE PERSONAJES
   ******************************/
  
  async getCharacters(userId: number): Promise<Character[]> {
    try {
      return await db.select().from(characters).where(eq(characters.userId, userId));
    } catch (error) {
      log(`Error en getCharacters: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    try {
      const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getCharacter: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    try {
      // Asegurar que todos los campos requeridos estén definidos
      const dataToInsert = {
        ...characterData,
        type: characterData.type || 'child'
      };
      
      const [character] = await db.insert(characters).values(dataToInsert).returning();
      return character;
    } catch (error) {
      log(`Error en createCharacter: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateCharacter(id: number, characterData: Partial<Character>): Promise<Character | undefined> {
    try {
      const now = new Date();
      const [updatedCharacter] = await db.update(characters)
        .set({
          ...characterData,
          updatedAt: now
        })
        .where(eq(characters.id, id))
        .returning();
      return updatedCharacter;
    } catch (error) {
      log(`Error en updateCharacter: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async deleteCharacter(id: number): Promise<boolean> {
    try {
      // Primero eliminamos las relaciones en book_characters
      await db.delete(bookCharacters)
        .where(eq(bookCharacters.characterId, id));
      
      // Ahora eliminamos el personaje
      const result = await db.delete(characters)
        .where(eq(characters.id, id))
        .returning({ id: characters.id });
      
      return result.length > 0;
    } catch (error) {
      log(`Error en deleteCharacter: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE TEMAS DE LIBROS
   ******************************/
  
  async getBookThemes(): Promise<BookTheme[]> {
    try {
      return await db.select().from(bookThemes);
    } catch (error) {
      log(`Error en getBookThemes: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getBookTheme(id: number): Promise<BookTheme | undefined> {
    try {
      const result = await db.select().from(bookThemes).where(eq(bookThemes.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getBookTheme: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE TEMAS PERSONALIZADOS
   ******************************/
  
  async getCustomBookThemes(userId: number): Promise<CustomBookTheme[]> {
    try {
      return await db.select().from(customBookThemes).where(eq(customBookThemes.userId, userId));
    } catch (error) {
      log(`Error en getCustomBookThemes: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getCustomBookTheme(id: number): Promise<CustomBookTheme | undefined> {
    try {
      const result = await db.select().from(customBookThemes).where(eq(customBookThemes.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getCustomBookTheme: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createCustomBookTheme(themeData: InsertCustomBookTheme): Promise<CustomBookTheme> {
    try {
      const [theme] = await db.insert(customBookThemes).values({
        ...themeData
      }).returning();
      return theme;
    } catch (error) {
      log(`Error en createCustomBookTheme: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateCustomBookTheme(id: number, themeData: Partial<CustomBookTheme>): Promise<CustomBookTheme | undefined> {
    try {
      const now = new Date();
      const [updatedTheme] = await db.update(customBookThemes)
        .set({
          ...themeData,
          updatedAt: now
        })
        .where(eq(customBookThemes.id, id))
        .returning();
      return updatedTheme;
    } catch (error) {
      log(`Error en updateCustomBookTheme: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async deleteCustomBookTheme(id: number): Promise<boolean> {
    try {
      const result = await db.delete(customBookThemes)
        .where(eq(customBookThemes.id, id))
        .returning({ id: customBookThemes.id });
      
      return result.length > 0;
    } catch (error) {
      log(`Error en deleteCustomBookTheme: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE LIBROS
   ******************************/
  
  async getBooks(userId: number): Promise<Book[]> {
    try {
      return await db.select()
        .from(books)
        .where(eq(books.userId, userId))
        .orderBy(desc(books.createdAt));
    } catch (error) {
      log(`Error en getBooks: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getBooksByCharacter(characterId: number): Promise<Book[]> {
    try {
      // Unión de tablas para buscar libros por personaje
      const result = await db.select({
        book: books
      })
      .from(books)
      .innerJoin(
        bookCharacters,
        and(
          eq(books.id, bookCharacters.bookId),
          eq(bookCharacters.characterId, characterId)
        )
      )
      .orderBy(desc(books.createdAt));
      
      return result.map(row => row.book);
    } catch (error) {
      log(`Error en getBooksByCharacter: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getBook(id: number): Promise<Book | undefined> {
    try {
      const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getBook: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createBook(bookData: InsertBook): Promise<Book> {
    try {
      // Asegurar que todos los campos requeridos estén definidos
      const dataToInsert = {
        ...bookData,
        format: bookData.format || 'digital',
        status: bookData.status || 'draft',
        numPages: bookData.numPages || 10,
        content: bookData.content || null,
        previewImage: bookData.previewImage || null,
        themeId: bookData.themeId || null,
        customThemeId: bookData.customThemeId || null,
        orderReference: bookData.orderReference || null
      };
      
      const [book] = await db.insert(books).values(dataToInsert).returning();
      return book;
    } catch (error) {
      log(`Error en createBook: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined> {
    try {
      const now = new Date();
      const [updatedBook] = await db.update(books)
        .set({
          ...bookData,
          updatedAt: now
        })
        .where(eq(books.id, id))
        .returning();
      return updatedBook;
    } catch (error) {
      log(`Error en updateBook: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async deleteBook(id: number): Promise<boolean> {
    try {
      // Primero eliminamos las relaciones en book_characters
      await db.delete(bookCharacters)
        .where(eq(bookCharacters.bookId, id));
      
      // Ahora eliminamos el libro
      const result = await db.delete(books)
        .where(eq(books.id, id))
        .returning({ id: books.id });
      
      return result.length > 0;
    } catch (error) {
      log(`Error en deleteBook: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE RELACIONES LIBRO-PERSONAJE
   ******************************/
  
  async getBookCharacters(bookId: number): Promise<BookCharacter[]> {
    try {
      return await db.select()
        .from(bookCharacters)
        .where(eq(bookCharacters.bookId, bookId));
    } catch (error) {
      log(`Error en getBookCharacters: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async addCharacterToBook(bookCharacterData: InsertBookCharacter): Promise<BookCharacter> {
    try {
      // Asegurar que el rol está definido
      const dataToInsert = {
        ...bookCharacterData,
        role: bookCharacterData.role || 'protagonist'
      };
      
      const [bookCharacter] = await db.insert(bookCharacters)
        .values(dataToInsert)
        .returning();
      return bookCharacter;
    } catch (error) {
      log(`Error en addCharacterToBook: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async removeCharacterFromBook(bookId: number, characterId: number): Promise<boolean> {
    try {
      const result = await db.delete(bookCharacters)
        .where(
          and(
            eq(bookCharacters.bookId, bookId),
            eq(bookCharacters.characterId, characterId)
          )
        )
        .returning({ id: bookCharacters.id });
      
      return result.length > 0;
    } catch (error) {
      log(`Error en removeCharacterFromBook: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE PEDIDOS
   ******************************/
  
  async getOrders(userId: number): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      log(`Error en getOrders: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getOrder: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      const [order] = await db.insert(orders).values({
        ...orderData
      }).returning();
      return order;
    } catch (error) {
      log(`Error en createOrder: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const now = new Date();
      const [updatedOrder] = await db.update(orders)
        .set({
          status,
          updatedAt: now
        })
        .where(eq(orders.id, id))
        .returning();
      return updatedOrder;
    } catch (error) {
      log(`Error en updateOrderStatus: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE MÉTODOS DE PAGO
   ******************************/
  
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    try {
      const now = new Date();
      const [updatedUser] = await db.update(users)
        .set({
          stripeCustomerId,
          updatedAt: now
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      log(`Error en updateStripeCustomerId: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updatePayPalCustomerId(userId: number, paypalCustomerId: string): Promise<User | undefined> {
    try {
      const now = new Date();
      const [updatedUser] = await db.update(users)
        .set({
          paypalCustomerId,
          updatedAt: now
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      log(`Error en updatePayPalCustomerId: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE NIVELES DE SUSCRIPCIÓN
   ******************************/
  
  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    try {
      return await db.select().from(subscriptionTiers);
    } catch (error) {
      log(`Error en getSubscriptionTiers: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined> {
    try {
      const result = await db.select().from(subscriptionTiers).where(eq(subscriptionTiers.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getSubscriptionTier: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createSubscriptionTier(tierData: InsertSubscriptionTier): Promise<SubscriptionTier> {
    try {
      const [tier] = await db.insert(subscriptionTiers).values({
        ...tierData
      }).returning();
      return tier;
    } catch (error) {
      log(`Error en createSubscriptionTier: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateSubscriptionTier(id: number, tierData: Partial<SubscriptionTier>): Promise<SubscriptionTier | undefined> {
    try {
      const now = new Date();
      const [updatedTier] = await db.update(subscriptionTiers)
        .set({
          ...tierData,
          updatedAt: now
        })
        .where(eq(subscriptionTiers.id, id))
        .returning();
      return updatedTier;
    } catch (error) {
      log(`Error en updateSubscriptionTier: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE SUSCRIPCIONES
   ******************************/
  
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    try {
      return await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.createdAt));
    } catch (error) {
      log(`Error en getUserSubscriptions: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    try {
      const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getSubscription: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    try {
      const [subscription] = await db.insert(subscriptions).values({
        ...subscriptionData,
        cancelAtPeriodEnd: false // Por defecto, no cancelar al final del período
      }).returning();
      return subscription;
    } catch (error) {
      log(`Error en createSubscription: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    try {
      const now = new Date();
      const [updatedSubscription] = await db.update(subscriptions)
        .set({
          ...subscriptionData,
          updatedAt: now
        })
        .where(eq(subscriptions.id, id))
        .returning();
      return updatedSubscription;
    } catch (error) {
      log(`Error en updateSubscription: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async cancelSubscription(id: number, cancelAtPeriodEnd: boolean = true): Promise<Subscription | undefined> {
    try {
      const now = new Date();
      const [updatedSubscription] = await db.update(subscriptions)
        .set({
          cancelAtPeriodEnd,
          updatedAt: now
        })
        .where(eq(subscriptions.id, id))
        .returning();
      return updatedSubscription;
    } catch (error) {
      log(`Error en cancelSubscription: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  /******************************
   * OPERACIONES DE ENTREGAS DE LIBROS
   ******************************/
  
  async getBookDeliveries(userId: number): Promise<BookDelivery[]> {
    try {
      return await db.select()
        .from(bookDeliveries)
        .where(eq(bookDeliveries.userId, userId))
        .orderBy(desc(bookDeliveries.createdAt));
    } catch (error) {
      log(`Error en getBookDeliveries: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getBookDeliveriesBySubscription(subscriptionId: number): Promise<BookDelivery[]> {
    try {
      return await db.select()
        .from(bookDeliveries)
        .where(eq(bookDeliveries.subscriptionId, subscriptionId))
        .orderBy(desc(bookDeliveries.createdAt));
    } catch (error) {
      log(`Error en getBookDeliveriesBySubscription: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async getBookDelivery(id: number): Promise<BookDelivery | undefined> {
    try {
      const result = await db.select().from(bookDeliveries).where(eq(bookDeliveries.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error en getBookDelivery: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async createBookDelivery(deliveryData: InsertBookDelivery): Promise<BookDelivery> {
    try {
      const [delivery] = await db.insert(bookDeliveries).values({
        ...deliveryData,
        emailSent: false // Por defecto, no se ha enviado email
      }).returning();
      return delivery;
    } catch (error) {
      log(`Error en createBookDelivery: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async updateBookDeliveryStatus(id: number, status: string): Promise<BookDelivery | undefined> {
    try {
      const now = new Date();
      const [updatedDelivery] = await db.update(bookDeliveries)
        .set({
          status,
          updatedAt: now
        })
        .where(eq(bookDeliveries.id, id))
        .returning();
      return updatedDelivery;
    } catch (error) {
      log(`Error en updateBookDeliveryStatus: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }

  async markDeliveryEmailSent(id: number): Promise<BookDelivery | undefined> {
    try {
      const now = new Date();
      const [updatedDelivery] = await db.update(bookDeliveries)
        .set({
          emailSent: true,
          updatedAt: now
        })
        .where(eq(bookDeliveries.id, id))
        .returning();
      return updatedDelivery;
    } catch (error) {
      log(`Error en markDeliveryEmailSent: ${error instanceof Error ? error.message : String(error)}`, 'database');
      throw error;
    }
  }
}