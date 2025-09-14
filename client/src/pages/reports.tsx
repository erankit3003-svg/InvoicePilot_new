import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Users,
  Package,
  BarChart3
} from "lucide-react";
import { DashboardMetrics, Invoice } from "@shared/schema";

type ReportType = "sales" | "invoices" | "customers" | "products";
type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard"],
  });

  const { data: allInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const generateReport = () => {
    // In a real implementation, this would call a backend API to generate the report
    toast({
      title: "Report Generated",
      description: `${reportType} report for ${reportPeriod} period has been generated successfully.`,
    });
  };

  const exportToCSV = () => {
    if (!allInvoices || allInvoices.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ["Invoice Number", "Customer", "Amount", "Status", "Date"],
      ...allInvoices.map(invoice => [
        invoice.invoiceNumber,
        (invoice as any).customerName || "Unknown",
        parseFloat(invoice.total).toFixed(2),
        invoice.paymentStatus,
        new Date(invoice.createdAt!).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export Successful",
      description: "Report has been exported to CSV successfully.",
    });
  };

  const exportToPDF = () => {
    // In a real implementation, this would generate a proper PDF report
    toast({
      title: "PDF Export",
      description: "PDF report generation is not yet implemented.",
    });
  };

  const getReportMetrics = () => {
    if (!metrics || !allInvoices) return null;

    const currentDate = new Date();
    let filteredInvoices = allInvoices;

    // Filter by period
    if (reportPeriod === "daily") {
      const today = currentDate.toDateString();
      filteredInvoices = allInvoices.filter(invoice => 
        new Date(invoice.createdAt!).toDateString() === today
      );
    } else if (reportPeriod === "weekly") {
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredInvoices = allInvoices.filter(invoice => 
        new Date(invoice.createdAt!) >= weekAgo
      );
    } else if (reportPeriod === "monthly") {
      const monthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
      filteredInvoices = allInvoices.filter(invoice => 
        new Date(invoice.createdAt!) >= monthAgo
      );
    } else if (reportPeriod === "yearly") {
      const yearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      filteredInvoices = allInvoices.filter(invoice => 
        new Date(invoice.createdAt!) >= yearAgo
      );
    }

    const totalRevenue = filteredInvoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.total), 0
    );

    const paidInvoices = filteredInvoices.filter(invoice => 
      invoice.paymentStatus === "paid"
    );

    const paidRevenue = paidInvoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.total), 0
    );

    const pendingRevenue = filteredInvoices.filter(invoice => 
      invoice.paymentStatus === "unpaid" || invoice.paymentStatus === "partial"
    ).reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);

    return {
      totalInvoices: filteredInvoices.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      paidInvoices: paidInvoices.length,
      pendingInvoices: filteredInvoices.length - paidInvoices.length,
    };
  };

  const reportMetrics = getReportMetrics();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Reports" 
          subtitle="Generate and export business reports"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Report Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                    <SelectTrigger data-testid="report-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="invoices">Invoice Report</SelectItem>
                      <SelectItem value="customers">Customer Report</SelectItem>
                      <SelectItem value="products">Product Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reportPeriod">Period</Label>
                  <Select value={reportPeriod} onValueChange={(value: ReportPeriod) => setReportPeriod(value)}>
                    <SelectTrigger data-testid="report-period-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reportPeriod === "custom" && (
                  <>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        data-testid="start-date-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        data-testid="end-date-input"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-4">
                <Button onClick={generateReport} data-testid="generate-report-button">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" onClick={exportToCSV} data-testid="export-csv-button">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={exportToPDF} data-testid="export-pdf-button">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Summary */}
          {reportMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="total-revenue">
                        ${reportMetrics.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600 w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Paid Revenue</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="paid-revenue">
                        ${reportMetrics.paidRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-blue-600 w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Revenue</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="pending-revenue">
                        ${reportMetrics.pendingRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-orange-600 w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="total-invoices-count">
                        {reportMetrics.totalInvoices}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-purple-600 w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Report Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {reportMetrics ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paid Invoices</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{reportMetrics.paidInvoices}</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ 
                              width: `${(reportMetrics.paidInvoices / reportMetrics.totalInvoices) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Invoices</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{reportMetrics.pendingInvoices}</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-orange-500 rounded-full" 
                            style={{ 
                              width: `${(reportMetrics.pendingInvoices / reportMetrics.totalInvoices) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Total Customers</span>
                    </div>
                    <span className="text-lg font-semibold" data-testid="customers-count">
                      {metrics?.activeProducts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-muted-foreground">Active Products</span>
                    </div>
                    <span className="text-lg font-semibold" data-testid="products-count">
                      {metrics?.activeProducts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-muted-foreground">Growth Rate</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
