import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { staffApi } from "@/page/staff/services/api";
import { Search, Filter, Download, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function Orders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:10000/api/staff/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        // Transform the orders data to match our component's structure
        const transformedOrders = data.map((order: any) => ({
          id: order._id,
          customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`,
          email: order.user?.email || '',
          phone: order.user?.phone || '',
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.status,
          total: order.totalAmount,
          items: order.items.map((item: any) => ({
            id: item._id,
            name: item.product?.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price
          }))
        }));

        setOrders(transformedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Show order details
  const viewOrderDetails = (order: any) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setShowOrderDetails(true);
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!currentOrder) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:10000/api/staff/orders/${currentOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === currentOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      toast({
        title: "Order updated",
        description: `Order ${currentOrder.id} status changed to ${newStatus}`,
      });
      
      setShowOrderDetails(false);
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-[#1F3368]">Order Management</h2>
        <Button 
          variant="outline" 
          className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1F3368]">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1F3368]" />
              <Input
                placeholder="Search orders..."
                className="pl-8 border-[#1F3368] focus:ring-[#1F3368]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="md:w-[180px] border-[#1F3368] text-[#1F3368]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[#1F3368]">All Statuses</SelectItem>
                <SelectItem value="Pending" className="text-[#1F3368]">Pending</SelectItem>
                <SelectItem value="Processing" className="text-[#1F3368]">Processing</SelectItem>
                <SelectItem value="Shipped" className="text-[#1F3368]">Shipped</SelectItem>
                <SelectItem value="Delivered" className="text-[#1F3368]">Delivered</SelectItem>
                <SelectItem value="Cancelled" className="text-[#1F3368]">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-6 text-[#1F3368]">Loading...</div>
          ) : (
            <div className="border rounded-md overflow-auto border-[#1F3368]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1F3368]/5">
                    <TableHead className="text-[#1F3368] font-semibold">Order ID</TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">Customer</TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">Date</TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">Status</TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">Total</TableHead>
                    <TableHead className="text-right text-[#1F3368] font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={6} 
                        className="text-center py-6 text-[#1F3368]"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-[#1F3368]/5">
                        <TableCell className="text-[#1F3368]">{order.id}</TableCell>
                        <TableCell className="text-[#1F3368]">{order.customer}</TableCell>
                        <TableCell className="text-[#1F3368]">{order.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "success"
                                : order.status === "Shipped"
                                ? "default"
                                : order.status === "Processing"
                                ? "secondary"
                                : order.status === "Cancelled"
                                ? "destructive"
                                : "outline"
                            }
                            className={
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#1F3368]">${order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#1F3368] hover:bg-[#1F3368]/10"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#1F3368]">Order Details</DialogTitle>
            <DialogDescription className="text-[#1F3368]/70">
              View and manage order information
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-[#1F3368] mb-2">Order Information</h3>
                  <div className="space-y-1 text-[#1F3368]">
                    <p>Order ID: {currentOrder.id}</p>
                    <p>Date: {currentOrder.date}</p>
                    <div className="flex items-center gap-2">
                      <p>Status:</p>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="w-[180px] border-[#1F3368] text-[#1F3368]">
                          <SelectValue>{newStatus}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending" className="text-[#1F3368]">Pending</SelectItem>
                          <SelectItem value="Processing" className="text-[#1F3368]">Processing</SelectItem>
                          <SelectItem value="Shipped" className="text-[#1F3368]">Shipped</SelectItem>
                          <SelectItem value="Delivered" className="text-[#1F3368]">Delivered</SelectItem>
                          <SelectItem value="Cancelled" className="text-[#1F3368]">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p>Total: ${currentOrder.total.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3368] mb-2">Customer Information</h3>
                  <div className="space-y-1 text-[#1F3368]">
                    <p>Name: {currentOrder.customer}</p>
                    <p>Email: {currentOrder.email}</p>
                    <p>Phone: {currentOrder.phone}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#1F3368] mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1F3368]/5">
                      <TableHead className="text-[#1F3368] font-semibold">Product</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Quantity</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-[#1F3368]/5">
                        <TableCell className="text-[#1F3368]">{item.name}</TableCell>
                        <TableCell className="text-[#1F3368]">{item.quantity}</TableCell>
                        <TableCell className="text-right text-[#1F3368]">
                          ${item.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOrderDetails(false)}
              className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
            >
              Cancel
            </Button>
            {newStatus !== currentOrder?.status && (
              <Button
                onClick={updateOrderStatus}
                className="bg-[#1F3368] hover:bg-[#152347] text-white"
              >
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}