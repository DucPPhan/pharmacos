import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/page/staff/pages/Dashbooard-layout";
import { Overview } from "@/page/staff/pages/Overview";
import { Inventory } from "@/page/staff/pages/Inventory";
import { Orders } from "@/page/staff/pages/Orders";
import { Analytics } from "@/page/staff/pages/Analytics";


export function Staffdashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default Staffdashboard;
