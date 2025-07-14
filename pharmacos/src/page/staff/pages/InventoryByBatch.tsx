import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Batch {
  _id: string;
  batchCode: string;
  productId: {
    _id: string;
    name: string;
    category: string;
    brand: string[];
  };
  quantity: number;
  remainingQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  location: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
}

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

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function InventoryByBatch() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
    fetchBatches();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?limit=100");
      setProducts(res.data.products || []);
    } catch (e) {
      setProducts([]);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(productFilter &&
          productFilter !== "all" && { productId: productFilter }),
        ...(search && { search }),
        limit: "100",
      });
      const res = await api.get(`/batches?${params}`);
      setBatches(res.data.batches || []);
    } catch (e) {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line
  }, [productFilter, search]);

  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight text-blue-900">
          <span className="inline-flex items-center gap-2">
            <PackageSearch className="text-blue-600" size={28} />
            Inventory by Batch
          </span>
        </CardTitle>
        <CardDescription>
          Quản lý tồn kho chi tiết theo từng lô hàng, ngày sản xuất, hạn sử
          dụng. Tối ưu xuất kho, kiểm soát hạn dùng và truy xuất nguồn gốc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Tìm kiếm batch code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              aria-label="Tìm kiếm batch code"
            />
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                {(products || []).map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchBatches} variant="outline">
              Làm mới
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-blue-600 animate-pulse">
              <Loader2 className="mr-2 animate-spin" /> Đang tải dữ liệu...
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Không có dữ liệu batch phù hợp.
            </div>
          ) : (
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Ngày SX</TableHead>
                  <TableHead>Hạn dùng</TableHead>
                  <TableHead>Số lượng còn</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow
                    key={batch._id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <TableCell>
                      <span className="font-semibold text-blue-900">
                        {batch.productId?.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-blue-700 font-bold">
                        {batch.batchCode}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(batch.manufacturingDate)}</TableCell>
                    <TableCell>{formatDate(batch.expiryDate)}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-700">
                        {batch.remainingQuantity}
                      </span>
                      <span className="text-gray-400"> / {batch.quantity}</span>
                    </TableCell>
                    <TableCell>{batch.location || "-"}</TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
