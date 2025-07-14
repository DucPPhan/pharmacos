import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/page/staff/pages/Dashbooard-layout";
import { Overview } from "@/page/staff/pages/Overview";
import { Inventory } from "@/page/staff/pages/Inventory";
import { Orders } from "@/page/staff/pages/Orders";
import Analytics from "./pages/Analytics";
import BatchManagement from "./pages/BatchManagement";
import SupplierManagement from "./pages/SupplierManagement";

export function Staffdashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics" element={<Analytics />} />
        {/* <Route path="overview" element={<Overview />} /> */}
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="batches" element={<BatchManagement />} />
        <Route path="suppliers" element={<SupplierManagement />} />
      </Route>
    </Routes>
  );
}

export default Staffdashboard;
