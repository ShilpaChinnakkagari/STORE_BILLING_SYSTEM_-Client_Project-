import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, RefreshCw, TrendingUp, TrendingDown, DollarSign, ShoppingBag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Types
interface SaleSummary {
  invoice: string;
  customerName: string;
  total: number;
  profit: number;
  saleType: string;
}

interface DailyReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalDiscount: number;
  totalTax: number;
  sales: SaleSummary[];
}

interface SummaryReport {
  orders: number;
  revenue: number;
  profit: number;
  discount: number;
  tax: number;
  averageOrderValue: number;
  from: string;
  to: string;
}

interface ItemReport {
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  sold: number;
  profit: number;
  margin: number;
  stockValue: number;
  priority: number;
}

export function ReportsTab() {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [monthlyReports, setMonthlyReports] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [itemReports, setItemReports] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const API_BASE = 'http://localhost:8080/api';

  // Fetch Daily Report
  const fetchDailyReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/daily?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch daily report');
      const data = await response.json();
      setDailyReport(data);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast.error('Failed to load daily report');
    }
  };

  // Fetch Monthly Report
  const fetchMonthlyReport = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const response = await fetch(`${API_BASE}/reports/monthly?year=${year}&month=${month}`);
      if (!response.ok) throw new Error('Failed to fetch monthly report');
      const data = await response.json();
      setMonthlyReports(data);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      toast.error('Failed to load monthly report');
    }
  };

  // Fetch Summary
  const fetchSummary = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
      
      const response = await fetch(`${API_BASE}/reports/summary?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to load summary');
    }
  };

  // Fetch Item Reports
  const fetchItemReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/items/inventory`);
      if (!response.ok) throw new Error('Failed to fetch item reports');
      const data = await response.json();
      setItemReports(data);
    } catch (error) {
      console.error('Error fetching item reports:', error);
      toast.error('Failed to load inventory report');
    }
  };

  // Load all reports
  const loadAllReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDailyReport(),
        fetchMonthlyReport(),
        fetchSummary(),
        fetchItemReports()
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, [selectedDate, selectedMonth]);

  const handleRefresh = () => {
    loadAllReports();
    toast.success('Reports refreshed');
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color = "text-blue-600" }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-${color.replace('text-', '')}/10`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Priority colors
  const getPriorityColor = (priority: number) => {
    switch(priority) {
      case 1: return 'bg-red-100 text-red-700 border-red-300';
      case 2: return 'bg-orange-100 text-orange-700 border-orange-300';
      case 3: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch(priority) {
      case 1: return '🔴 Priority 1: Buy Now!';
      case 2: return '🟠 Priority 2: Buy Soon';
      case 3: return '🟡 Priority 3: Monitor';
      default: return '🟢 Priority 4: Good Stock';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Sales overview, inventory status, and performance metrics</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            title="Total Orders" 
            value={summary.orders} 
            icon={ShoppingBag}
            color="text-blue-600"
          />
          <StatCard 
            title="Total Revenue" 
            value={formatMoney(summary.revenue)} 
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard 
            title="Total Profit" 
            value={formatMoney(summary.profit)} 
            icon={TrendingUp}
            color="text-emerald-600"
          />
          <StatCard 
            title="Average Order" 
            value={formatMoney(summary.averageOrderValue)} 
            icon={TrendingDown}
            color="text-purple-600"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
        </TabsList>

        {/* Daily Report */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Sales Report</CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  />
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : dailyReport ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="text-2xl font-bold">{dailyReport.totalOrders}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">{formatMoney(dailyReport.totalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Profit</p>
                      <p className="text-2xl font-bold">{formatMoney(dailyReport.totalProfit)}</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyReport.sales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No sales on this date
                          </TableCell>
                        </TableRow>
                      ) : (
                        dailyReport.sales.map((sale) => (
                          <TableRow key={sale.invoice}>
                            <TableCell className="font-mono">{sale.invoice}</TableCell>
                            <TableCell>{sale.customerName}</TableCell>
                            <TableCell>{sale.saleType}</TableCell>
                            <TableCell className="text-right font-mono">{formatMoney(sale.total)}</TableCell>
                            <TableCell className="text-right font-mono text-green-600">{formatMoney(sale.profit)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Report */}
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Sales Report</CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  />
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : monthlyReports.length > 0 ? (
                <div className="space-y-6">
                  {monthlyReports.map((day) => (
                    <div key={day.date} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">{new Date(day.date).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</h4>
                        <div className="flex gap-4 text-sm">
                          <span className="font-medium">Orders: {day.totalOrders}</span>
                          <span className="font-medium text-green-600">Revenue: {formatMoney(day.totalRevenue)}</span>
                          <span className="font-medium text-emerald-600">Profit: {formatMoney(day.totalProfit)}</span>
                        </div>
                      </div>
                      
                      {day.sales.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Profit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.sales.map((sale) => (
                              <TableRow key={sale.invoice}>
                                <TableCell className="font-mono">{sale.invoice}</TableCell>
                                <TableCell>{sale.customerName}</TableCell>
                                <TableCell>{sale.saleType}</TableCell>
                                <TableCell className="text-right font-mono">{formatMoney(sale.total)}</TableCell>
                                <TableCell className="text-right font-mono text-green-600">{formatMoney(sale.profit)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No sales in this month</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Status - Purchase Priority</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Low stock items appear at the top</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Priority Legend - FIXED: Using {'>'} instead of > */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
                      🔴 Priority 1: Stock ≤ 5 (Buy Now!)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                      🟠 Priority 2: Stock ≤ 10 (Buy Soon)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                      🟡 Priority 3: Stock ≤ 20 (Monitor)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">
                      🟢 Priority 4: Stock {'>'} 20 (Good Stock)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Priority</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Sold</TableHead>
                          <TableHead className="text-right">Margin %</TableHead>
                          <TableHead className="text-right">Stock Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itemReports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No items found in inventory
                            </TableCell>
                          </TableRow>
                        ) : (
                          itemReports.map((item) => (
                            <TableRow 
                              key={item.code} 
                              className={item.priority <= 2 ? 'bg-red-50/50' : ''}
                            >
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                  {getPriorityLabel(item.priority)}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono">{item.code}</TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {item.stock <= 5 && (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )}
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className={`text-right font-mono font-bold ${item.stock <= 5 ? 'text-red-600' : item.stock <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
                                {item.stock.toFixed(2)} {item.unit}
                              </TableCell>
                              <TableCell className="text-right font-mono">{item.sold.toFixed(2)}</TableCell>
                              <TableCell className={`text-right font-mono ${item.margin > 20 ? 'text-green-600' : item.margin > 10 ? 'text-orange-500' : 'text-red-500'}`}>
                                {item.margin.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right font-mono">{formatMoney(item.stockValue)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary Stats */}
                  {itemReports.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total Items</p>
                        <p className="text-lg font-bold">{itemReports.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Low Stock (≤5)</p>
                        <p className="text-lg font-bold text-red-600">
                          {itemReports.filter(i => i.stock <= 5).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Medium Stock (6-10)</p>
                        <p className="text-lg font-bold text-orange-500">
                          {itemReports.filter(i => i.stock > 5 && i.stock <= 10).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total Stock Value</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatMoney(itemReports.reduce((sum, i) => sum + i.stockValue, 0))}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}