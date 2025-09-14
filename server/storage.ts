import {
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Invoice,
  type InsertInvoice,
  type DashboardMetrics,
  type InvoiceItem,
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<boolean>;
  getAllCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;

  // Invoice methods
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<boolean>;
  getAllInvoices(): Promise<Invoice[]>;
  searchInvoices(query: string): Promise<Invoice[]>;
  getInvoicesByCustomer(customerId: string): Promise<Invoice[]>;
  generateInvoiceNumber(): Promise<string>;

  // Dashboard methods
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export class JSONStorage implements IStorage {
  private usersFile = path.join(DATA_DIR, "users.json");
  private customersFile = path.join(DATA_DIR, "customers.json");
  private productsFile = path.join(DATA_DIR, "products.json");
  private invoicesFile = path.join(DATA_DIR, "invoices.json");

  constructor() {
    this.ensureDataDirectory();
    this.initializeFiles();
  }

  private async ensureDataDirectory() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private async initializeFiles() {
    const files = [
      { path: this.usersFile, defaultData: [] },
      { path: this.customersFile, defaultData: [] },
      { path: this.productsFile, defaultData: [] },
      { path: this.invoicesFile, defaultData: [] },
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.defaultData, null, 2));
      }
    }

    // Create default admin user if no users exist
    const users = await this.getAllUsers();
    if (users.length === 0) {
      await this.createUser({
        username: "admin",
        password: "admin123", // In production, this should be hashed
        email: "admin@invoicepro.com",
        role: "admin",
      });
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const users = await this.readJsonFile<User>(this.usersFile);
    return users.find((user) => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.readJsonFile<User>(this.usersFile);
    return users.find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await this.readJsonFile<User>(this.usersFile);
    const user: User = {
      ...insertUser,
      role: insertUser.role || "staff",
      id: randomUUID(),
      createdAt: new Date(),
    };
    users.push(user);
    await this.writeJsonFile(this.usersFile, users);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User> {
    const users = await this.readJsonFile<User>(this.usersFile);
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) throw new Error("User not found");
    
    users[index] = { ...users[index], ...updateData };
    await this.writeJsonFile(this.usersFile, users);
    return users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.readJsonFile<User>(this.usersFile);
    const initialLength = users.length;
    const filteredUsers = users.filter((user) => user.id !== id);
    await this.writeJsonFile(this.usersFile, filteredUsers);
    return filteredUsers.length < initialLength;
  }

  async getAllUsers(): Promise<User[]> {
    return this.readJsonFile<User>(this.usersFile);
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.readJsonFile<Customer>(this.customersFile);
    return customers.find((customer) => customer.id === id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const customers = await this.readJsonFile<Customer>(this.customersFile);
    return customers.find((customer) => customer.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customers = await this.readJsonFile<Customer>(this.customersFile);
    const customer: Customer = {
      ...insertCustomer,
      phone: insertCustomer.phone || null,
      address: insertCustomer.address || null,
      gstId: insertCustomer.gstId || null,
      id: randomUUID(),
      createdAt: new Date(),
    };
    customers.push(customer);
    await this.writeJsonFile(this.customersFile, customers);
    return customer;
  }

  async updateCustomer(id: string, updateData: Partial<InsertCustomer>): Promise<Customer> {
    const customers = await this.readJsonFile<Customer>(this.customersFile);
    const index = customers.findIndex((customer) => customer.id === id);
    if (index === -1) throw new Error("Customer not found");
    
    customers[index] = { ...customers[index], ...updateData };
    await this.writeJsonFile(this.customersFile, customers);
    return customers[index];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customers = await this.readJsonFile<Customer>(this.customersFile);
    const initialLength = customers.length;
    const filteredCustomers = customers.filter((customer) => customer.id !== id);
    await this.writeJsonFile(this.customersFile, filteredCustomers);
    return filteredCustomers.length < initialLength;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.readJsonFile<Customer>(this.customersFile);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const customers = await this.getAllCustomers();
    const searchTerm = query.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        (customer.phone && customer.phone.includes(searchTerm))
    );
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.readJsonFile<Product>(this.productsFile);
    return products.find((product) => product.id === id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const products = await this.readJsonFile<Product>(this.productsFile);
    return products.find((product) => product.sku === sku);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const products = await this.readJsonFile<Product>(this.productsFile);
    const product: Product = {
      ...insertProduct,
      description: insertProduct.description || null,
      taxRate: insertProduct.taxRate || "18",
      isActive: insertProduct.isActive ?? true,
      id: randomUUID(),
      createdAt: new Date(),
    };
    products.push(product);
    await this.writeJsonFile(this.productsFile, products);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product> {
    const products = await this.readJsonFile<Product>(this.productsFile);
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) throw new Error("Product not found");
    
    products[index] = { ...products[index], ...updateData };
    await this.writeJsonFile(this.productsFile, products);
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.readJsonFile<Product>(this.productsFile);
    const initialLength = products.length;
    const filteredProducts = products.filter((product) => product.id !== id);
    await this.writeJsonFile(this.productsFile, filteredProducts);
    return filteredProducts.length < initialLength;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.readJsonFile<Product>(this.productsFile);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    const searchTerm = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  }

  // Invoice methods
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const invoices = await this.readJsonFile<Invoice>(this.invoicesFile);
    return invoices.find((invoice) => invoice.id === id);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const invoices = await this.readJsonFile<Invoice>(this.invoicesFile);
    return invoices.find((invoice) => invoice.invoiceNumber === invoiceNumber);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoices = await this.readJsonFile<Invoice>(this.invoicesFile);
    const invoice: Invoice = {
      ...insertInvoice,
      status: insertInvoice.status || "pending",
      discountAmount: insertInvoice.discountAmount || "0",
      paymentStatus: insertInvoice.paymentStatus || "unpaid",
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    invoices.push(invoice);
    await this.writeJsonFile(this.invoicesFile, invoices);
    return invoice;
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice> {
    const invoices = await this.readJsonFile<Invoice>(this.invoicesFile);
    const index = invoices.findIndex((invoice) => invoice.id === id);
    if (index === -1) throw new Error("Invoice not found");
    
    invoices[index] = { ...invoices[index], ...updateData, updatedAt: new Date() };
    await this.writeJsonFile(this.invoicesFile, invoices);
    return invoices[index];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const invoices = await this.readJsonFile<Invoice>(this.invoicesFile);
    const initialLength = invoices.length;
    const filteredInvoices = invoices.filter((invoice) => invoice.id !== id);
    await this.writeJsonFile(this.invoicesFile, filteredInvoices);
    return filteredInvoices.length < initialLength;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return this.readJsonFile<Invoice>(this.invoicesFile);
  }

  async searchInvoices(query: string): Promise<Invoice[]> {
    const invoices = await this.getAllInvoices();
    const customers = await this.getAllCustomers();
    const products = await this.getAllProducts();
    
    const searchTerm = query.toLowerCase();
    
    return invoices.filter((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customerId);
      const customerMatch = customer ? customer.name.toLowerCase().includes(searchTerm) : false;
      
      const productMatch = (invoice.items as InvoiceItem[]).some((item) =>
        item.productName.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm)
      );
      
      return (
        invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
        customerMatch ||
        productMatch ||
        new Date(invoice.createdAt!).toLocaleDateString().includes(searchTerm)
      );
    });
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const invoices = await this.getAllInvoices();
    return invoices.filter((invoice) => invoice.customerId === customerId);
  }

  async generateInvoiceNumber(): Promise<string> {
    const invoices = await this.getAllInvoices();
    const year = new Date().getFullYear();
    const currentYearInvoices = invoices.filter((invoice) =>
      invoice.invoiceNumber.includes(`INV-${year}`)
    );
    const nextNumber = currentYearInvoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, "0")}`;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const invoices = await this.getAllInvoices();
    const products = await this.getAllProducts();
    
    const totalSales = invoices
      .filter((invoice) => invoice.paymentStatus === "paid")
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);
    
    const pendingPayments = invoices
      .filter((invoice) => invoice.paymentStatus === "unpaid" || invoice.paymentStatus === "partial")
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);
    
    const recentInvoices = invoices
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);
    
    // Calculate top products based on sales
    const productSales = new Map<string, { sales: number; revenue: number; name: string; sku: string }>();
    
    invoices.forEach((invoice) => {
      (invoice.items as InvoiceItem[]).forEach((item) => {
        const existing = productSales.get(item.productId) || { sales: 0, revenue: 0, name: item.productName, sku: item.sku };
        existing.sales += item.quantity;
        existing.revenue += item.total;
        productSales.set(item.productId, existing);
      });
    });
    
    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    return {
      totalSales,
      totalInvoices: invoices.length,
      pendingPayments,
      activeProducts: products.filter((p) => p.isActive).length,
      recentInvoices,
      topProducts,
    };
  }
}

export const storage = new JSONStorage();
