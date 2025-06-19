import React, { useState } from 'react';
import { MoreVertical, Lock, Unlock, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    Administrator: 'bg-purple-100 text-purple-800',
    Pharmacist: 'bg-blue-100 text-blue-800',
    Customer: 'bg-green-100 text-green-800',
    'Support Staff': 'bg-orange-100 text-orange-800',
    staff: 'bg-orange-100 text-orange-800',
    admin: 'bg-purple-100 text-purple-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

const PAGE_SIZE = 5;

const UserTable = ({ users, searchTerm, statusFilter, onStatusChange, onDeleteUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page về 1 khi filter/search thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, users]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Joined</th>
            <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user, index) => (
            <tr
              key={user._id}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
            >
              <td className="py-4 px-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || 'U')}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.location || 'N/A'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-900 flex items-center">
                    <Mail className="w-3 h-3 mr-2 text-gray-400" />
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Phone className="w-3 h-3 mr-2 text-gray-400" />
                    {user.phone || 'N/A'}
                  </p>
                </div>
              </td>
              <td className="py-4 px-6">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.status === 'active' ? 'Active' : 'Locked'}
                </span>
              </td>
              <td className="py-4 px-6">
                <p className="text-sm text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </td>
              <td className="py-4 px-6">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  {dropdownOpen === user._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onStatusChange(user._id, user.status === 'active' ? 'locked' : 'active');
                            setDropdownOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {user.status === 'active' ? (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Lock Account</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4" />
                              <span>Activate Account</span>
                            </>
                          )}
                        </button>
                        {/* <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          <Edit className="w-4 h-4" />
                          <span>Edit User</span>
                        </button> */}
                        <button
                          onClick={() => {
                            onDeleteUser(user._id);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete User</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserTable; 