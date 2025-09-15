import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Customer, Product, Invoice } from "@shared/schema";

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
});

const invoiceFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().default("pending"),
  paymentStatus: z.string().default("unpaid"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: "",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      status: "pending",
      paymentStatus: "unpaid",
      items: [{ productId: "", quantity: 1, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Pre-populate form for editing
  useEffect(() => {
    if (invoice) {
      const items = invoice.items as any[];
      form.reset({
        customerId: invoice.customerId,
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        status: invoice.status || "pending",
        paymentStatus: invoice.paymentStatus || "unpaid",
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: item.discount,
        })),
      });
      
      // Set selected products for calculations
      const invoiceProducts = items.map(item => {
        const product = products?.find(p => p.id === item.productId);
        return product;
      }).filter(Boolean) as Product[];
      setSelectedProducts(invoiceProducts);
    }
  }, [invoice, form, products]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create invoice");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const response = await fetch(`/api/invoices/${invoice!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update invoice");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    if (invoice) {
      updateInvoiceMutation.mutate(data);
    } else {
      createInvoiceMutation.mutate(data);
    }
  };

  const addItem = () => {
    append({ productId: "", quantity: 1, discount: 0 });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  const watchedItems = form.watch("items");

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    watchedItems.forEach((item) => {
      const product = products?.find((p) => p.id === item.productId);
      if (product) {
        const itemSubtotal = item.quantity * parseFloat(product.price);
        const itemDiscount = (itemSubtotal * item.discount) / 100;
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        const itemTax = (itemAfterDiscount * parseFloat(product.taxRate)) / 100;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;
      }
    });

    const total = subtotal - totalDiscount + totalTax;

    return { subtotal, totalTax, totalDiscount, total };
  };

  const { subtotal, totalTax, totalDiscount, total } = calculateTotals();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer and Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="customerId">Customer *</Label>
          <Select
            value={form.watch("customerId")}
            onValueChange={(value) => form.setValue("customerId", value)}
          >
            <SelectTrigger data-testid="customer-select">
              <SelectValue placeholder="Choose a customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.customerId && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.customerId.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            {...form.register("dueDate")}
            data-testid="due-date-input"
          />
          {form.formState.errors.dueDate && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Status Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="status">Invoice Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value)}
          >
            <SelectTrigger data-testid="status-select">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select
            value={form.watch("paymentStatus")}
            onValueChange={(value) => form.setValue("paymentStatus", value)}
          >
            <SelectTrigger data-testid="payment-status-select">
              <SelectValue placeholder="Select payment status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partially Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button type="button" onClick={addItem} data-testid="add-item-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => {
              const product = products?.find((p) => p.id === watchedItems[index]?.productId);
              const itemSubtotal = product ? watchedItems[index].quantity * parseFloat(product.price) : 0;
              const itemDiscount = (itemSubtotal * watchedItems[index].discount) / 100;
              const itemTotal = itemSubtotal - itemDiscount;

              return (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <Label>Product *</Label>
                    <Select
                      value={watchedItems[index]?.productId || ""}
                      onValueChange={(value) => form.setValue(`items.${index}.productId`, value)}
                    >
                      <SelectTrigger data-testid={`product-select-${index}`}>
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      data-testid={`quantity-input-${index}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                      data-testid={`discount-input-${index}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm">
                      ${itemTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                        data-testid={`remove-item-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground" data-testid="subtotal-amount">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-foreground" data-testid="discount-amount">
                ${totalDiscount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span className="text-foreground" data-testid="tax-amount">
                ${totalTax.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-lg font-medium">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground" data-testid="total-amount">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="cancel-button">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
          data-testid="submit-button"
        >
          {invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
