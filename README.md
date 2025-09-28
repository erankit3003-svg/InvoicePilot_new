# InvoicePro - Invoice Management System

A comprehensive full-stack invoice management system built with React, TypeScript, Express, and PostgreSQL. This application allows businesses to manage invoices, customers, products, and generate professional PDF invoices with email notifications.

## 🚀 Features

### Invoice Management
- **Create Invoices**: Generate invoices with multiple line items, tax calculations, and discounts
- **Invoice Templates**: Professional invoice templates with company branding
- **PDF Generation**: Export invoices as PDF documents with proper formatting
- **Invoice Tracking**: Track invoice status (Draft, Sent, Paid, Overdue)
- **Duplicate Invoices**: Quickly duplicate existing invoices for recurring billing

### Customer Management
- **Customer Database**: Maintain comprehensive customer information
- **Contact Details**: Store customer names, emails, phone numbers, and addresses
- **GST Integration**: Support for GST ID management for Indian businesses
- **Customer History**: View all invoices associated with each customer

### Product Management
- **Product Catalog**: Maintain a catalog of products and services
- **SKU Management**: Unique product identification with SKU codes
- **Pricing**: Set and manage product prices in Indian Rupees (₹)
- **Inventory Tracking**: Basic inventory management capabilities

### Financial Features
- **Currency Support**: All prices displayed in Indian Rupees (₹)
- **Tax Calculations**: Automatic tax calculations with configurable rates
- **Discount Management**: Apply percentage-based discounts
- **Financial Reports**: Dashboard with sales analytics and payment tracking

### Reports & Analytics
- **Dashboard**: Overview of total sales, invoices, and pending payments
- **Sales Reports**: Detailed financial reporting and analytics
- **Payment Tracking**: Monitor payment status and overdue invoices
- **Export Capabilities**: Export reports and invoices in various formats

### Email Integration
- **SendGrid Integration**: Automated email notifications for invoices
- **Email Templates**: Professional email templates for invoice delivery
- **Payment Reminders**: Automated reminder emails for overdue payments

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality UI components
- **Lucide React**: Modern icon library
- **React Hook Form**: Form validation and management
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing solution

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **TypeScript**: Type-safe server development
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database (with Neon cloud support)
- **jsPDF**: PDF generation library
- **SendGrid**: Email delivery service

### Development Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler
- **Drizzle Kit**: Database migration tool
- **TypeScript Compiler**: Type checking and compilation

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud-based like Neon)
- **SendGrid API Key** (for email functionality)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd invoicepro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/invoicepro
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=invoicepro

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your-business@example.com

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# (Optional) Seed the database with sample data
npm run db:seed
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts both the frontend (Vite) and backend (Express) servers concurrently on port 5000.

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Operations
```bash
# Generate new migration
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database (caution: this will delete all data)
npm run db:reset
```

## 📁 Project Structure

```
invoicepro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── services/          # Business logic services
│   └── storage.ts         # Data access layer
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and types
├── drizzle/               # Database migrations
└── README.md              # This file
```

## 🎯 Usage Guide

### 1. Dashboard
- Access the main dashboard at the root URL
- View key metrics: total sales, invoice count, pending payments
- Quick access to recent invoices and activities

### 2. Creating Invoices
1. Navigate to the "Invoices" section
2. Click "Create New Invoice"
3. Fill in customer details or select existing customer
4. Add products/services to the invoice
5. Configure tax rates and discounts
6. Save as draft or mark as sent

### 3. Managing Customers
1. Go to the "Customers" section
2. Add new customers with complete contact information
3. Include GST ID for business customers
4. View customer history and associated invoices

### 4. Product Management
1. Access the "Products" section
2. Add products with names, SKUs, and prices
3. Set default pricing in Indian Rupees
4. Organize products by categories

### 5. Generating PDFs
1. Open any invoice
2. Click the "Download PDF" button
3. PDF will be generated with professional formatting
4. Currency displayed as "Rs." for proper PDF compatibility

### 6. Email Integration
1. Configure SendGrid API key in environment variables
2. Send invoices directly to customers via email
3. Track email delivery status
4. Set up automated payment reminders

## 🔧 Configuration

### Currency Settings
The application is configured to use Indian Rupees (₹):
- All frontend displays show ₹ symbol
- PDF generation uses "Rs." prefix for compatibility
- Database stores values as decimal numbers

### Email Templates
Customize email templates in the SendGrid integration:
- Invoice delivery emails
- Payment reminder emails
- Thank you emails

### Tax Configuration
Configure tax rates in the application settings:
- Default GST rates for Indian businesses
- Custom tax rates for different product categories
- Automatic tax calculations

## 🔒 Security Features

- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@codedges.com
- Website: www.codedges.com

## 🏢 About

**InvoicePro** is developed by **codEdges Technologies** - A leading software development company specializing in business automation solutions.

---

© 2025 InvoicePro – A Product by codEdges Technologies | www.codedges.com