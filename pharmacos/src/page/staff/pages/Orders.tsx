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
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addDays, format } from "date-fns";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function Orders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; status: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const response = await staffApi.getOrders();
        const data = response.data;
        
        // Transform the orders data to match our component's structure
        const transformedOrders = data.map((order: any) => {
          const userName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim();
          return {
            id: order._id,
            recipientName: order.recipientName || userName || 'N/A',
            phone: order.phone || order.user?.phone || 'N/A',
            shippingAddress: order.shippingAddress || 'N/A',
            date: new Date(order.createdAt).toLocaleDateString(),
            rawDate: new Date(order.createdAt),
            status: capitalizeFirstLetter(order.status),
            quantity: order.items && order.items.length > 0 ? order.items[0].quantity : 0,
            unitPrice: order.items && order.items.length > 0 ? order.items[0].price : 0,
            items: order.items || []
          };
        });

        // Sort by creation date (oldest first) and add order number
        const sortedOrders = transformedOrders.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
        const numberedOrders = sortedOrders.map((order, index) => ({
          ...order,
          orderNumber: index + 1
        }));

        setOrders(numberedOrders);
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
      order.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : order.status?.toLowerCase().trim() === statusFilter.toLowerCase().trim();
    return matchesSearch && matchesStatus;
  });

  // Sort orders by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.rawDate - a.rawDate;
    } else {
      return a.rawDate - b.rawDate;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + ordersPerPage);

  // Show order details
  const viewOrderDetails = (order: any) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setShowOrderDetails(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setPendingStatusChange({ orderId, status: newStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    // Validate cancel reason if status is cancelled
    if (pendingStatusChange.status.toLowerCase() === 'cancelled' && !cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:10000/api/orders/${pendingStatusChange.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: pendingStatusChange.status.toLowerCase(),
          ...(pendingStatusChange.status.toLowerCase() === 'cancelled' && { cancelReason })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(
        orders.map((order) =>
          order.id === pendingStatusChange.orderId
            ? { ...order, status: capitalizeFirstLetter(pendingStatusChange.status) }
            : order
        )
      );

      toast({
        title: "Order updated",
        description: `Order status changed to ${capitalizeFirstLetter(pendingStatusChange.status)}`,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setPendingStatusChange(null);
      setCancelReason("");
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
                <SelectItem value="pending" className="text-[#1F3368]">Pending</SelectItem>
                <SelectItem value="processing" className="text-[#1F3368]">Processing</SelectItem>
                <SelectItem value="completed" className="text-[#1F3368]">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-[#1F3368]">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={value => setSortOrder(value as 'desc' | 'asc')}>
              <SelectTrigger className="md:w-[180px] border-[#1F3368] text-[#1F3368]">
                <SelectValue>{sortOrder === 'desc' ? 'Ngày gần nhất' : 'Ngày xa nhất'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc" className="text-[#1F3368]">Ngày gần nhất</SelectItem>
                <SelectItem value="asc" className="text-[#1F3368]">Ngày xa nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-6 text-[#1F3368]">Loading...</div>
          ) : (
            <>
              <div className="border rounded-md overflow-auto border-[#1F3368]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1F3368]/5">
                      <TableHead className="text-[#1F3368] font-semibold">Order #</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Recipient Name</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Date</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Phone</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Status</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Quantity</TableHead>
                      <TableHead className="text-[#1F3368] font-semibold">Unit Price</TableHead>
                      <TableHead className="text-right text-[#1F3368] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={8} 
                          className="text-center py-6 text-[#1F3368]"
                        >
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-[#1F3368]/5">
                          <TableCell className="text-[#1F3368] font-medium">{order.orderNumber}</TableCell>
                          <TableCell className="text-[#1F3368]">{order.recipientName}</TableCell>
                          <TableCell className="text-[#1F3368]">{order.date}</TableCell>
                          <TableCell className="text-[#1F3368]">{order.phone}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-[120px] border-[#1F3368] text-[#1F3368]">
                                <SelectValue>{order.status}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending" className="text-[#1F3368]">Pending</SelectItem>
                                <SelectItem value="processing" className="text-[#1F3368]">Processing</SelectItem>
                                <SelectItem value="completed" className="text-[#1F3368]">Completed</SelectItem>
                                <SelectItem value="cancelled" className="text-[#1F3368]">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-[#1F3368]">{order.quantity}</TableCell>
                          <TableCell className="text-[#1F3368]">${order.unitPrice.toFixed(2)}</TableCell>
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
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-[#1F3368]">
                  Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, sortedOrders.length)} of {sortedOrders.length} orders
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-[#1F3368]">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
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
                          <SelectItem value="pending" className="text-[#1F3368]">Pending</SelectItem>
                          <SelectItem value="processing" className="text-[#1F3368]">Processing</SelectItem>
                          <SelectItem value="completed" className="text-[#1F3368]">Completed</SelectItem>
                          <SelectItem value="cancelled" className="text-[#1F3368]">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p>Total: ${currentOrder.quantity * currentOrder.unitPrice}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3368] mb-2">Customer Information</h3>
                  <div className="space-y-1 text-[#1F3368]">
                    <p>Name: {currentOrder.recipientName}</p>
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
                onClick={() => handleStatusChange(currentOrder.id, newStatus)}
                className="bg-[#1F3368] hover:bg-[#152347] text-white"
              >
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog 
        open={!!pendingStatusChange} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPendingStatusChange(null);
            setCancelReason("");
          }
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1F3368]">Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this order's status to {capitalizeFirstLetter(pendingStatusChange?.status || '')}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingStatusChange?.status.toLowerCase() === 'cancelled' && (
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-[#1F3368] mb-2">
                Cancellation Reason (Required)
              </label>
              <Input
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                className="w-full border-[#1F3368] focus:ring-[#1F3368]"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
              onClick={() => {
                setPendingStatusChange(null);
                setCancelReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusChange}
              className="bg-[#1F3368] hover:bg-[#152347] text-white"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}