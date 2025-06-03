import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Overview() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Mock sales data
        const mockSalesData = {
          totalRevenue: 24780.5,
          revenueTrend: 20.1,
          totalOrders: 573,
          ordersTrend: 12.4,
          activeUsers: 2345,
          usersTrend: 18.7,
          inventoryItems: 1287,
          inventoryTrend: 5.2,
          monthlySales: [
            { month: "Jan", sales: 12500 },
            { month: "Feb", sales: 14000 },
            { month: "Mar", sales: 15800 },
            { month: "Apr", sales: 16200 },
            { month: "May", sales: 18500 },
            { month: "Jun", sales: 22400 },
          ],
        };
        setSalesData(mockSalesData);

        // Mock orders data
        const mockOrders = [
          { id: "ORD-7245", customer: "Sarah Johnson", status: "Delivered", amount: 125.99 },
          { id: "ORD-7244", customer: "Michael Chen", status: "Processing", amount: 89.50 },
          { id: "ORD-7243", customer: "Emma Wilson", status: "Shipped", amount: 245.75 },
          { id: "ORD-7242", customer: "James Rodriguez", status: "Pending", amount: 78.25 },
        ];
        setOrders(mockOrders);

        // Mock low stock items
        const mockLowStockItems = [
          { id: 1, name: "Vitamin C Serum", stock: 5, max: 50 },
          { id: 2, name: "Hyaluronic Acid Moisturizer", stock: 8, max: 50 },
          { id: 3, name: "Acetaminophen 500mg", stock: 12, max: 50 },
          { id: 4, name: "Retinol Night Cream", stock: 3, max: 50 },
        ];
        setLowStockItems(mockLowStockItems);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`$${salesData.totalRevenue.toLocaleString()}`}
          description="from last month"
          icon={<DollarSign className="h-4 w-4" />}
          trend={salesData.revenueTrend}
        />
        <StatsCard
          title="Orders"
          value={`+${salesData.totalOrders}`}
          description="from last month"
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={salesData.ordersTrend}
        />
        <StatsCard
          title="Active Users"
          value={salesData.activeUsers.toLocaleString()}
          description="from last month"
          icon={<Users className="h-4 w-4" />}
          trend={salesData.usersTrend}
        />
        <StatsCard
          title="Inventory Items"
          value={salesData.inventoryItems.toLocaleString()}
          description="from last month"
          icon={<Package className="h-4 w-4" />}
          trend={salesData.inventoryTrend}
        />
      </div>

      {/* Chart and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData.monthlySales}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Shipped"
                            ? "secondary"
                            : order.status === "Processing"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.stock} units remaining
                    </div>
                  </div>
                  <Progress className="w-24" value={(item.stock / item.max) * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
