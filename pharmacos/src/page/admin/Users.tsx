import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import UserTable from './UserTable';
import AddStaffModal from './AddStaffModal';
import axios from 'axios';

const API_URL = 'http://localhost:10000/api/admin/accounts';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Users: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingChange, setPendingChange] = useState(null);

  useEffect(() => {
    axios
      .get(API_URL, { headers: getAuthHeader() })
      .then((response) => setUsers(response.data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const handleStatusChange = (id, value) => {
    setPendingChange({ id, value });
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;
    const { id, value } = pendingChange;
    try {
      await axios.patch(
        `http://localhost:10000/api/admin/users/${id}/status`,
        { status: value },
        { headers: getAuthHeader() }
      );
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, status: value } : user))
      );
      toast({ title: 'Success', description: 'Status updated successfully!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Error updating user', variant: 'destructive' });
      console.error(err);
    } finally {
      setPendingChange(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast({ title: 'Success', description: 'User deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Error deleting user', variant: 'destructive' });
      console.error('Error deleting user:', error);
    }
  };

  const handleAddUser = async (newUser) => {
    const { username, email, password, confirmPassword, name } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username || !email || !password || !confirmPassword || !name) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return false;
    }
    if (!emailRegex.test(email)) {
      toast({ title: 'Error', description: 'Please enter a valid email address.', variant: 'destructive' });
      return false;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return false;
    }
    try {
      const response = await axios.post(
        'http://localhost:10000/api/admin/staff',
        { username, email, password, name },
        { headers: getAuthHeader() }
      );
      setUsers((prev) => [...prev, response.data.staff]);
      toast({ title: 'Success', description: 'Staff added successfully!' });
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Error adding staff', variant: 'destructive' });
      console.error('Error adding staff:', error);
      return false;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
        <p className="text-gray-600">Manage PharmacOS employees and customer accounts</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Staff</span>
            </button>
          </div>
        </div>
        <UserTable
          users={users}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onDeleteUser={handleDeleteUser}
        />
      </div>
      <AddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddUser={handleAddUser}
      />
      {/* Confirm Status Change Dialog */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Confirm Status Change</h2>
            <p className="mb-4">Are you sure you want to change this user's status?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setPendingChange(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={confirmStatusChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 