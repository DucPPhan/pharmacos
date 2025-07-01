import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentResult: React.FC = () => {
  const query = useQuery();
  const status = query.get("status");
  const code = query.get("code");
  const cancel = query.get("cancel");
  const { clearCart } = useCart();

  useEffect(() => {
    if ((status === "PAID" || code === "00") && cancel !== "true") {
      localStorage.removeItem("cart");
      if (clearCart) clearCart();
    }
  }, [status, code, cancel, clearCart]);

  let title = "";
  let description = "";
  let icon = null;
  let color = "";

  if (cancel === "true") {
    title = "Thanh toán đã bị huỷ";
    description =
      "Bạn đã huỷ giao dịch thanh toán. Đơn hàng của bạn chưa được thanh toán.";
    icon = <AlertTriangle className="h-24 w-24 text-yellow-500" />;
    color = "yellow";
  } else if (status === "PAID" || code === "00") {
    title = "Thanh toán thành công!";
    description =
      "Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được ghi nhận.";
    icon = <CheckCircle className="h-24 w-24 text-green-500" />;
    color = "green";
  } else {
    title = "Thanh toán thất bại";
    description =
      "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.";
    icon = <XCircle className="h-24 w-24 text-red-500" />;
    color = "red";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-12 mt-20 text-center">
        <div className="flex justify-center mb-10">{icon}</div>
        <h1 className={`text-4xl font-bold mb-6 text-${color}-600`}>{title}</h1>
        <p className="text-muted-foreground mb-10 text-xl">{description}</p>
        <div className="space-y-6">
          <Button
            asChild
            className="w-full h-14 text-lg"
            style={{ backgroundColor: "#7494ec" }}
          >
            <Link
              to="/profile/don-hang-cua-toi"
              className="flex items-center justify-center"
            >
              <ShoppingBag className="mr-2 h-6 w-6" />
              Xem đơn hàng của tôi
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full h-14 text-lg">
            <Link to="/" className="flex items-center justify-center">
              Về trang chủ
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
