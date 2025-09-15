import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, updateUserSchema, User, InsertUser, UpdateUser } from "@shared/schema";
import { z } from "zod";

type UserFormData = InsertUser | UpdateUser;

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UserFormData>({
    resolver: zodResolver(user ? updateUserSchema : insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      role: "staff",
    },
  });

  // Pre-populate form for editing
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        password: "", // Don't pre-fill password for security
        email: user.email,
        role: user.role,
      });
    }
  }, [user, form]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      // Filter out empty password to preserve existing password
      const updateData = { ...data };
      if (updateData.password === "") {
        delete updateData.password;
      }
      
      const response = await fetch(`/api/users/${user!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (user) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          {...form.register("username")}
          data-testid="username-input"
        />
        {form.formState.errors.username && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          data-testid="email-input"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password", {
            required: user ? false : "Password is required for new users"
          })}
          data-testid="password-input"
          placeholder={user ? "Leave empty to keep current password" : "Enter password"}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="role">Role *</Label>
        <Select
          value={form.watch("role")}
          onValueChange={(value) => form.setValue("role", value)}
        >
          <SelectTrigger data-testid="role-select">
            <SelectValue placeholder="Select role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.role && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.role.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="user-cancel-button">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createUserMutation.isPending || updateUserMutation.isPending}
          data-testid="user-submit-button"
        >
          {user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}