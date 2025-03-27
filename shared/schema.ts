import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date } from "drizzle-orm/pg-core";
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
export const characters = pgTable("characters", {
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
});

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
export const customBookThemes = pgTable("custom_book_themes", {
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
});

export const insertCustomBookThemeSchema = createInsertSchema(customBookThemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Book schema
export const books = pgTable("books", {
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
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabla de relación entre libros y personajes
export const bookCharacters = pgTable("book_characters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  characterId: integer("character_id").notNull().references(() => characters.id),
  role: text("role").default('protagonist'), // protagonist, secondary, antagonist, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookCharacterSchema = createInsertSchema(bookCharacters).omit({
  id: true,
  createdAt: true,
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  characterId: integer("character_id").notNull().references(() => characters.id),
  message: text("message").notNull(),
  sender: text("sender").notNull(), // user or system
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Orders schema
export const orders = pgTable("orders", {
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
});

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

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Subscription tiers schema
export const subscriptionTiers = pgTable("subscription_tiers", {
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
});

export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User subscriptions schema
export const subscriptions = pgTable("subscriptions", {
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
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Book delivery schema (para control de envío de libros por suscripción)
export const bookDeliveries = pgTable("book_deliveries", {
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
});

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
