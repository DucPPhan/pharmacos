import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown, ChevronUp, Calendar, Mail, Package, User, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
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
import { staffApi } from "@/page/staff/services/api";

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  recipientName: string;
  phone: string;
  shippingAddress: string;
  note: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['completed', 'cancelled'];
      case 'completed':
        return [];
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Order #{order.id.slice(-6)}</h3>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{order.recipientName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{order.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Customer Name</div>
                      <div className="font-medium text-gray-900">{order.recipientName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{order.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Shipping Address</div>
                      <div className="font-medium text-gray-900">{order.shippingAddress}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Note</div>
                      <div className="font-medium text-gray-900">{order.note || 'No note'}</div>
                    </div>
                  </div>
                </div>
                {order.cancelReason && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-red-700">
                      <span className="font-medium">Cancellation Reason:</span> {order.cancelReason}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status Update */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
              {nextStatuses.length > 0 ? (
                <div className="space-y-2">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(order.id, status)}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg border-2 transition-colors capitalize
                        ${status === 'cancelled' 
                          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' 
                          : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }
                      `}
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-center">No status updates available</p>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500">
                Last updated: {format(new Date(order.updatedAt), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function Orders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; status: OrderStatus } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const response = await staffApi.getOrders();
        const data = response.data;
        
        const transformedOrders = data.map((order: any) => ({
          id: order._id,
          customerId: order.customerId,
          recipientName: order.recipientName,
          phone: order.phone,
          shippingAddress: order.shippingAddress,
          note: order.note,
          status: order.status.toLowerCase(),
          totalAmount: order.totalAmount,
          orderDate: order.orderDate,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          cancelReason: order.cancelReason
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = format(orderDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          break;
        case 'yesterday':
          matchesDate = format(orderDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd');
          break;
        case 'week':
          matchesDate = orderDate >= lastWeek;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setPendingStatusChange({ orderId, status });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    if (pendingStatusChange.status === 'cancelled' && !cancelReason.trim()) {
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
          status: pendingStatusChange.status,
          ...(pendingStatusChange.status === 'cancelled' && { cancelReason })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(
        orders.map((order) =>
          order.id === pendingStatusChange.orderId
            ? { ...order, status: pendingStatusChange.status }
            : order
        )
      );

      toast({
        title: "Order updated",
        description: `Order status changed to ${pendingStatusChange.status}`,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{orderStats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{orderStats.processing}</div>
          <div className="text-sm text-gray-500">Processing</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Loading...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No orders found</div>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleStatusChange}
            />
          ))
        )}
      </div>

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
            <AlertDialogTitle className="text-gray-900">Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change this order's status to {pendingStatusChange?.status}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingStatusChange?.status === 'cancelled' && (
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason (Required)
              </label>
              <Input
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                className="w-full"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setPendingStatusChange(null);
                setCancelReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusChange}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}