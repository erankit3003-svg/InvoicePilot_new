import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Invoice, Customer, InvoiceItem } from "@shared/schema";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class PDFService {
  static async generateInvoicePDF(invoice: Invoice, customer: Customer): Promise<Buffer> {
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
    doc.text("123 Business Street", 20, 40);
    doc.text("City, State 12345", 20, 47);
    doc.text("contact@invoicepro.com", 20, 54);
    doc.text("+1 (555) 123-4567", 20, 61);
    
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
    
    // Invoice items table
    const items = invoice.items as InvoiceItem[];
    const tableData = items.map((item) => [
      item.productName,
      item.sku,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `${item.discount}%`,
      `$${item.total.toFixed(2)}`,
    ]);
    
    doc.autoTable({
      startY: 140,
      head: [["Product", "SKU", "Qty", "Price", "Discount", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 },
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 80;
    
    doc.setFontSize(10);
    doc.text(`Subtotal: $${parseFloat(invoice.subtotal).toFixed(2)}`, totalsX, finalY);
    doc.text(`Tax: $${parseFloat(invoice.taxAmount).toFixed(2)}`, totalsX, finalY + 7);
    doc.text(`Discount: $${parseFloat(invoice.discountAmount).toFixed(2)}`, totalsX, finalY + 14);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total: $${parseFloat(invoice.total).toFixed(2)}`, totalsX, finalY + 25);
    
    // Payment terms
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Terms:", 20, finalY + 50);
    doc.text("Payment is due within 30 days of invoice date.", 20, finalY + 57);
    doc.text("Thank you for your business!", 20, finalY + 70);
    
    return Buffer.from(doc.output("arraybuffer"));
  }
}
