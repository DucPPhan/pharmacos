import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Batch {
  _id: string;
  batchCode: string;
  productId: {
    _id: string;
    name: string;
    category: string;
    brand: string[];
  };
  supplierId: {
    _id: string;
    name: string;
    code: string;
  };
  quantity: number;
  remainingQuantity: number;
  unitCost: number;
  totalCost: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  location: string;
  notes?: string;
  qualityCheck: {
    passed: boolean;
    checkedBy?: {
      name: string;
      email: string;
    };
    checkedAt?: string;
    notes?: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  createdAt: string;
  daysUntilExpiry: number;
  expiryStatus: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string[];
}

interface Supplier {
  _id: string;
  name: string;
  code: string;
}

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const { toast } = useToast();
  const [loadingBatchId, setLoadingBatchId] = useState<string | null>(null);
  const [loadingQualityCheck, setLoadingQualityCheck] = useState(false);

  // Form states for creating new batch
  const [formData, setFormData] = useState({
    productId: "",
    supplierId: "",
    quantity: "",
    unitCost: "",
    manufacturingDate: "",
    expiryDate: "",
    location: "",
    notes: "",
  });

  // Form states for quality check
  const [qualityData, setQualityData] = useState({
    passed: false,
    notes: "",
  });

  useEffect(() => {
    fetchBatches();
    fetchProducts();
    fetchSuppliers();
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    expiryFilter,
    productFilter,
    supplierFilter,
  ]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(expiryFilter &&
          expiryFilter !== "all" && { expiryStatus: expiryFilter }),
        ...(productFilter &&
          productFilter !== "all" && { productId: productFilter }),
        ...(supplierFilter &&
          supplierFilter !== "all" && { supplierId: supplierFilter }),
      });

      const response = await api.get(`/batches?${params}`);
      setBatches(response.data.batches);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/staff/products?limit=100");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers?limit=100");
      setSuppliers(response.data.suppliers);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const handleCreateBatch = async () => {
    if (formData.productId === "default" || formData.supplierId === "default") {
      toast({
        title: "Error",
        description: "Please select both Product and Supplier.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post("/batches", formData);
      toast({
        title: "Success",
        description: "Batch created successfully",
      });
      setShowCreateDialog(false);
      setFormData({
        productId: "",
        supplierId: "",
        quantity: "",
        unitCost: "",
        manufacturingDate: "",
        expiryDate: "",
        location: "",
        notes: "",
      });
      fetchBatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create batch",
        variant: "destructive",
      });
    }
  };

  const handleApproveBatch = async (batchId: string) => {
    setLoadingBatchId(batchId);
    try {
      await api.post(`/batches/${batchId}/approve`);
      toast({
        title: "Success",
        description: "Batch approved successfully",
      });
      fetchBatches();
      fetchProducts(); // Tự động cập nhật inventory/product
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve batch",
        variant: "destructive",
      });
    } finally {
      setLoadingBatchId(null);
    }
  };

  const handleQualityCheck = async () => {
    if (!selectedBatch) return;

    setLoadingQualityCheck(true);
    try {
      await api.put(`/batches/${selectedBatch._id}`, {
        qualityCheck: qualityData,
      });
      toast({
        title: "Success",
        description: "Quality check updated successfully",
      });
      setShowQualityDialog(false);
      setSelectedBatch(null);
      setQualityData({ passed: false, notes: "" });
      fetchBatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update quality check",
        variant: "destructive",
      });
    } finally {
      setLoadingQualityCheck(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      received: { label: "Received", variant: "default" as const },
      active: { label: "Active", variant: "default" as const },
      expired: { label: "Expired", variant: "destructive" as const },
      recalled: { label: "Recalled", variant: "destructive" as const },
      disposed: { label: "Disposed", variant: "secondary" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getExpiryBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="destructive">Expiring Soon</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge variant="secondary">Warning</Badge>;
    } else {
      return <Badge variant="default">Good</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Batch Management
          </h2>
          <p className="text-muted-foreground">
            Manage product batches, track expiry dates, and monitor quality
            control
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create New Batch</Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-lg w-full rounded-xl shadow-2xl p-8 bg-white dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM3 10h18M7 16v2m10-2v2"
                  />
                </svg>
                Create New Batch
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Add a new product batch to your inventory. Please fill in all
                required fields.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBatch();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            >
              {/* Product */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="product" className="font-medium">
                  Product <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.productId || "default"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                  aria-label="Product"
                  required
                >
                  <SelectTrigger className="col-span-3" id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" disabled>
                      Select product
                    </SelectItem>
                    {(products || []).map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.productId === "default" && (
                  <span className="text-xs text-red-500">
                    Please select a product.
                  </span>
                )}
              </div>
              {/* Supplier */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="supplier" className="font-medium">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.supplierId || "default"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplierId: value })
                  }
                  aria-label="Supplier"
                  required
                >
                  <SelectTrigger className="col-span-3" id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" disabled>
                      Select supplier
                    </SelectItem>
                    {(suppliers || []).map((supplier) => (
                      <SelectItem key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.supplierId === "default" && (
                  <span className="text-xs text-red-500">
                    Please select a supplier.
                  </span>
                )}
              </div>
              {/* Quantity */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="quantity" className="font-medium">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                  aria-label="Quantity"
                />
                {!formData.quantity && (
                  <span className="text-xs text-red-500">
                    Please enter quantity.
                  </span>
                )}
              </div>
              {/* Unit Cost */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="unitCost" className="font-medium">
                  Unit Cost <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  value={formData.unitCost}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: e.target.value })
                  }
                  required
                  aria-label="Unit Cost"
                />
                {!formData.unitCost && (
                  <span className="text-xs text-red-500">
                    Please enter unit cost.
                  </span>
                )}
              </div>
              {/* Manufacturing Date */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="manufacturingDate" className="font-medium">
                  Manufacturing Date
                </Label>
                <Input
                  id="manufacturingDate"
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manufacturingDate: e.target.value,
                    })
                  }
                  aria-label="Manufacturing Date"
                />
              </div>
              {/* Expiry Date */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="expiryDate" className="font-medium">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  aria-label="Expiry Date"
                />
              </div>
              {/* Location */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <Label htmlFor="location" className="font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  aria-label="Location"
                />
              </div>
              {/* Notes */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <Label htmlFor="notes" className="font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  aria-label="Notes"
                />
              </div>
              {/* Submit */}
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button
                  type="submit"
                  className="w-full md:w-auto flex items-center gap-2"
                  disabled={
                    !formData.productId ||
                    formData.productId === "default" ||
                    !formData.supplierId ||
                    formData.supplierId === "default" ||
                    !formData.quantity ||
                    !formData.unitCost
                  }
                  aria-label="Create Batch"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Batch
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="recalled">Recalled</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiry">Expiry Status</Label>
              <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All expiry statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All expiry statuses</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expiring_warning">Warning</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product">Product</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {(products || []).map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All suppliers</SelectItem>
                  {(suppliers || []).map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
          <CardDescription>
            Manage product batches and track their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Quality Check</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(batches || []).map((batch) => (
                  <TableRow key={batch._id}>
                    <TableCell className="font-medium">
                      {batch.batchCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {batch.productId?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {batch.productId?.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {batch.supplierId?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {batch.supplierId?.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>
                          {batch.remainingQuantity}/{batch.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(batch.unitCost)} each
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{getExpiryBadge(batch.daysUntilExpiry)}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.abs(batch.daysUntilExpiry)} days
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{batch.location}</TableCell>
                    <TableCell>
                      {batch.qualityCheck ? (
                        <div>
                          <div
                            className={
                              batch.qualityCheck.passed
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {batch.qualityCheck.passed
                              ? "Passed"
                              : "Not passed"}
                          </div>
                          {batch.qualityCheck.checkedBy && (
                            <div className="text-xs text-muted-foreground">
                              By:{" "}
                              {batch.qualityCheck.checkedBy.name ||
                                batch.qualityCheck.checkedBy.email ||
                                "Unknown"}
                            </div>
                          )}
                          {batch.qualityCheck.checkedAt && (
                            <div className="text-xs text-muted-foreground">
                              At:{" "}
                              {new Date(
                                batch.qualityCheck.checkedAt
                              ).toLocaleString()}
                            </div>
                          )}
                          {batch.qualityCheck.notes && (
                            <div className="text-xs text-muted-foreground italic">
                              "{batch.qualityCheck.notes}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No quality check
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {batch.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveBatch(batch._id)}
                            disabled={loadingBatchId === batch._id}
                            className="mr-2"
                            aria-label="Approve Batch"
                          >
                            {loadingBatchId === batch._id ? (
                              <svg
                                className="animate-spin w-4 h-4 mr-1 inline"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                ></path>
                              </svg>
                            ) : null}
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setQualityData({
                              passed: batch.qualityCheck.passed,
                              notes: batch.qualityCheck.notes || "",
                            });
                            setShowQualityDialog(true);
                          }}
                        >
                          Quality Check
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Check Dialog */}
      <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <DialogContent className="max-w-md w-full rounded-xl shadow-2xl p-6 bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4"
                />
              </svg>
              Quality Check
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1">
              Update quality check information for batch{" "}
              <span className="font-semibold">{selectedBatch?.batchCode}</span>
            </DialogDescription>
          </DialogHeader>
          {/* Hiển thị thông tin quality check nếu đã có */}
          {selectedBatch?.qualityCheck && (
            <div className="mb-4 p-3 rounded bg-gray-50 dark:bg-gray-800 border text-sm">
              <div
                className={
                  selectedBatch.qualityCheck.passed
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {selectedBatch.qualityCheck.passed ? "Passed" : "Not passed"}
              </div>
              {selectedBatch.qualityCheck.checkedBy && (
                <div className="text-xs text-muted-foreground">
                  By:{" "}
                  {selectedBatch.qualityCheck.checkedBy.name ||
                    selectedBatch.qualityCheck.checkedBy.email ||
                    "Unknown"}
                </div>
              )}
              {selectedBatch.qualityCheck.checkedAt && (
                <div className="text-xs text-muted-foreground">
                  At:{" "}
                  {new Date(
                    selectedBatch.qualityCheck.checkedAt
                  ).toLocaleString()}
                </div>
              )}
              {selectedBatch.qualityCheck.notes && (
                <div className="text-xs text-muted-foreground italic">
                  "{selectedBatch.qualityCheck.notes}"
                </div>
              )}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQualityCheck();
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="passed"
                checked={qualityData.passed}
                onChange={(e) =>
                  setQualityData({ ...qualityData, passed: e.target.checked })
                }
                className="w-5 h-5 accent-primary"
              />
              <Label htmlFor="passed" className="font-medium text-base">
                Passed Quality Check
              </Label>
            </div>
            <div>
              <Label htmlFor="qualityNotes" className="font-medium">
                Notes
              </Label>
              <Textarea
                id="qualityNotes"
                value={qualityData.notes}
                onChange={(e) => {
                  if (e.target.value.length <= 300)
                    setQualityData({ ...qualityData, notes: e.target.value });
                }}
                placeholder="Enter quality check notes..."
                className="resize-none min-h-[80px]"
              />
              <div className="text-xs text-right text-gray-400">
                {qualityData.notes?.length || 0}/300
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={loadingQualityCheck}
                aria-label="Update Quality Check"
              >
                {loadingQualityCheck ? (
                  <svg
                    className="animate-spin w-4 h-4 mr-2 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                ) : null}
                Update Quality Check
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
