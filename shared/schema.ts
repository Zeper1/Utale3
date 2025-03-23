import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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

// Child profile schema
export const childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  interests: jsonb("interests").$type<string[]>(),
  favorites: jsonb("favorites").$type<Record<string, string>>(),
  friends: jsonb("friends").$type<string[]>(),
  traits: jsonb("traits").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
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

// Book schema
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  childProfileId: integer("child_profile_id").notNull().references(() => childProfiles.id),
  themeId: integer("theme_id").notNull().references(() => bookThemes.id),
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, any>>(),
  previewImage: text("preview_image"),
  format: text("format").notNull(), // digital, softcover, hardcover
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

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  childProfileId: integer("child_profile_id").notNull().references(() => childProfiles.id),
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

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;

export type BookTheme = typeof bookThemes.$inferSelect;
export type InsertBookTheme = z.infer<typeof insertBookThemeSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
