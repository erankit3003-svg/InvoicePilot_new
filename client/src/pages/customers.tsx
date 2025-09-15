import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CustomerForm } from "@/components/customer/customer-form";
import { Edit, Trash2, User, Mail, Phone, MapPin } from "lucide-react";
import { Customer } from "@shared/schema";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: searchQuery 
      ? [`/api/customers?search=${encodeURIComponent(searchQuery)}`]
      : ["/api/customers"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleCreateCustomer = () => {
    setShowCreateModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title="Customers" 
            subtitle="Loading..."
          />
          <main className="flex-1 overflow-auto p-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Customers" 
          subtitle="Manage your customer database"
          onSearch={setSearchQuery}
          onCreateNew={handleCreateCustomer}
          createButtonText="New Customer"
          searchPlaceholder="Search customers..."
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!customers || customers.length === 0 ? (
                  <div className="col-span-full">
                    <div className="text-center py-12">
                      <User className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold text-foreground">No customers</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Get started by creating your first customer.
                      </p>
                      <div className="mt-6">
                        <Button onClick={handleCreateCustomer} data-testid="create-first-customer">
                          <User className="w-4 h-4 mr-2" />
                          Add Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  customers.map((customer) => (
                    <Card key={customer.id} data-testid={`customer-card-${customer.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {customer.name}
                              </h3>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{customer.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                              data-testid={`edit-customer-${customer.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              data-testid={`delete-customer-${customer.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          {customer.phone && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{customer.address}</span>
                            </div>
                          )}
                          {customer.gstId && (
                            <div className="text-xs text-muted-foreground">
                              <strong>GST ID:</strong> {customer.gstId}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 text-xs text-muted-foreground">
                          Created: {new Date(customer.createdAt!).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Create Customer Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSuccess={() => {
              setShowCreateModal(false);
              queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
              queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedCustomer(null);
              queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
              queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
