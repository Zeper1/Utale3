import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  firebaseUserId: text("firebase_user_id").unique(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  paypalCustomerId: text("paypal_customer_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Personajes para los libros (anteriormente child profiles)
export const characters = pgTable(
  "characters", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    type: text("type").notNull().default('child'), // child, toy, pet, fantasy, other
    age: integer("age"),
    gender: text("gender"),
    avatarUrl: text("avatar_url"),
    physicalDescription: text("physical_description"),
    personality: text("personality"),
    likes: text("likes"),
    dislikes: text("dislikes"),
    interests: jsonb("interests").$type<string[]>(),
    favorites: jsonb("favorites").$type<Record<string, string>>(),
    relationships: jsonb("relationships").$type<Record<string, string>>(), // relaciones con otros personajes
    traits: jsonb("traits").$type<string[]>(),
    additionalInfo: text("additional_info"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para buscar rápidamente los personajes de un usuario
      userIdIdx: index("characters_user_id_idx").on(table.userId),
      // Índice para buscar personajes por nombre y usuario
      userIdNameIdx: index("characters_user_id_name_idx").on(table.userId, table.name),
    };
  }
);

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Book theme schema
export const bookThemes = pgTable("book_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ageRange: text("age_range").notNull(),
  coverImage: text("cover_image"),
  active: boolean("active").default(true).notNull(),
});

export const insertBookThemeSchema = createInsertSchema(bookThemes).omit({
  id: true,
});

// Tema personalizado para libros
export const customBookThemes = pgTable(
  "custom_book_themes", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    description: text("description"),
    setting: text("setting"), // escenario/ambientación
    characters: text("characters"), // personajes adicionales
    plotType: text("plot_type"), // tipo de trama
    includeMoralLesson: boolean("include_moral_lesson").default(false),
    additionalNotes: text("additional_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para buscar temas personalizados de un usuario
      userIdIdx: index("custom_book_themes_user_id_idx").on(table.userId),
    };
  }
);

export const insertCustomBookThemeSchema = createInsertSchema(customBookThemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Book schema
export const books = pgTable(
  "books", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    themeId: integer("theme_id").references(() => bookThemes.id),
    customThemeId: integer("custom_theme_id").references(() => customBookThemes.id),
    content: jsonb("content").$type<Record<string, any>>(),
    previewImage: text("preview_image"),
    numPages: integer("num_pages").default(10).notNull(),
    format: text("format").notNull().default('digital'), // digital, softcover, hardcover
    status: text("status").notNull().default('draft'), // draft, preview, completed, ordered
    orderReference: text("order_reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para el dashboard - libros por usuario ordenados por fecha
      userIdCreatedAtIdx: index("books_user_id_created_at_idx").on(table.userId, table.createdAt),
      // Índice para filtrar por estado
      statusIdx: index("books_status_idx").on(table.status),
      // Índice combinado para usuario y estado
      userIdStatusIdx: index("books_user_id_status_idx").on(table.userId, table.status),
    };
  }
);

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabla de relación entre libros y personajes
export const bookCharacters = pgTable(
  "book_characters", 
  {
    id: serial("id").primaryKey(),
    bookId: integer("book_id").notNull().references(() => books.id),
    characterId: integer("character_id").notNull().references(() => characters.id),
    role: text("role").default('protagonist'), // protagonist, secondary, antagonist, etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índices para rápidas búsquedas en ambas direcciones
      bookIdIdx: index("book_characters_book_id_idx").on(table.bookId),
      characterIdIdx: index("book_characters_character_id_idx").on(table.characterId),
      // Índice para buscar combinaciones de libro y personaje - evitar duplicados
      bookCharacterIdx: index("book_character_idx").on(table.bookId, table.characterId),
    };
  }
);

export const insertBookCharacterSchema = createInsertSchema(bookCharacters).omit({
  id: true,
  createdAt: true,
});

// El modelo de chat ha sido eliminado

