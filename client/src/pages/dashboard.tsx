import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  Clock, 
  Package, 
  TrendingUp, 
  Plus,
  Box,
  UserPlus,
  BarChart3,
  QrCode
} from "lucide-react";
import { DashboardMetrics } from "@shared/schema";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
  });

  const handleCreateInvoice = () => {
    setLocation("/invoices");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement global search functionality here
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title="Dashboard" 
            subtitle="Loading..."
            onSearch={handleSearch}
            onCreateNew={handleCreateInvoice}
            createButtonText="New Invoice"
            searchPlaceholder="Search invoices..."
          />
          <main className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
          title="Dashboard" 
          subtitle="Welcome back! Here's your business overview."
          onSearch={handleSearch}
          onCreateNew={handleCreateInvoice}
          createButtonText="New Invoice"
          searchPlaceholder="Search invoices..."
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="total-sales">
                      ₹{metrics?.totalSales.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 mr-1 inline" />
                      12.5% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="total-invoices">
                      {metrics?.totalInvoices || 0}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      <TrendingUp className="w-3 h-3 mr-1 inline" />
                      8 new this week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payments</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="pending-payments">
                      ₹{metrics?.pendingPayments.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      <Clock className="w-3 h-3 mr-1 inline" />
                      23 invoices overdue
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-orange-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Products</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="active-products">
                      {metrics?.activeProducts || 0}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      <Plus className="w-3 h-3 mr-1 inline" />
                      3 added this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="text-purple-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Invoices */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Invoices</CardTitle>
                    <Button
                      variant="ghost"
                      onClick={() => setLocation("/invoices")}
                      data-testid="view-all-invoices"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {metrics?.recentInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                              No recent invoices found
                            </td>
                          </tr>
                        ) : (
                          metrics?.recentInvoices.map((invoice) => (
                            <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-foreground">
                                  {invoice.invoiceNumber}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-foreground">
                                  {(invoice as any).customerName || "Unknown Customer"}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-foreground">
                                  ${parseFloat(invoice.total).toFixed(2)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge className={getStatusColor(invoice.paymentStatus)}>
                                  {invoice.paymentStatus}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {new Date(invoice.createdAt!).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products & Quick Actions */}
            <div className="space-y-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics?.topProducts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No product sales data available
                      </p>
                    ) : (
                      metrics?.topProducts.map((product) => (
                        <div 
                          key={product.productId} 
                          className="flex items-center justify-between"
                          data-testid={`top-product-${product.productId}`}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">
                              {product.sales} sold
                            </div>
                            <div className="text-xs text-green-600">
                              ${Number(product.revenue || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setLocation("/invoices")}
                      data-testid="quick-create-invoice"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Create New Invoice
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setLocation("/products")}
                      data-testid="quick-add-product"
                    >
                      <Box className="w-4 h-4 mr-3" />
                      Add New Product
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setLocation("/customers")}
                      data-testid="quick-add-customer"
                    >
                      <UserPlus className="w-4 h-4 mr-3" />
                      Add New Customer
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setLocation("/reports")}
                      data-testid="quick-generate-report"
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Generate Report
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      data-testid="quick-scan-barcode"
                    >
                      <QrCode className="w-4 h-4 mr-3" />
                      Scan Product Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
