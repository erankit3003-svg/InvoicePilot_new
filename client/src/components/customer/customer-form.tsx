import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertCustomerSchema, Customer } from "@shared/schema";
import { z } from "zod";

type CustomerFormData = z.infer<typeof insertCustomerSchema>;

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      gstId: "",
    },
  });

  // Pre-populate form for editing
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
        gstId: customer.gstId || "",
      });
    }
  }, [customer, form]);

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await fetch(`/api/customers/${customer!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update customer");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (customer) {
      updateCustomerMutation.mutate(data);
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Customer Name *</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Enter customer name"
          data-testid="customer-name-input"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="Enter email address"
          data-testid="customer-email-input"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          {...form.register("phone")}
          placeholder="Enter phone number"
          data-testid="customer-phone-input"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...form.register("address")}
          placeholder="Enter customer address"
          rows={3}
          data-testid="customer-address-input"
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="gstId">GST/Tax ID</Label>
        <Input
          id="gstId"
          {...form.register("gstId")}
          placeholder="Enter GST or Tax ID"
          data-testid="customer-gst-input"
        />
        {form.formState.errors.gstId && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.gstId.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="customer-cancel-button">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
          data-testid="customer-submit-button"
        >
          {customer ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
