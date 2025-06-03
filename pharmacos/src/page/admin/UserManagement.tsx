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

const API_URL = "http://localhost:10000/api/admin/accounts";

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
        await axios.put(
          `http://localhost:10000/api/admin/customers/${id}/status`,
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

  // other unchanged methods (edit, delete, add user)...

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
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
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
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="banned">banned</option>
                    </select>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingUserId(user._id);
                        setEditUsername(user.username);
                        setEditEmail(user.email);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDetailsUserId(user._id)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* All AlertDialogs remain unchanged */}
        {/* Replace all other dialogs as you had them before */}

        <AlertDialog
          open={!!pendingChange}
          onOpenChange={(open) => !open && setPendingChange(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change{" "}
                <strong>{pendingChange?.field}</strong> of{" "}
                <strong>
                  {users.find((u) => u._id === pendingChange?.id)?.username}
                </strong>{" "}
                to <strong>{pendingChange?.value}</strong>?
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
      </Card>

      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default UserManagement;
