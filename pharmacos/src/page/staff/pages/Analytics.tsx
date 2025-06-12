import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

export function Analytics() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, these would be actual API calls
        // For demonstration, we're using mock data
        
        // Mock sales data
        const mockSalesData = {
          monthlySales: [
            { month: "Jan", sales: 12500 },
            { month: "Feb", sales: 14000 },
            { month: "Mar", sales: 15800 },
            { month: "Apr", sales: 16200 },
            { month: "May", sales: 18500 },
            { month: "Jun", sales: 22400 },
          ],
          salesByCategory: [
            { name: "Cosmetics", value: 45 },
            { name: "Pharmaceuticals", value: 30 },
            { name: "Supplements", value: 15 },
            { name: "Health Devices", value: 10 },
          ],
          recentTransactions: [
            { id: "TX-7245", date: "2023-06-15", amount: 125.99 },
            { id: "TX-7244", date: "2023-06-14", amount: 89.50 },
            { id: "TX-7243", date: "2023-06-14", amount: 245.75 },
            { id: "TX-7242", date: "2023-06-13", amount: 78.25 },
            { id: "TX-7241", date: "2023-06-12", amount: 54.98 },
          ],
        };
        setSalesData(mockSalesData);
        
        // Mock product performance data
        const mockProductData = {
          topProducts: [
            { name: "Vitamin C Serum", sales: 245, revenue: 7347.55 },
            { name: "Hyaluronic Acid Moisturizer", sales: 198, revenue: 4950.02 },
            { name: "Acetaminophen 500mg", sales: 312, revenue: 2805.88 },
            { name: "Retinol Night Cream", sales: 156, revenue: 5459.44 },
            { name: "Multivitamin Complex", sales: 203, revenue: 4059.97 },
          ],
          productTrends: [
            { month: "Jan", "Vitamin C Serum": 32, "Hyaluronic Acid": 22, "Retinol Cream": 18 },
            { month: "Feb", "Vitamin C Serum": 38, "Hyaluronic Acid": 28, "Retinol Cream": 20 },
            { month: "Mar", "Vitamin C Serum": 40, "Hyaluronic Acid": 32, "Retinol Cream": 24 },
            { month: "Apr", "Vitamin C Serum": 35, "Hyaluronic Acid": 30, "Retinol Cream": 26 },
            { month: "May", "Vitamin C Serum": 45, "Hyaluronic Acid": 35, "Retinol Cream": 28 },
            { month: "Jun", "Vitamin C Serum": 55, "Hyaluronic Acid": 40, "Retinol Cream": 30 },
          ],
        };
        setProductData(mockProductData);
        
        // Mock inventory data
        const mockInventoryData = {
          stockLevels: [
            { name: "Vitamin C Serum", stock: 5, max: 50 },
            { name: "Hyaluronic Acid Moisturizer", stock: 8, max: 50 },
            { name: "Acetaminophen 500mg", stock: 12, max: 50 },
            { name: "Retinol Night Cream", stock: 3, max: 50 },
            { name: "Multivitamin Complex", stock: 42, max: 50 },
            { name: "Ibuprofen 200mg", stock: 28, max: 50 },
            { name: "Omega-3 Fish Oil", stock: 15, max: 50 },
            { name: "Salicylic Acid Cleanser", stock: 9, max: 50 },
          ],
          stockHistory: [
            { month: "Jan", inStock: 85, outOfStock: 15 },
            { month: "Feb", inStock: 90, outOfStock: 10 },
            { month: "Mar", inStock: 88, outOfStock: 12 },
            { month: "Apr", inStock: 92, outOfStock: 8 },
            { month: "May", inStock: 94, outOfStock: 6 },
            { month: "Jun", inStock: 96, outOfStock: 4 },
          ],
        };
        setInventoryData(mockInventoryData);
        
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // Colors for charts
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-[#1F3368]">Analytics</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[#1F3368]/5">
          <TabsTrigger 
            value="sales" 
            className="data-[state=active]:bg-[#1F3368] data-[state=active]:text-white text-[#1F3368]"
          >
            Sales Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-[#1F3368] data-[state=active]:text-white text-[#1F3368]"
          >
            Product Performance
          </TabsTrigger>
          <TabsTrigger 
            value="inventory" 
            className="data-[state=active]:bg-[#1F3368] data-[state=active]:text-white text-[#1F3368]"
          >
            Inventory Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData.monthlySales}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#1F3368" />
                      <YAxis stroke="#1F3368" />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Sales']}
                        contentStyle={{ backgroundColor: 'white', borderColor: '#1F3368' }}
                        labelStyle={{ color: '#1F3368' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#1F3368" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData.salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#1F3368"
                        dataKey="value"
                      >
                        {salesData.salesByCategory.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${index * 45}, 70%, 50%)`}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ backgroundColor: 'white', borderColor: '#1F3368' }}
                        labelStyle={{ color: '#1F3368' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1F3368]/5">
                      <TableHead className="text-[#1F3368] font-semibold">Transaction ID</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Date</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.recentTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id} className="hover:bg-[#1F3368]/5">
                        <TableCell className="text-[#1F3368]">{transaction.id}</TableCell>
                        <TableCell className="text-[#1F3368]">{transaction.date}</TableCell>
                        <TableCell className="text-right text-[#1F3368]">
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Product Performance */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Product Sales Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={productData.productTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#1F3368" />
                      <YAxis stroke="#1F3368" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderColor: '#1F3368' }}
                        labelStyle={{ color: '#1F3368' }}
                      />
                      <Legend />
                      {["Vitamin C Serum", "Hyaluronic Acid", "Retinol Cream"].map((product, index) => (
                        <Line
                          key={product}
                          type="monotone"
                          dataKey={product}
                          stroke={`hsl(${index * 45}, 70%, 50%)`}
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productData.topProducts}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#1F3368" />
                      <YAxis stroke="#1F3368" />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        contentStyle={{ backgroundColor: 'white', borderColor: '#1F3368' }}
                        labelStyle={{ color: '#1F3368' }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#1F3368"
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Top Products by Units Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1F3368]/5">
                      <TableHead className="text-[#1F3368] font-semibold">Product</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Units Sold</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productData.topProducts.map((product: any) => (
                      <TableRow key={product.name} className="hover:bg-[#1F3368]/5">
                        <TableCell className="text-[#1F3368]">{product.name}</TableCell>
                        <TableCell className="text-right text-[#1F3368]">{product.sales}</TableCell>
                        <TableCell className="text-right text-[#1F3368]">
                          ${product.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Inventory Analytics */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Stock Availability History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventoryData.stockHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      stackOffset="expand"
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tickFormatter={(value) => `${value}%`}
                        stroke="#1F3368"
                      />
                      <YAxis 
                        dataKey="month" 
                        type="category"
                        stroke="#1F3368"
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ backgroundColor: 'white', borderColor: '#1F3368' }}
                        labelStyle={{ color: '#1F3368' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="inStock" 
                        stackId="a" 
                        fill="#1F3368" 
                        name="In Stock" 
                      />
                      <Bar 
                        dataKey="outOfStock" 
                        stackId="a" 
                        fill="#E11D48" 
                        name="Out of Stock" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Current Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventoryData.stockLevels}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#1F3368" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150}
                        stroke="#1F3368"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderColor: '#1F3368' }}
                        labelStyle={{ color: '#1F3368' }}
                      />
                      <Bar 
                        dataKey="stock" 
                        fill="#1F3368" 
                        radius={[0, 4, 4, 0]}
                        label={{ 
                          position: 'right', 
                          formatter: (value: number) => value,
                          fill: '#1F3368'
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1F3368]">Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1F3368]/5">
                      <TableHead className="text-[#1F3368] font-semibold">Product</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Current Stock</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.stockLevels
                      .filter((item: any) => item.stock <= 15)
                      .sort((a: any, b: any) => a.stock - b.stock)
                      .map((item: any) => (
                        <TableRow key={item.name} className="hover:bg-[#1F3368]/5">
                          <TableCell className="text-[#1F3368]">{item.name}</TableCell>
                          <TableCell className="text-right text-[#1F3368]">{item.stock}</TableCell>
                          <TableCell className="text-right text-[#1F3368]">
                            {item.stock <= 5 ? (
                              <span className="text-destructive font-medium">Critical</span>
                            ) : item.stock <= 10 ? (
                              <span className="text-amber-500 font-medium">Low</span>
                            ) : (
                              <span className="text-muted-foreground">Moderate</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}