// Orders schema
export const orders = pgTable(
  "orders", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    bookId: integer("book_id").notNull().references(() => books.id),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default('usd'),
    paymentMethod: text("payment_method").notNull(), // stripe, paypal
    paymentId: text("payment_id").notNull(),
    status: text("status").notNull(), // pending, completed, failed
    shippingAddress: jsonb("shipping_address").$type<Record<string, string>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para obtener órdenes por usuario
      userIdIdx: index("orders_user_id_idx").on(table.userId),
      // Índice para buscar órdenes por estado
      statusIdx: index("orders_status_idx").on(table.status),
    };
  }
);

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type BookTheme = typeof bookThemes.$inferSelect;
export type InsertBookTheme = z.infer<typeof insertBookThemeSchema>;

export type CustomBookTheme = typeof customBookThemes.$inferSelect;
export type InsertCustomBookTheme = z.infer<typeof insertCustomBookThemeSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type BookCharacter = typeof bookCharacters.$inferSelect;
export type InsertBookCharacter = z.infer<typeof insertBookCharacterSchema>;

// Los tipos de chat han sido eliminados

// Subscription tiers schema
export const subscriptionTiers = pgTable(
  "subscription_tiers", 
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    books: integer("books").notNull(),
    pages: integer("pages").notNull(),
    pricePerWeek: integer("price_per_week").notNull(), // en céntimos
    discount: integer("discount").notNull(), // porcentaje de descuento
    description: text("description").notNull(),
    stripePriceId: text("stripe_price_id").unique(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para filtrar tiers activos
      activeIdx: index("subscription_tiers_active_idx").on(table.active),
    };
  }
);

export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User subscriptions schema
export const subscriptions = pgTable(
  "subscriptions", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    tierId: integer("tier_id").notNull().references(() => subscriptionTiers.id),
    status: text("status").notNull(), // active, paused, canceled
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para suscripciones por usuario
      userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
      // Índice para suscripciones por estado
      statusIdx: index("subscriptions_status_idx").on(table.status),
      // Índice combinado para usuario y estado
      userIdStatusIdx: index("subscriptions_user_id_status_idx").on(table.userId, table.status),
      // Índice para periodo de fin - importante para renovaciones
      currentPeriodEndIdx: index("subscriptions_current_period_end_idx").on(table.currentPeriodEnd),
    };
  }
);

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Book delivery schema (para control de envío de libros por suscripción)
export const bookDeliveries = pgTable(
  "book_deliveries", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id),
    bookId: integer("book_id").notNull().references(() => books.id),
    characterId: integer("character_id").notNull().references(() => characters.id),
    deliveryDate: timestamp("delivery_date").notNull(),
    deliveryWeek: date("delivery_week").notNull(), // La semana a la que pertenece esta entrega
    deliveryMethod: text("delivery_method").notNull(), // email, download, etc.
    status: text("status").notNull(), // pending, sent, failed
    emailSent: boolean("email_sent").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para entregas por usuario
      userIdIdx: index("book_deliveries_user_id_idx").on(table.userId),
      // Índice para entregas por suscripción
      subscriptionIdIdx: index("book_deliveries_subscription_id_idx").on(table.subscriptionId),
      // Índice para entregas por estado
      statusIdx: index("book_deliveries_status_idx").on(table.status),
      // Índice combinado para suscripción y estado
      subscriptionIdStatusIdx: index("book_deliveries_subscription_id_status_idx").on(table.subscriptionId, table.status),
      // Índice combinado para usuario y estado
      userIdStatusIdx: index("book_deliveries_user_id_status_idx").on(table.userId, table.status),
      // Índice para email enviados
      emailSentIdx: index("book_deliveries_email_sent_idx").on(table.emailSent),
    };
  }
);

export const insertBookDeliverySchema = createInsertSchema(bookDeliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type BookDelivery = typeof bookDeliveries.$inferSelect;
export type InsertBookDelivery = z.infer<typeof insertBookDeliverySchema>;