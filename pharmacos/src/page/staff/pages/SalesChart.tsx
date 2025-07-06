import React from 'react';

interface SalesChartProps {
  data: Array<{ month: string; sales: number; orders: number }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const maxSales = Math.max(...data.map(d => d.sales));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-16 text-sm text-gray-600 font-medium">
              {item.month}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(item.sales / maxSales) * 100}%` }}
                />
              </div>
              <div className="text-right min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  ${item.sales.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {item.orders} orders
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 