import OpenAI from "openai";
import { Book, InsertBook } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Define book content structure
export interface BookPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface BookContent {
  title: string;
  pages: BookPage[];
  summary: string;
  targetAge: string;
  theme: string;
  mainCharacter: string;
}

// Initialize OpenAI client on server side only
let openai: OpenAI | null = null;

/**
 * Generate book content based on child profile
 */
export async function generateBookContent(childProfileId: number, themeId: number): Promise<BookContent> {
  try {
    // Call backend to generate the book content
    const response = await apiRequest(
      "POST", 
      "/api/books/generate-content", 
      { childProfileId, themeId }
    );
    
    if (!response.ok) {
      throw new Error(`Error generating book: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to generate book content:", error);
    throw error;
  }
}

/**
 * Generate images for each page of the book
 */
export async function generateBookImages(bookContent: BookContent): Promise<BookContent> {
  try {
    // Call backend to generate images for each page
    const response = await apiRequest(
      "POST", 
      "/api/books/generate-images", 
      { bookContent }
    );
    
    if (!response.ok) {
      throw new Error(`Error generating images: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to generate book images:", error);
    throw error;
  }
}

/**
 * Create PDF from book content
 */
export async function createBookPDF(bookId: number): Promise<{ url: string }> {
  try {
    // Call backend to generate PDF
    const response = await apiRequest(
      "POST", 
      "/api/books/create-pdf", 
      { bookId }
    );
    
    if (!response.ok) {
      throw new Error(`Error creating PDF: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to create book PDF:", error);
    throw error;
  }
}

/**
 * Save book to database
 */
export async function saveBook(bookData: InsertBook): Promise<Book> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/books", 
      bookData
    );
    
    if (!response.ok) {
      throw new Error(`Error saving book: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to save book:", error);
    throw error;
  }
}

/**
 * Get book by ID
 */
export async function getBook(bookId: number): Promise<Book> {
  try {
    const response = await apiRequest(
      "GET", 
      `/api/books/${bookId}`, 
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching book: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch book:", error);
    throw error;
  }
}

/**
 * Get all books for user
 */
export async function getUserBooks(userId: number): Promise<Book[]> {
  try {
    const response = await apiRequest(
      "GET", 
      `/api/books/user/${userId}`, 
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching user books: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user books:", error);
    throw error;
  }
}

/**
 * Update book status
 */
export async function updateBookStatus(bookId: number, status: string): Promise<Book> {
  try {
    const response = await apiRequest(
      "PATCH", 
      `/api/books/${bookId}/status`, 
      { status }
    );
    
    if (!response.ok) {
      throw new Error(`Error updating book status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to update book status:", error);
    throw error;
  }
}