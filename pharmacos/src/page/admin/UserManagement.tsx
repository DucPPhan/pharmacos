import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
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
      const updatedUser = users.find((user) => user._id === id);
      if (!updatedUser) return;
      const newUser = { ...updatedUser, [field]: value };

      await axios.put(`${API_URL}/${id}`, newUser, {
        headers: getAuthHeader(),
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, [field]: value } : user
        )
      );
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setPendingChange(null);
    }
  };

  const saveEditDialog = () => {
    if (!editingUserId) return;
    const originalUser = users.find((u) => u.id === editingUserId);
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
          ...users.find((u) => u.id === confirmEditData.id),
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
    } catch (error) {
      console.error("Error confirming edit:", error);
    } finally {
      setEditingUserId(null);
      setConfirmEditData(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } catch (error) {
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
        role: "user",
      });

      useEffect(() => {
        axios
          .get(API_URL)
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
          const updatedUser = users.find((user) => user.id === id);
          if (!updatedUser) return;
          const newUser = { ...updatedUser, [field]: value };

          await axios.put(`${API_URL}/${id}`, newUser);
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === id ? { ...user, [field]: value } : user
            )
          );
        } catch (error) {
          console.error("Error updating user:", error);
        } finally {
          setPendingChange(null);
        }
      };

      const saveEditDialog = () => {
        if (!editingUserId) return;
        const originalUser = users.find((u) => u.id === editingUserId);
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
          await axios.put(`${API_URL}/${confirmEditData.id}`, {
            ...users.find((u) => u.id === confirmEditData.id),
            username: confirmEditData.username,
            email: confirmEditData.email,
          });

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === confirmEditData.id
                ? {
                  ...user,
                  username: confirmEditData.username,
                  email: confirmEditData.email,
                }
                : user
            )
          );
        } catch (error) {
          console.error("Error confirming edit:", error);
        } finally {
          setEditingUserId(null);
          setConfirmEditData(null);
        }
      };

      const deleteUser = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
          try {
            await axios.delete(`${API_URL}/${id}`);
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
          } catch (error) {
            console.error("Error deleting user:", error);
          }
        }
      };

      const handleAddUser = async () => {
        const { username, email, password, confirmPassword, role } = newUser;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!username || !email || !password || !confirmPassword) {
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
          const response = await axios.post(API_URL, {
            username,
            email,
            password,
            role,
            status: "active",
          });

          setUsers((prev) => [...prev, response.data]);
          setShowAddDialog(false);
          setNewUser({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
          });
        } catch (error) {
          console.error("Error adding user:", error);
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
                <Button onClick={() => setShowAddDialog(true)}>
                  Add New Staff
                </Button>
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

            {/* All dialogs below remain unchanged except addUser dialog added below */}

            {/* Confirm role/status change */}
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
                      {users.find((u) => u.id === pendingChange?.id)?.username}
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

            {/* User details */}
            <AlertDialog
              open={!!detailsUserId}
              onOpenChange={(open) => !open && setDetailsUserId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Employee Details</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>Username:</strong>{" "}
                        {users.find((u) => u.id === detailsUserId)?.username}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {users.find((u) => u.id === detailsUserId)?.email}
                      </p>
                      <p>
                        <strong>Role:</strong>{" "}
                        {users.find((u) => u.id === detailsUserId)?.role}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {users.find((u) => u.id === detailsUserId)?.status}
                      </p>
                      <p>
                        <strong>Created At:</strong>{" "}
                        {users.find((u) => u.id === detailsUserId)?.createdAt}
                      </p>
                      <p>
                        <strong>Updated At:</strong>{" "}
                        {users.find((u) => u.id === detailsUserId)?.updatedAt}
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDetailsUserId(null)}>
                    Close
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Edit user */}
            <AlertDialog
              open={!!editingUserId}
              onOpenChange={(open) => !open && setEditingUserId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit User</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEditingUserId(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={saveEditDialog}>
                    Save
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Confirm edit */}
            <AlertDialog
              open={!!confirmEditData}
              onOpenChange={(open) => !open && setConfirmEditData(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Edit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to save the following changes?
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Username:</strong> {confirmEditData?.username}
                      </p>
                      <p>
                        <strong>Email:</strong> {confirmEditData?.email}
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmEditData(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmEditSave}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Add user dialog */}
            <AlertDialog
              open={showAddDialog}
              onOpenChange={(open) => setShowAddDialog(open)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New User</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full border rounded px-2 py-1"
                        value={newUser.username}
                        onChange={(e) =>
                          setNewUser({ ...newUser, username: e.target.value })
                        }
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full border rounded px-2 py-1"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full border rounded px-2 py-1"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                      />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full border rounded px-2 py-1"
                        value={newUser.confirmPassword}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full border rounded px-2 py-1"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleAddUser}>
                    Create
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </>
      );
    };

    export default UserManagement;