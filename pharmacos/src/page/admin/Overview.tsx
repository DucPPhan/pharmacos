import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:10000/api/admin/accounts';

const Overview: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setUsers(res.data);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Tính toán số liệu
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const lockedAccounts = users.filter((u) => u.status === 'locked').length;
  // Giả lập growth rate (có thể thay bằng API thật nếu có)
  const growthRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0.0';

  // Phân phối user theo role
  const roleStats = [
    { role: 'Pharmacists', color: 'bg-blue-500', count: users.filter((u) => u.role === 'Pharmacist').length },
    { role: 'Customers', color: 'bg-emerald-500', count: users.filter((u) => u.role === 'Customer').length },
    { role: 'Administrators', color: 'bg-purple-500', count: users.filter((u) => u.role === 'Administrator' || u.role === 'admin').length },
    { role: 'Support Staff', color: 'bg-orange-500', count: users.filter((u) => u.role === 'Support Staff' || u.role === 'staff').length },
  ];
  const maxRole = Math.max(...roleStats.map((r) => r.count), 1);

  const stats = [
    {
      title: 'Total Users',
      value: loading ? '...' : totalUsers.toLocaleString(),
      
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: loading ? '...' : activeUsers.toLocaleString(),
      
      icon: UserCheck,
      color: 'green',
    },
    {
      title: 'Locked Accounts',
      value: loading ? '...' : lockedAccounts.toLocaleString(),
    
      icon: UserX,
      color: 'red',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600">Monitor your PharmacOS system performance and user metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Overview; 