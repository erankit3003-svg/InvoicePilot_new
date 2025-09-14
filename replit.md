# Overview

This is a full-stack invoice management system called "InvoicePro" built with React, TypeScript, Express, and PostgreSQL. The application provides a comprehensive solution for managing invoices, customers, products, and business reports with features like PDF generation, email notifications, and a responsive dashboard interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with custom styling for accessible, consistent components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular component architecture with reusable UI components in `/components/ui/`

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Request Handling**: JSON parsing middleware and custom logging for API requests
- **File-based Storage**: JSON files in `/data/` directory for development (users, customers, products, invoices)
- **Services**: Separate service classes for PDF generation and email functionality
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development Setup**: Vite integration for seamless full-stack development

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for production (configured but using file storage for development)
- **Schema Definition**: Shared schema definitions in `/shared/schema.ts` using Drizzle and Zod
- **Data Models**: Users, customers, products, and invoices with proper relationships
- **Validation**: Zod schemas for runtime type validation and form handling
- **Development Storage**: JSON file-based storage system with CRUD operations

## Authentication and Authorization
- **Simple Authentication**: Username/password authentication without sessions
- **Local Storage**: User data persisted in browser localStorage
- **Role-based Access**: Basic role system (admin/staff) defined in user schema
- **Protected Routes**: Authentication context provider for managing login state

## PDF and Email Integration
- **PDF Generation**: jsPDF library for client-side and server-side invoice PDF creation
- **Email Service**: SendGrid integration for sending invoices via email
- **File Handling**: PDF download functionality and email attachment support

## Form Management
- **Form Validation**: React Hook Form with Zod resolvers for type-safe form handling
- **Dynamic Forms**: Complex invoice forms with dynamic item management
- **Field Arrays**: Support for adding/removing invoice line items dynamically

## Development and Build Process
- **Development Server**: Vite dev server with HMR and error overlay
- **Build Process**: Separate client and server builds with ESBuild for server bundling
- **TypeScript**: Strict TypeScript configuration with path mapping for clean imports
- **Code Organization**: Monorepo structure with shared types and utilities

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and data fetching
- **react-hook-form**: Form state management and validation
- **wouter**: Lightweight React routing library
- **drizzle-orm**: Type-safe SQL query builder and schema management
- **@neondatabase/serverless**: PostgreSQL database connection for serverless deployment

## UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for conditional CSS class names

## PDF and Email Services
- **jspdf**: Client-side PDF generation library
- **@sendgrid/mail**: Email service integration for sending invoices
- **jspdf-autotable**: Table generation plugin for jsPDF

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type checking and enhanced development experience
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced debugging

## Database and Validation
- **drizzle-kit**: Database migration and schema management tools
- **zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

## Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **nanoid**: Unique ID generation for entities