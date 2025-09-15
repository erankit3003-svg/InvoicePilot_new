import jsPDF from "jspdf";
import "jspdf-autotable";
import { Invoice, Customer, InvoiceItem } from "@shared/schema";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class PDFGenerator {
  static generateInvoicePDF(invoice: Invoice, customer: Customer): void {
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
    doc.text("Kheri Markanda", 20, 54);
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
    let yPos = 95;
    doc.text(customer.name, 20, yPos);
    yPos += 7;
    
    if (customer.address) {
      doc.text(customer.address, 20, yPos);
      yPos += 7;
    }
    
    doc.text(customer.email, 20, yPos);
    yPos += 7;
    
    if (customer.phone) {
      doc.text(customer.phone, 20, yPos);
      yPos += 7;
    }
    
    if (customer.gstId) {
      doc.text(`GST ID: ${customer.gstId}`, 20, yPos);
      yPos += 7;
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
      startY: Math.max(yPos + 10, 140),
      head: [["Product", "SKU", "Qty", "Price", "Discount", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [20, 83, 181] }, // Primary color
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 80;
    
    doc.setFontSize(10);
    doc.text(`Subtotal: $${parseFloat(invoice.subtotal).toFixed(2)}`, totalsX, finalY);
    doc.text(`Discount: $${parseFloat(invoice.discountAmount).toFixed(2)}`, totalsX, finalY + 7);
    doc.text(`Tax: $${parseFloat(invoice.taxAmount).toFixed(2)}`, totalsX, finalY + 14);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total: $${parseFloat(invoice.total).toFixed(2)}`, totalsX, finalY + 25);
    
    // Payment terms
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Terms:", 20, finalY + 50);
    doc.text("Payment is due within 30 days of invoice date.", 20, finalY + 57);
    doc.text("Thank you for your business!", 20, finalY + 70);
    
    // Download the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  }
  
  static async downloadInvoicePDF(invoiceId: string): Promise<void> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error("Failed to download PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw error;
    }
  }
  
  static printInvoice(invoice: Invoice, customer: Customer): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const items = invoice.items as InvoiceItem[];
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info h1 { color: #1454b5; margin: 0; }
            .company-info p { margin: 5px 0; color: #666; }
            .invoice-details h2 { color: #333; margin: 0; }
            .invoice-details p { margin: 5px 0; }
            .bill-to { margin-bottom: 40px; }
            .bill-to h3 { color: #333; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; }
            .totals table { margin: 0; }
            .total-row { font-weight: bold; font-size: 1.1em; }
            .payment-terms { margin-top: 40px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="company-info">
              <h1>Design 4 you</h1>
              <p>Shop no 44 to 46</p>
              <p>Kheri Markanda, Kurukshetra</p>
              <p>Haryana</p>
              <p>+91-92542-22221</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.createdAt!).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${customer.name}</strong></p>
            ${customer.address ? `<p>${customer.address}</p>` : ''}
            <p>${customer.email}</p>
            ${customer.phone ? `<p>${customer.phone}</p>` : ''}
            ${customer.gstId ? `<p>GST ID: ${customer.gstId}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Discount</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.sku}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">$${item.price.toFixed(2)}</td>
                  <td class="text-right">${item.discount}%</td>
                  <td class="text-right">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">$${parseFloat(invoice.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td class="text-right">$${parseFloat(invoice.discountAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax:</td>
                <td class="text-right">$${parseFloat(invoice.taxAmount).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">$${parseFloat(invoice.total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div class="payment-terms">
            <h4>Payment Terms:</h4>
            <p>Payment is due within 30 days of invoice date. Late payments may incur additional charges.</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
