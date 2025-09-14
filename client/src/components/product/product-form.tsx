import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { insertProductSchema, Product } from "@shared/schema";
import { z } from "zod";

type ProductFormData = z.infer<typeof insertProductSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: "0",
      taxRate: "18",
      description: "",
      isActive: true,
    },
  });

  // Pre-populate form for editing
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        price: product.price,
        taxRate: product.taxRate,
        description: product.description || "",
        isActive: product.isActive,
      });
    }
  }, [product, form]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch(`/api/products/${product!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (product) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter product name"
            data-testid="product-name-input"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            {...form.register("sku")}
            placeholder="Enter SKU"
            data-testid="product-sku-input"
          />
          {form.formState.errors.sku && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.sku.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...form.register("price")}
            placeholder="0.00"
            data-testid="product-price-input"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="taxRate">Tax Rate % *</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register("taxRate")}
            placeholder="18"
            data-testid="product-tax-rate-input"
          />
          {form.formState.errors.taxRate && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.taxRate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Enter product description (optional)"
          rows={3}
          data-testid="product-description-input"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
          data-testid="product-active-switch"
        />
        <Label htmlFor="isActive">Active Product</Label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="product-cancel-button">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createProductMutation.isPending || updateProductMutation.isPending}
          data-testid="product-submit-button"
        >
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
