import { Invoice, Customer, InvoiceItem } from "@shared/schema";

interface InvoicePDFProps {
  invoice: Invoice;
  customer: Customer;
}

export function InvoicePDF({ invoice, customer }: InvoicePDFProps) {
  const items = invoice.items as InvoiceItem[];

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 print:p-0" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">InvoicePro</span>
          </div>
          <div className="text-gray-600 text-sm">
            {/* <h1>Design 4 you</h1> */}
              <p>Shop no 44 to 46</p>
              <p>Kheri Markanda, Kurukshetra</p>
              <p>Haryana</p>
              <p>+91-92542-22221</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
          <div className="text-gray-600 text-sm">
            <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> {new Date(invoice.createdAt!).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
        <div className="text-gray-600">
          <p><strong>{customer.name}</strong></p>
          {customer.address && <p>{customer.address}</p>}
          <p>{customer.email}</p>
          {customer.phone && <p>{customer.phone}</p>}
          {customer.gstId && <p>GST ID: {customer.gstId}</p>}
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                Product
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                SKU
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                Qty
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                Price
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                Discount
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                  {item.productName}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                  {item.sku}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                  ${item.price.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                  {item.discount}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                  ${item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="bg-gray-50 border border-gray-300 p-4">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="text-gray-900">${parseFloat(invoice.discountAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">${parseFloat(invoice.taxAmount).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">${parseFloat(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="text-gray-600 text-sm">
        <h4 className="font-semibold text-gray-900 mb-2">Payment Terms:</h4>
        <p>Payment is due within 07 days of invoice date. Late payments may incur additional charges.</p>
        <p className="mt-2">Thank you for your business!</p>
      </div>
    </div>
  );
}
