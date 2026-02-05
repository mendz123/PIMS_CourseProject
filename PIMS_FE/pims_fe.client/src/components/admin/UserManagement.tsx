import React, { useState, useEffect, useCallback } from "react";
import "./UserManagement.css";
import userService from "../../services/userService";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  joinDate: string;
  phone: string;
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    phone: "",
    role: "Student",
    status: "ACTIVE",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const usersPerPage = 5;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers(
        currentPage - 1,
        usersPerPage,
        searchTerm,
      );

      if (response.success && response.data) {
        interface UserData {
          userId: number;
          fullName?: string;
          email?: string;
          role?: string;
          status?: string;
          createdAt?: string;
          phoneNumber?: string;
          avatarUrl?: string;
        }
        const mappedUsers: User[] = response.data.items.map((user: UserData) => ({
          id: user.userId.toString(),
          name: user.fullName || "",
          email: user.email || "",
          role: user.role || "Student",
          status: (user.status || "ACTIVE").toUpperCase() as
            | "ACTIVE"
            | "INACTIVE"
            | "PENDING",
          joinDate: user.createdAt
            ? new Date(user.createdAt).toISOString().split("T")[0]
            : "",
          phone: user.phoneNumber || "",
          avatar: user.avatarUrl,
        }));
        setUsers(mappedUsers);
        setTotalCount(response.data.totalCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, usersPerPage, searchTerm]);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const startIndex =
    totalCount === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
  const endIndex =
    totalCount === 0 ? 0 : startIndex + users.length - 1;
  const currentUsers = users;
  const totalPages = Math.ceil(totalCount / usersPerPage);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";
      case "INACTIVE":
        return "status-inactive";
      case "PENDING":
        return "status-pending";
      default:
        return "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Student",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving user:", formData);
    // TODO: Implement create/update API call and refresh users list
    closeModal();
  };

  return (
    <div className="user-management-container">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#111318]">User Management</h2>
        <p className="text-[#616f89] text-sm mt-1">
          Manage all platform users, their roles and system access.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="action-buttons">
          <button className="btn-secondary">
            <span className="material-symbols-outlined">filter_list</span>
            Filters
          </button>
          <button className="btn-primary" onClick={handleAddNew}>
            <span className="material-symbols-outlined">person_add</span>
            Add New User
          </button>
        </div>
      </div>

      <div className="pagination">
        <span className="text-sm">
          Showing <span className="font-bold">{startIndex}</span> to{" "}
          <span className="font-bold">{endIndex}</span>{" "}
          of <span className="font-bold">{totalCount}</span> results
        </span>
        <div className="pagination-controls">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-[#616f89]">Loading users...</p>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#616f89]">No users found</p>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-wrapper">
                      {user.avatar ? (
                          <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="">
                            <span className="">{getInitials(user.name)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{user.name}</div>
                        <div className="text-xs text-[#616f89]">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-badge">{user.role}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-[#616f89] text-sm">
                      {user.joinDate}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg text-[#616f89] hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => handleEdit(user)}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>
                      </button>
                      <button className="p-1.5 rounded-lg text-[#616f89] hover:bg-red-50 hover:text-red-500 transition-all">
                        <span className="material-symbols-outlined text-[20px]">
                          delete_outline
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
              <button className="close-btn" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter user's email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter user's phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Subject Head">Subject Head</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as
                            | "ACTIVE"
                            | "INACTIVE"
                            | "PENDING",
                        })
                      }
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
