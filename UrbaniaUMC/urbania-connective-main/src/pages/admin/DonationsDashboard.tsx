import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  BarChart, 
  Download, 
  Filter, 
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { donationAPI } from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Donation type definition
type Donation = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  amount: number;
  currency: string;
  program: string;
  donationType: "one-time" | "recurring";
  anonymous: boolean;
  paymentDetails: {
    status: string;
    method: string;
    transactionDate: string;
  };
  createdAt: string;
};

// Stats type definition
type DonationStats = {
  overall: {
    totalAmount: number;
    totalDonations: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
  };
  byProgram: Array<{
    _id: string;
    totalAmount: number;
    count: number;
    averageAmount: number;
  }>;
  monthly: Array<{
    year: number;
    month: number;
    totalAmount: number;
    count: number;
  }>;
};

const DonationsDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    program: "",
    status: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: ""
  });

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user && !user.role.includes("admin")) {
      toast.error("You do not have permission to access this page");
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Load donations data
  useEffect(() => {
    if (!isAuthenticated || !user?.role.includes("admin")) return;
    
    const loadDonations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Prepare filter parameters
        const params: any = {
          page,
          limit
        };
        
        if (filters.program) params.program = filters.program;
        if (filters.status) params.status = filters.status;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.minAmount) params.minAmount = parseFloat(filters.minAmount);
        if (filters.maxAmount) params.maxAmount = parseFloat(filters.maxAmount);
        
        // Fetch donations
        const response = await donationAPI.getAllDonations(params);
        setDonations(response.data.donations);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
        
        // Fetch stats
        const statsResponse = await donationAPI.getDonationStats();
        setStats(statsResponse.data);
      } catch (err: any) {
        console.error("Error loading donations:", err);
        setError(err.response?.data?.message || "Failed to load donations");
        toast.error("Error loading donations");
      } finally {
        setLoading(false);
      }
    };
    
    loadDonations();
  }, [isAuthenticated, user, page, limit, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      program: "",
      status: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: ""
    });
    setPage(1);
  };

  const formatCurrency = (amount: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
      refunded: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportToCsv = () => {
    // Implementation for exporting data to CSV
    toast.info("Export feature will be implemented in a future update");
  };

  if (!isAuthenticated || !user?.role.includes("admin")) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 mt-16">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Donation Management</h1>
          <Button onClick={exportToCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">All Donations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Donations</CardTitle>
                    <CardDescription>All time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {stats?.overall.totalDonations || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {formatCurrency(stats?.overall.totalAmount || 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Donation</CardTitle>
                    <CardDescription>Per transaction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatCurrency(stats?.overall.averageAmount || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Range: {formatCurrency(stats?.overall.minAmount || 0)} - {formatCurrency(stats?.overall.maxAmount || 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top Program</CardTitle>
                    <CardDescription>Most donations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold capitalize">
                      {stats?.byProgram[0]?._id || "None"}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats?.byProgram[0]?.count || 0} donations ({formatCurrency(stats?.byProgram[0]?.totalAmount || 0)})
                    </p>
                  </CardContent>
                </Card>
                
                {/* Recent Donations */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>
                      The latest {Math.min(donations.length, 5)} donations received
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left font-medium p-2 pl-0">Donor</th>
                            <th className="text-left font-medium p-2">Amount</th>
                            <th className="text-left font-medium p-2">Program</th>
                            <th className="text-left font-medium p-2">Type</th>
                            <th className="text-left font-medium p-2">Date</th>
                            <th className="text-right font-medium p-2 pr-0">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.slice(0, 5).map((donation) => (
                            <tr key={donation._id} className="border-b">
                              <td className="p-2 pl-0">
                                {donation.anonymous ? (
                                  <span className="text-muted-foreground">Anonymous</span>
                                ) : (
                                  <div>
                                    <div>{donation.firstName} {donation.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{donation.email}</div>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 font-medium">
                                {formatCurrency(donation.amount, donation.currency)}
                              </td>
                              <td className="p-2 capitalize">{donation.program}</td>
                              <td className="p-2">
                                {donation.donationType === "recurring" ? "Monthly" : "One-time"}
                              </td>
                              <td className="p-2">{formatDate(donation.createdAt)}</td>
                              <td className="p-2 pr-0 text-right">
                                {getStatusBadge(donation.paymentDetails.status)}
                              </td>
                            </tr>
                          ))}
                          
                          {donations.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-4 text-muted-foreground">
                                No donations found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("donations")}>
                        View All Donations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* All Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>All Donations</CardTitle>
                <CardDescription>
                  Manage and filter all donation records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <h3 className="font-medium">Filters</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="program-filter">Program</Label>
                      <Select 
                        value={filters.program} 
                        onValueChange={(value) => handleFilterChange("program", value)}
                      >
                        <SelectTrigger id="program-filter">
                          <SelectValue placeholder="All Programs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Programs</SelectItem>
                          <SelectItem value="general">General Fund</SelectItem>
                          <SelectItem value="education">Education Programs</SelectItem>
                          <SelectItem value="community">Community Services</SelectItem>
                          <SelectItem value="zakat">Zakat Fund</SelectItem>
                          <SelectItem value="sadka">Sadka/Charity Fund</SelectItem>
                          <SelectItem value="greenhouse_building">Greenhouse Building Fund</SelectItem>
                          <SelectItem value="greenhouse_maintenance">Greenhouse Maintenance Fund</SelectItem>
                          <SelectItem value="platform_building">Community Platform Building Fund</SelectItem>
                          <SelectItem value="interest_free_loans">Fund for Interest-Free Loans to Needy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="status-filter">Status</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value) => handleFilterChange("status", value)}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="date-from">From Date</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="date-to">To Date</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="min-amount">Min Amount</Label>
                      <Input
                        id="min-amount"
                        type="number"
                        placeholder="Min"
                        value={filters.minAmount}
                        onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="max-amount">Max Amount</Label>
                      <Input
                        id="max-amount"
                        type="number"
                        placeholder="Max"
                        value={filters.maxAmount}
                        onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                      />
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="search"
                          className="pl-8"
                          placeholder="Search by name or email"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {/* Donations Table */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left font-medium p-2 pl-0">Donor</th>
                            <th className="text-left font-medium p-2">Amount</th>
                            <th className="text-left font-medium p-2">Program</th>
                            <th className="text-left font-medium p-2">Type</th>
                            <th className="text-left font-medium p-2">Date</th>
                            <th className="text-left font-medium p-2">Status</th>
                            <th className="text-right font-medium p-2 pr-0">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.map((donation) => (
                            <tr key={donation._id} className="border-b">
                              <td className="p-2 pl-0">
                                {donation.anonymous ? (
                                  <span className="text-muted-foreground">Anonymous</span>
                                ) : (
                                  <div>
                                    <div>{donation.firstName} {donation.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{donation.email}</div>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 font-medium">
                                {formatCurrency(donation.amount, donation.currency)}
                              </td>
                              <td className="p-2 capitalize">{donation.program}</td>
                              <td className="p-2">
                                {donation.donationType === "recurring" ? "Monthly" : "One-time"}
                              </td>
                              <td className="p-2">{formatDate(donation.createdAt)}</td>
                              <td className="p-2">
                                {getStatusBadge(donation.paymentDetails.status)}
                              </td>
                              <td className="p-2 pr-0 text-right">
                                <Button variant="ghost" size="sm" onClick={() => toast.info("View details feature coming soon")}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                          
                          {donations.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center py-4 text-muted-foreground">
                                No donations found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-muted-foreground">
                        Showing {donations.length > 0 ? (page - 1) * limit + 1 : 0}-
                        {Math.min(page * limit, total)} of {total} donations
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-sm">
                          Page {page} of {totalPages}
                        </span>
                        
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Donation Analytics</CardTitle>
                <CardDescription>
                  Visualize donation trends and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-64 border rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Analytics Coming Soon</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Advanced analytics features will be available in a future update. 
                      Check back soon for detailed charts and insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DonationsDashboard; 