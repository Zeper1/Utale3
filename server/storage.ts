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
  bookDeliveries, type BookDelivery, type InsertBookDelivery
} from "@shared/schema";
import { serverLogger } from "./lib/logger";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Character operations (antes Child profile)
  getCharacters(userId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, characterData: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Book theme operations
  getBookThemes(): Promise<BookTheme[]>;
  getBookTheme(id: number): Promise<BookTheme | undefined>;
  
  // Custom theme operations
  getCustomBookThemes(userId: number): Promise<CustomBookTheme[]>;
  getCustomBookTheme(id: number): Promise<CustomBookTheme | undefined>;
  createCustomBookTheme(theme: InsertCustomBookTheme): Promise<CustomBookTheme>;
  updateCustomBookTheme(id: number, themeData: Partial<CustomBookTheme>): Promise<CustomBookTheme | undefined>;
  deleteCustomBookTheme(id: number): Promise<boolean>;
  
  // Book operations
  getBooks(userId: number): Promise<Book[]>;
  getBooksByCharacter(characterId: number): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Book character relations
  getBookCharacters(bookId: number): Promise<BookCharacter[]>;
  addCharacterToBook(bookCharacter: InsertBookCharacter): Promise<BookCharacter>;
  removeCharacterFromBook(bookId: number, characterId: number): Promise<boolean>;
  
  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Payment methods
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
  updatePayPalCustomerId(userId: number, paypalCustomerId: string): Promise<User | undefined>;
  
  // Subscription tier operations
  getSubscriptionTiers(): Promise<SubscriptionTier[]>;
  getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined>;
  createSubscriptionTier(tier: InsertSubscriptionTier): Promise<SubscriptionTier>;
  updateSubscriptionTier(id: number, tierData: Partial<SubscriptionTier>): Promise<SubscriptionTier | undefined>;
  
  // Subscription operations
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: number, cancelAtPeriodEnd?: boolean): Promise<Subscription | undefined>;
  
  // Book delivery operations
  getBookDeliveries(userId: number): Promise<BookDelivery[]>;
  getBookDeliveriesBySubscription(subscriptionId: number): Promise<BookDelivery[]>;
  getBookDelivery(id: number): Promise<BookDelivery | undefined>;
  createBookDelivery(delivery: InsertBookDelivery): Promise<BookDelivery>;
  updateBookDeliveryStatus(id: number, status: string): Promise<BookDelivery | undefined>;
  markDeliveryEmailSent(id: number): Promise<BookDelivery | undefined>;
  
  // Book draft operations
  getUserBookDrafts(userId: number): Promise<BookDraft[]>;
  getBookDraft(id: number): Promise<BookDraft | undefined>;
  saveBookDraft(draftData: InsertBookDraft): Promise<BookDraft>;
  updateBookDraft(id: number, draftData: Partial<BookDraft>): Promise<BookDraft | undefined>;
  deleteBookDraft(id: number): Promise<boolean>;
}

// Importamos la implementación de DatabaseStorage
import { DatabaseStorage } from './databaseStorage';

// Creamos y exportamos la instancia de almacenamiento basada en base de datos
export const storage = new DatabaseStorage();

// Log para confirmar la transición completa
serverLogger.info("Sistema de almacenamiento inicializado: DatabaseStorage (MemStorage ha sido eliminado completamente)");