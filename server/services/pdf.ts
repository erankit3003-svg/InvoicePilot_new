import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice, Customer, InvoiceItem } from "@shared/schema";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class PDFService {
  static async generateInvoicePDF(invoice: Invoice, customer: Customer): Promise<Buffer> {
    console.log('PDF Generation - Invoice items:', JSON.stringify(invoice.items, null, 2));
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 20, 30, { align: "right" });
    
    // Company info
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("InvoicePro", 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Design 4 you", 20, 40);
    doc.text("Shop no 44 to 46", 20, 47);
    doc.text("Kheri Markanda, Kurukshetra", 20, 54);
    doc.text("+91-92542-22221", 20, 61);
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 20, 45, { align: "right" });
    doc.text(`Date: ${new Date(invoice.createdAt!).toLocaleDateString()}`, pageWidth - 20, 52, { align: "right" });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 20, 59, { align: "right" });
    
    // Bill To
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 85);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(customer.name, 20, 95);
    if (customer.address) {
      doc.text(customer.address, 20, 102);
    }
    doc.text(customer.email, 20, 109);
    if (customer.phone) {
      doc.text(customer.phone, 20, 116);
    }
    if (customer.gstId) {
      doc.text(`GST ID: ${customer.gstId}`, 20, 123);
    }
    
    // Invoice items - simple text-based table
    const items = invoice.items as InvoiceItem[];
    let currentY = 140;
    
    // Table headers
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Product", 20, currentY);
    doc.text("SKU", 100, currentY);
    doc.text("Qty", 130, currentY);
    doc.text("Price", 150, currentY);
    doc.text("Discount", 180, currentY);
    doc.text("Total", 210, currentY);
    
    // Draw header line
    doc.line(20, currentY + 2, 240, currentY + 2);
    currentY += 10;
    
    // Table rows
    doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      doc.text(item.productName || 'N/A', 20, currentY);
      doc.text(item.sku || 'N/A', 100, currentY);
      doc.text((item.quantity || 0).toString(), 130, currentY);
      doc.text(`Rs.${Number(item.price || 0).toFixed(2)}`, 150, currentY);
      doc.text(`${item.discount || 0}%`, 180, currentY);
      doc.text(`Rs.${Number(item.total || 0).toFixed(2)}`, 210, currentY);
      currentY += 10;
    });
    
    // Draw bottom line
    doc.line(20, currentY, 240, currentY);
    
    // Totals
    const finalY = currentY + 20;
    const totalsX = pageWidth - 80;
    
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs.${parseFloat(invoice.subtotal).toFixed(2)}`, totalsX, finalY);
    doc.text(`Tax: Rs.${parseFloat(invoice.taxAmount).toFixed(2)}`, totalsX, finalY + 7);
    doc.text(`Discount: Rs.${parseFloat(invoice.discountAmount).toFixed(2)}`, totalsX, finalY + 14);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total: Rs.${parseFloat(invoice.total).toFixed(2)}`, totalsX, finalY + 25);
    
    // Payment terms
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Terms: Payment is due within 07 days of invoice date.", 20, finalY + 50);
    doc.text("Thank you for your business!", 20, finalY + 60); //InvoicePro – A Product by codEdges Technologies
    doc.text("© 2025 InvoicePro – A Product by codEdges Technologies | www.codedges.com", 20, finalY + 80);
    return Buffer.from(doc.output("arraybuffer"));
  }
}