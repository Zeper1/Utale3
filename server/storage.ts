import { 
  users, type User, type InsertUser,
  characters, type Character, type InsertCharacter,
  bookThemes, type BookTheme, type InsertBookTheme,
  customBookThemes, type CustomBookTheme, type InsertCustomBookTheme,
  books, type Book, type InsertBook,
  bookCharacters, type BookCharacter, type InsertBookCharacter,
  chatMessages, type ChatMessage, type InsertChatMessage,
  orders, type Order, type InsertOrder,
  subscriptions, type Subscription, type InsertSubscription,
  subscriptionTiers, type SubscriptionTier, type InsertSubscriptionTier,
  bookDeliveries, type BookDelivery, type InsertBookDelivery
} from "@shared/schema";

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
  
  // Chat operations
  getChatMessages(characterId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private bookThemes: Map<number, BookTheme>;
  private customBookThemes: Map<number, CustomBookTheme>;
  private books: Map<number, Book>;
  private bookCharacters: Map<number, BookCharacter>;
  private chatMessages: Map<number, ChatMessage>;
  private orders: Map<number, Order>;
  private subscriptionTiers: Map<number, SubscriptionTier>;
  private subscriptions: Map<number, Subscription>;
  private bookDeliveries: Map<number, BookDelivery>;
  
  private userId = 1;
  private characterId = 1;
  private bookThemeId = 1;
  private customThemeId = 1;
  private bookId = 1;
  private bookCharacterId = 1;
  private chatMessageId = 1;
  private orderId = 1;
  private subscriptionTierId = 1;
  private subscriptionId = 1;
  private bookDeliveryId = 1;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.bookThemes = new Map();
    this.customBookThemes = new Map();
    this.books = new Map();
    this.bookCharacters = new Map();
    this.chatMessages = new Map();
    this.orders = new Map();
    this.subscriptionTiers = new Map();
    this.subscriptions = new Map();
    this.bookDeliveries = new Map();
    
    // Initialize some book themes
    this.initializeBookThemes();
    
    // Initialize Spanish book themes
    this.initializeSpanishBookThemes();
  }
  
  private initializeSpanishBookThemes() {
    const themes = [
      {
        name: "Aventura Espacial",
        description: "Acompaña a tu hijo en un emocionante viaje por el cosmos, donde descubrirá planetas extraños y hará amigos alienígenas.",
        ageRange: "4-8",
        coverImage: "aventura-espacial.jpg",
        active: true,
      },
      {
        name: "Reino Submarino",
        description: "Sumérgete con tu hijo mientras explora un mundo submarino encantado lleno de simpáticas criaturas marinas y tesoros escondidos.",
        ageRange: "3-7",
        coverImage: "reino-submarino.jpg",
        active: true,
      },
      {
        name: "Bosque Mágico",
        description: "Sigue a tu hijo mientras descubre un bosque mágico donde animales parlantes y árboles encantados le ayudan en una misión especial.",
        ageRange: "4-9",
        coverImage: "bosque-magico.jpg",
        active: true,
      },
      {
        name: "Piratas del Mediterráneo",
        description: "Embárcate en una aventura pirata por el Mediterráneo, buscando tesoros escondidos y viviendo emocionantes desafíos náuticos.",
        ageRange: "5-10",
        coverImage: "piratas-mediterraneo.jpg",
        active: true,
      },
      {
        name: "Exploradores de Castillos",
        description: "Un viaje fascinante por los castillos más impresionantes de España, descubriendo secretos históricos y leyendas antiguas.",
        ageRange: "6-11",
        coverImage: "exploradores-castillos.jpg",
        active: true,
      },
    ];

    themes.forEach(theme => {
      const id = this.bookThemeId++;
      this.bookThemes.set(id, { 
        ...theme, 
        id,
      } as BookTheme);
    });
  }

  private initializeBookThemes() {
    const themes = [
      {
        name: "Space Adventure",
        description: "Join your child on an exciting journey through the cosmos, where they'll discover strange planets and make alien friends.",
        ageRange: "4-8",
        coverImage: "space-adventure.jpg",
        active: true,
      },
      {
        name: "Underwater Kingdom",
        description: "Dive deep with your child as they explore an enchanted underwater world filled with friendly sea creatures and hidden treasures.",
        ageRange: "3-7",
        coverImage: "underwater-kingdom.jpg",
        active: true,
      },
      {
        name: "Magical Forest",
        description: "Follow your child as they discover a magical forest where talking animals and enchanted trees help them on a special quest.",
        ageRange: "4-9",
        coverImage: "magical-forest.jpg",
        active: true,
      },
    ];

    themes.forEach(theme => {
      const id = this.bookThemeId++;
      this.bookThemes.set(id, { 
        ...theme, 
        id,
      } as BookTheme);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUserId === firebaseId);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Character operations
  async getCharacters(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(character => character.userId === userId);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    const now = new Date();
    const character: Character = { 
      ...characterData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, characterData: Partial<Character>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { 
      ...character, 
      ...characterData,
      updatedAt: new Date()
    };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Book theme operations
  async getBookThemes(): Promise<BookTheme[]> {
    return Array.from(this.bookThemes.values())
      .filter(theme => theme.active);
  }

  async getBookTheme(id: number): Promise<BookTheme | undefined> {
    return this.bookThemes.get(id);
  }
  
  // Custom theme operations
  async getCustomBookThemes(userId: number): Promise<CustomBookTheme[]> {
    return Array.from(this.customBookThemes.values())
      .filter(theme => theme.userId === userId);
  }

  async getCustomBookTheme(id: number): Promise<CustomBookTheme | undefined> {
    return this.customBookThemes.get(id);
  }

  async createCustomBookTheme(themeData: InsertCustomBookTheme): Promise<CustomBookTheme> {
    const id = this.customThemeId++;
    const now = new Date();
    const theme: CustomBookTheme = { 
      ...themeData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.customBookThemes.set(id, theme);
    return theme;
  }

  async updateCustomBookTheme(id: number, themeData: Partial<CustomBookTheme>): Promise<CustomBookTheme | undefined> {
    const theme = this.customBookThemes.get(id);
    if (!theme) return undefined;
    
    const updatedTheme = { 
      ...theme, 
      ...themeData,
      updatedAt: new Date()
    };
    this.customBookThemes.set(id, updatedTheme);
    return updatedTheme;
  }

  async deleteCustomBookTheme(id: number): Promise<boolean> {
    return this.customBookThemes.delete(id);
  }

  // Book operations
  async getBooks(userId: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.userId === userId);
  }

  async getBooksByCharacter(characterId: number): Promise<Book[]> {
    // Primero obtenemos todas las relaciones de este personaje
    const characterRelations = Array.from(this.bookCharacters.values())
      .filter(relation => relation.characterId === characterId);
    
    // Luego obtenemos los libros correspondientes
    const bookIds = characterRelations.map(relation => relation.bookId);
    return Array.from(this.books.values())
      .filter(book => bookIds.includes(book.id));
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(bookData: InsertBook): Promise<Book> {
    const id = this.bookId++;
    const now = new Date();
    const book: Book = { 
      ...bookData, 
      id,
      createdAt: now,
      updatedAt: now,
      status: bookData.status || 'draft'
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    
    const updatedBook = { 
      ...book, 
      ...bookData,
      updatedAt: new Date()
    };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }
  
  // Book character relations
  async getBookCharacters(bookId: number): Promise<BookCharacter[]> {
    return Array.from(this.bookCharacters.values())
      .filter(relation => relation.bookId === bookId);
  }
  
  async addCharacterToBook(bookCharacterData: InsertBookCharacter): Promise<BookCharacter> {
    const id = this.bookCharacterId++;
    const now = new Date();
    const bookCharacter: BookCharacter = {
      ...bookCharacterData,
      id,
      createdAt: now
    };
    this.bookCharacters.set(id, bookCharacter);
    return bookCharacter;
  }
  
  async removeCharacterFromBook(bookId: number, characterId: number): Promise<boolean> {
    // Encontrar la relación a eliminar
    const relationToDelete = Array.from(this.bookCharacters.values())
      .find(relation => relation.bookId === bookId && relation.characterId === characterId);
      
    if (!relationToDelete) return false;
    
    return this.bookCharacters.delete(relationToDelete.id);
  }

  // Chat operations
  async getChatMessages(characterId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.characterId === characterId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageId++;
    const now = new Date();
    const message: ChatMessage = { 
      ...messageData, 
      id,
      createdAt: now
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const order: Order = { 
      ...orderData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      updatedAt: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Payment methods
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId,
      updatedAt: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updatePayPalCustomerId(userId: number, paypalCustomerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      paypalCustomerId,
      updatedAt: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Subscription tier operations
  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    return Array.from(this.subscriptionTiers.values());
  }

  async getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined> {
    return this.subscriptionTiers.get(id);
  }

  async createSubscriptionTier(tierData: InsertSubscriptionTier): Promise<SubscriptionTier> {
    const id = this.subscriptionTierId++;
    const now = new Date();
    const tier: SubscriptionTier = { 
      ...tierData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.subscriptionTiers.set(id, tier);
    return tier;
  }

  async updateSubscriptionTier(id: number, tierData: Partial<SubscriptionTier>): Promise<SubscriptionTier | undefined> {
    const tier = this.subscriptionTiers.get(id);
    if (!tier) return undefined;
    
    const updatedTier = { 
      ...tier, 
      ...tierData,
      updatedAt: new Date()
    };
    this.subscriptionTiers.set(id, updatedTier);
    return updatedTier;
  }
  
  // Subscription operations
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(subscription => subscription.userId === userId);
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const now = new Date();
    const subscription: Subscription = { 
      ...subscriptionData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { 
      ...subscription, 
      ...subscriptionData,
      updatedAt: new Date()
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async cancelSubscription(id: number, cancelAtPeriodEnd: boolean = true): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { 
      ...subscription, 
      status: cancelAtPeriodEnd ? 'active' : 'canceled',
      cancelAtPeriodEnd,
      updatedAt: new Date()
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Book delivery operations
  async getBookDeliveries(userId: number): Promise<BookDelivery[]> {
    return Array.from(this.bookDeliveries.values())
      .filter(delivery => delivery.userId === userId);
  }

  async getBookDeliveriesBySubscription(subscriptionId: number): Promise<BookDelivery[]> {
    return Array.from(this.bookDeliveries.values())
      .filter(delivery => delivery.subscriptionId === subscriptionId);
  }

  async getBookDelivery(id: number): Promise<BookDelivery | undefined> {
    return this.bookDeliveries.get(id);
  }

  async createBookDelivery(deliveryData: InsertBookDelivery): Promise<BookDelivery> {
    const id = this.bookDeliveryId++;
    const now = new Date();
    const delivery: BookDelivery = { 
      ...deliveryData, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.bookDeliveries.set(id, delivery);
    return delivery;
  }

  async updateBookDeliveryStatus(id: number, status: string): Promise<BookDelivery | undefined> {
    const delivery = this.bookDeliveries.get(id);
    if (!delivery) return undefined;
    
    const updatedDelivery = { 
      ...delivery, 
      status,
      updatedAt: new Date()
    };
    this.bookDeliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async markDeliveryEmailSent(id: number): Promise<BookDelivery | undefined> {
    const delivery = this.bookDeliveries.get(id);
    if (!delivery) return undefined;
    
    const updatedDelivery = { 
      ...delivery, 
      emailSent: true,
      updatedAt: new Date()
    };
    this.bookDeliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }
}

export const storage = new MemStorage();
