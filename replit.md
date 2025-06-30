# Utale - Personalized Children's Book Creation Platform

## Overview
Utale is a full-stack web application that enables users to create personalized children's books using AI-powered content generation. The platform allows parents to create character profiles for their children and generate custom stories with AI-generated text and illustrations.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React with TypeScript, Vite build tool
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: Firebase Authentication integration

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for text and image generation
- **Payment Processing**: Stripe for subscription management
- **File Storage**: Firebase Storage and Cloudinary for image management
- **Authentication**: Firebase Admin SDK for token verification

### Database Design
The application uses a comprehensive schema supporting:
- User management with Firebase integration
- Character profiles with detailed attributes (personality, physical traits, interests)
- Book generation with draft system
- Subscription tiers and management
- Order and delivery tracking

## Key Components

### Character Management
- Multi-type character support (children, adults, pets, fantasy creatures)
- Detailed character profiles with physical descriptions, personality traits, and preferences
- Age-appropriate validation (0-18 for children, 0-150 for adults)
- Character relationship mapping

### Book Generation System
- AI-powered story generation using OpenAI GPT models
- Custom prompt engineering for age-appropriate content
- DALL-E integration for illustration generation
- Multiple book themes and customization options
- Draft system for saving work-in-progress

### Subscription Management
- Tiered subscription plans with different book allocations
- Stripe integration for payment processing
- Usage tracking and delivery scheduling
- Automatic billing and renewal management

### File Management
- Firebase Storage for user-generated content
- Cloudinary for image optimization and transformation
- Organized storage structure by user and book
- PDF generation for final book output

## Data Flow

### Book Creation Process
1. User selects character profiles from their collection
2. System generates AI prompts based on character details and selected theme
3. OpenAI generates story content and illustration prompts
4. DALL-E creates images based on the generated prompts
5. Content is assembled into a complete book structure
6. Final PDF is generated and stored

### Authentication Flow
1. User authenticates via Firebase Auth (email/password or Google OAuth)
2. Backend validates Firebase tokens and creates/retrieves user record
3. User sessions are maintained through Firebase Auth state

### Payment Processing
1. User selects subscription tier or book purchase
2. Stripe checkout session is created
3. Payment confirmation triggers subscription activation
4. Usage limits are enforced based on subscription level

## External Dependencies

### AI Services
- **OpenAI API**: Text generation (GPT models) and image generation (DALL-E)
- Custom prompt engineering for child-appropriate content
- Rate limiting and error handling for API calls

### Payment Integration
- **Stripe**: Subscription management, payment processing, webhook handling
- Tiered pricing model with usage-based restrictions

### Storage Services
- **Firebase Storage**: User files, book images, PDFs
- **Cloudinary**: Image optimization, transformation, and CDN delivery

### Authentication
- **Firebase Authentication**: User registration, login, OAuth providers
- **Firebase Admin SDK**: Server-side token verification

## Deployment Strategy

The application is configured for deployment on Replit with:
- Environment-based configuration management
- PostgreSQL database connection via environment variables
- Vite build process for optimized frontend assets
- Express server with static file serving in production
- Proper error handling and logging throughout the application

## Changelog
- June 30, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.