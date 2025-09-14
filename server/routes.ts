import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertProductSchema, insertInvoiceSchema, InvoiceItem } from "@shared/schema";
import { PDFService } from "./services/pdf";
import { EmailService } from "./services/email";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(({ password, ...user }) => user)); // Remove password from response
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const { search } = req.query;
      let customers;
      
      if (search) {
        customers = await storage.searchCustomers(search as string);
      } else {
        customers = await storage.getAllCustomers();
      }
      
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customerData = req.body;
      const customer = await storage.updateCustomer(id, customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCustomer(id);
      if (success) {
        res.json({ message: "Customer deleted successfully" });
      } else {
        res.status(404).json({ message: "Customer not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { search } = req.query;
      let products;
      
      if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      if (success) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const { search } = req.query;
      let invoices;
      
      if (search) {
        invoices = await storage.searchInvoices(search as string);
      } else {
        invoices = await storage.getAllInvoices();
      }
      
      // Enrich invoices with customer data
      const customers = await storage.getAllCustomers();
      const enrichedInvoices = invoices.map((invoice) => {
        const customer = customers.find((c) => c.id === invoice.customerId);
        return {
          ...invoice,
          customerName: customer?.name || "Unknown Customer",
          customerEmail: customer?.email || "",
        };
      });
      
      res.json(enrichedInvoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const customer = await storage.getCustomer(invoice.customerId);
      res.json({
        ...invoice,
        customer,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { customerId, items, dueDate } = req.body;
      
      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;
      
      const enrichedItems: InvoiceItem[] = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        const itemSubtotal = item.quantity * parseFloat(product.price);
        const itemDiscount = (itemSubtotal * item.discount) / 100;
        const itemTotal = itemSubtotal - itemDiscount;
        const itemTax = (itemTotal * parseFloat(product.taxRate)) / 100;
        
        enrichedItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          price: parseFloat(product.price),
          discount: item.discount,
          total: itemTotal,
        });
        
        subtotal += itemSubtotal;
        discountAmount += itemDiscount;
        taxAmount += itemTax;
      }
      
      const total = subtotal - discountAmount + taxAmount;
      const invoiceNumber = await storage.generateInvoiceNumber();
      
      const invoiceData = {
        invoiceNumber,
        customerId,
        items: enrichedItems,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        discountAmount: discountAmount.toString(),
        total: total.toString(),
        status: "pending",
        paymentStatus: "unpaid",
        dueDate: new Date(dueDate),
      };
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Invoice creation error:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const invoice = await storage.updateInvoice(id, updateData);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInvoice(id);
      if (success) {
        res.json({ message: "Invoice deleted successfully" });
      } else {
        res.status(404).json({ message: "Invoice not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // PDF Generation
  app.get("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const customer = await storage.getCustomer(invoice.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const pdfBuffer = await PDFService.generateInvoicePDF(invoice, customer);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Email Invoice
  app.post("/api/invoices/:id/email", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const customer = await storage.getCustomer(invoice.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const pdfBuffer = await PDFService.generateInvoicePDF(invoice, customer);
      const success = await EmailService.sendInvoiceEmail(
        customer.email,
        customer.name,
        invoice.invoiceNumber,
        pdfBuffer
      );
      
      if (success) {
        res.json({ message: "Invoice emailed successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Dashboard
  app.get("/api/dashboard", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Generate new invoice number
  app.get("/api/invoices/next-number", async (req, res) => {
    try {
      const invoiceNumber = await storage.generateInvoiceNumber();
      res.json({ invoiceNumber });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invoice number" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
