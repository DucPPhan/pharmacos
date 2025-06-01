import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  LineChart,
  PieChart,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Upload,
  Settings,
  Bell,
} from "lucide-react";
  
const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2">
            P
          </div>
          <h1 className="text-xl font-bold">PharmaCos Admin</h1>
        </div>

        <nav className="space-y-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("overview")}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("inventory")}
          >
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </Button>
          <Button
            variant={activeTab === "ai-training" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("ai-training")}
          >
            <Upload className="mr-2 h-4 w-4" />
            AI Training
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-card p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                alt="Admin"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$24,780.50</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +12.4% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,345</div>
                    <p className="text-xs text-muted-foreground">
                      +18.7% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Inventory Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,287</div>
                    <p className="text-xs text-muted-foreground">
                      +5.2% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <TableRow>
                          <TableCell>#ORD-7245</TableCell>
                          <TableCell>Sarah Johnson</TableCell>
                          <TableCell>Delivered</TableCell>
                          <TableCell className="text-right">$125.99</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>#ORD-7244</TableCell>
                          <TableCell>Michael Chen</TableCell>
                          <TableCell>Processing</TableCell>
                          <TableCell className="text-right">$89.50</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>#ORD-7243</TableCell>
                          <TableCell>Emma Wilson</TableCell>
                          <TableCell>Shipped</TableCell>
                          <TableCell className="text-right">$245.75</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>#ORD-7242</TableCell>
                          <TableCell>James Rodriguez</TableCell>
                          <TableCell>Pending</TableCell>
                          <TableCell className="text-right">$78.25</TableCell>
                        </TableRow>
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
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            Vitamin C Serum
                          </div>
                          <div className="text-xs text-muted-foreground">
                            5 units remaining
                          </div>
                        </div>
                        <Progress className="w-24" value={10} />
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            Hyaluronic Acid Moisturizer
                          </div>
                          <div className="text-xs text-muted-foreground">
                            8 units remaining
                          </div>
                        </div>
                        <Progress className="w-24" value={16} />
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            Acetaminophen 500mg
                          </div>
                          <div className="text-xs text-muted-foreground">
                            12 units remaining
                          </div>
                        </div>
                        <Progress className="w-24" value={24} />
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            Retinol Night Cream
                          </div>
                          <div className="text-xs text-muted-foreground">
                            3 units remaining
                          </div>
                        </div>
                        <Progress className="w-24" value={6} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Inventory Management</CardTitle>
                  <Button>Add Product</Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      placeholder="Search products..."
                      className="max-w-sm"
                    />
                    <Button variant="outline">Filter</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Vitamin C Serum</TableCell>
                        <TableCell>Cosmetics</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>$29.99</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hyaluronic Acid Moisturizer</TableCell>
                        <TableCell>Cosmetics</TableCell>
                        <TableCell>8</TableCell>
                        <TableCell>$24.99</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Acetaminophen 500mg</TableCell>
                        <TableCell>Pharmaceuticals</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>$8.99</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Retinol Night Cream</TableCell>
                        <TableCell>Cosmetics</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>$34.99</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Button>Add User</Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Input placeholder="Search users..." className="max-w-sm" />
                    <Button variant="outline">Filter</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
                              alt="Sarah Johnson"
                            />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          Sarah Johnson
                        </TableCell>
                        <TableCell>sarah.j@example.com</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src="https://api.dicebear.com/7.x/avataaars/svg?seed=michael"
                              alt="Michael Chen"
                            />
                            <AvatarFallback>MC</AvatarFallback>
                          </Avatar>
                          Michael Chen
                        </TableCell>
                        <TableCell>m.chen@example.com</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src="https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
                              alt="Emma Wilson"
                            />
                            <AvatarFallback>EW</AvatarFallback>
                          </Avatar>
                          Emma Wilson
                        </TableCell>
                        <TableCell>emma.w@example.com</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline">Export</Button>
                    <Button>New Order</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      placeholder="Search orders..."
                      className="max-w-sm"
                    />
                    <Button variant="outline">Filter</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>#ORD-7245</TableCell>
                        <TableCell>Sarah Johnson</TableCell>
                        <TableCell>2023-06-15</TableCell>
                        <TableCell>Delivered</TableCell>
                        <TableCell>$125.99</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>#ORD-7244</TableCell>
                        <TableCell>Michael Chen</TableCell>
                        <TableCell>2023-06-14</TableCell>
                        <TableCell>Processing</TableCell>
                        <TableCell>$89.50</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>#ORD-7243</TableCell>
                        <TableCell>Emma Wilson</TableCell>
                        <TableCell>2023-06-14</TableCell>
                        <TableCell>Shipped</TableCell>
                        <TableCell>$245.75</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>#ORD-7242</TableCell>
                        <TableCell>James Rodriguez</TableCell>
                        <TableCell>2023-06-13</TableCell>
                        <TableCell>Pending</TableCell>
                        <TableCell>$78.25</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-training" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Product Recognition Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Upload product images to train the AI recognition system.
                      Add multiple angles of each product for better accuracy.
                    </p>

                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Drag and drop product images
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <Button>Upload Images</Button>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Recent Training Sessions
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Images</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Accuracy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>2023-06-15</TableCell>
                            <TableCell>Skincare Line</TableCell>
                            <TableCell>48 images</TableCell>
                            <TableCell>Completed</TableCell>
                            <TableCell>94%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>2023-06-10</TableCell>
                            <TableCell>Pain Relief Products</TableCell>
                            <TableCell>32 images</TableCell>
                            <TableCell>Completed</TableCell>
                            <TableCell>91%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>2023-06-05</TableCell>
                            <TableCell>Vitamin Supplements</TableCell>
                            <TableCell>64 images</TableCell>
                            <TableCell>Completed</TableCell>
                            <TableCell>89%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                          General Settings
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Store Name
                            </label>
                            <Input defaultValue="PharmaCos Store" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Contact Email
                            </label>
                            <Input defaultValue="contact@pharmacos.example" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Phone Number
                            </label>
                            <Input defaultValue="+1 (555) 123-4567" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                          AI System Settings
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Recognition Confidence Threshold
                            </label>
                            <Input type="number" defaultValue="85" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Max Results Per Search
                            </label>
                            <Input type="number" defaultValue="5" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Auto-Training Schedule
                            </label>
                            <Input defaultValue="Weekly" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
