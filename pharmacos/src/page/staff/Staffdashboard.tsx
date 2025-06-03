import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/page/staff/pages/Dashbooard-layout";
import { Overview } from "@/page/staff/pages/Overview";
import { Inventory } from "@/page/staff/pages/Inventory";
import { Orders } from "@/page/staff/pages/Orders";
import { Analytics } from "@/page/staff/pages/Analytics";
import { Profile } from "@/page/staff/pages/Profile";
import { Brands } from "@/page/staff/pages/Brands";
import { Categories } from "@/page/staff/pages/Categories";
import { Settings } from "@/page/staff/pages/Setting";

export function Staffdashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="brands" element={<Brands />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default Staffdashboard;
