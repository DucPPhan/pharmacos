import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

const   API_URL = "http://localhost:10000/api/admin/accounts";

// Helper to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingChange, setPendingChange] = useState(null);
  const [detailsUserId, setDetailsUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [confirmEditData, setConfirmEditData] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "staff",
  });

  useEffect(() => {
    axios
      .get(API_URL, { headers: getAuthHeader() })
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmChange = async () => {
    if (!pendingChange) return;
    const { id, field, value } = pendingChange;

    try {
      if (field === "status") {
        await axios.patch(
          `http://localhost:10000/api/admin/users/${id}/status`,
          { status: value },
          { headers: getAuthHeader() }
        );

        setUsers((prev) =>
          prev.map((user) =>
            user._id === id ? { ...user, status: value } : user
          )
        );

        toast.success("Status updated successfully!");
      } else {
        const user = users.find((u) => u._id === id);
        if (!user) return;

        const updatedUser = { ...user, [field]: value };
        await axios.put(`${API_URL}/${id}`, updatedUser, {
          headers: getAuthHeader(),
        });

        setUsers((prev) =>
          prev.map((u) => (u._id === id ? updatedUser : u))
        );

        toast.success(`${field} updated successfully!`);
      }
    } catch (err) {
      toast.error("Error updating user");
      console.error(err);
    } finally {
      setPendingChange(null);
    }
  };

  const saveEditDialog = () => {
    if (!editingUserId) return;
    const originalUser = users.find((u) => u._id === editingUserId);
    if (!originalUser) return;

    if (
      originalUser.username === editUsername &&
      originalUser.email === editEmail
    ) {
      setEditingUserId(null);
      return;
    }

    setConfirmEditData({
      id: editingUserId,
      username: editUsername,
      email: editEmail,
    });
  };

  const confirmEditSave = async () => {
    if (!confirmEditData) return;
    try {
      await axios.put(
        `${API_URL}/${confirmEditData.id}`,
        {
          ...users.find((u) => u._id === confirmEditData.id),
          username: confirmEditData.username,
          email: confirmEditData.email,
        },
        { headers: getAuthHeader() }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === confirmEditData.id
            ? {
                ...user,
                username: confirmEditData.username,
                email: confirmEditData.email,
              }
            : user
        )
      );
      toast.success("User updated successfully!");
    } catch (error) {
      toast.error("Error confirming edit");
      console.error("Error confirming edit:", error);
    } finally {
      setEditingUserId(null);
      setConfirmEditData(null);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error("Error deleting user");
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleAddUser = async () => {
    const { username, email, password, confirmPassword, name } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username || !email || !password || !confirmPassword || !name) {
      alert("Please fill in all fields.");
      return;
    }
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:10000/api/admin/staff",
        {
          username,
          email,
          password,
          name,
        },
        { headers: getAuthHeader() }
      );
      setUsers((prev) => [...prev, response.data.staff]);
      setShowAddDialog(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        role: "staff",
      });
      toast.success("Staff added successfully!");
    } catch (error) {
      toast.error("Error adding staff");
      console.error("Error adding staff:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search by username or email..."
              className="border px-3 py-1 rounded w-1/2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setShowAddDialog(true)}>Add New Staff</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={user.status}
                      onChange={(e) =>
                        setPendingChange({
                          id: user._id,
                          field: "status",
                          value: e.target.value,
                        })
                      }
                      className="bg-card border rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
      
                      <option value="locked">Lock</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Confirm Status Change Dialog */}
        <AlertDialog open={!!pendingChange} onOpenChange={() => setPendingChange(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change this user's status?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingChange(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmChange}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        {/* Add New Staff Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new staff member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewUser({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    name: "",
                    role: "staff",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default UserManagement;
