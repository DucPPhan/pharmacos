import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface BatchInfo {
  _id: string;
  batchCode: string;
  remainingQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  expiryStatus: string;
  status: string;
}

interface ProductBatchInfoProps {
  productId: string;
  showDetails?: boolean;
}

export default function ProductBatchInfo({
  productId,
  showDetails = false,
}: ProductBatchInfoProps) {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductBatches();
  }, [productId]);

  const fetchProductBatches = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/batches?productId=${productId}&status=active`
      );
      setBatches(response.data.batches || []);
    } catch (error) {
      console.error("Failed to fetch product batches:", error);
      setError("Failed to load batch information");
    } finally {
      setLoading(false);
    }
  };

  const getExpiryBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="destructive">Sắp hết hạn</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge variant="secondary">Cảnh báo</Badge>;
    } else {
      return <Badge variant="default">Tốt</Badge>;
    }
  };

  const getStockStatus = () => {
    const totalStock = batches.reduce(
      (sum, batch) => sum + batch.remainingQuantity,
      0
    );
    const expiringSoon = batches.filter(
      (batch) => batch.daysUntilExpiry <= 30 && batch.daysUntilExpiry > 0
    );

    if (totalStock === 0) {
      return { status: "out_of_stock", message: "Hết hàng" };
    } else if (expiringSoon.length > 0) {
      return { status: "expiring_soon", message: "Sắp hết hạn - Giảm giá" };
    } else if (totalStock < 10) {
      return { status: "low_stock", message: "Số lượng có hạn" };
    } else {
      return { status: "in_stock", message: "Còn hàng" };
    }
  };

  const stockStatus = getStockStatus();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Don't show error to customers
  }

  if (batches.length === 0) {
    return null; // Don't show if no batches
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Thông tin lô hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tình trạng:</span>
          <Badge
            variant={
              stockStatus.status === "out_of_stock"
                ? "destructive"
                : stockStatus.status === "expiring_soon"
                ? "destructive"
                : stockStatus.status === "low_stock"
                ? "secondary"
                : "default"
            }
          >
            {stockStatus.message}
          </Badge>
        </div>

        {/* Total Stock */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Tổng tồn kho:</span>
          <span className="text-sm font-medium">
            {batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0)}{" "}
            sản phẩm
          </span>
        </div>

        {/* Manufacturing Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Ngày sản xuất:</span>
          <span className="text-sm">
            {new Date(batches[0]?.manufacturingDate).toLocaleDateString(
              "vi-VN"
            )}
          </span>
        </div>

        {/* Expiry Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Hạn sử dụng:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {new Date(batches[0]?.expiryDate).toLocaleDateString("vi-VN")}
            </span>
            {getExpiryBadge(batches[0]?.daysUntilExpiry || 0)}
          </div>
        </div>

        {/* Show batch details if requested */}
        {showDetails && batches.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Chi tiết các lô:</h4>
            <div className="space-y-2">
              {batches.map((batch) => (
                <div key={batch._id} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span>Lô {batch.batchCode}:</span>
                    <span>{batch.remainingQuantity} sản phẩm</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>Hết hạn:</span>
                    <div className="flex items-center gap-1">
                      <span>
                        {new Date(batch.expiryDate).toLocaleDateString("vi-VN")}
                      </span>
                      {getExpiryBadge(batch.daysUntilExpiry)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Assurance */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">
              Đã kiểm tra chất lượng và đạt tiêu chuẩn
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
