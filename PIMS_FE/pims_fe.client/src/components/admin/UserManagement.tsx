import React, { useState } from "react";
import "./UserManagement.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
  phone: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    role: "Student",
    status: "Active",
    joinDate: "2023-09-15",
    phone: "0912345671",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "thib@gmail.com",
    role: "Teacher",
    status: "Active",
    joinDate: "2023-08-20",
    phone: "0912345672",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "vanc@gmail.com",
    role: "Student",
    status: "Inactive",
    joinDate: "2023-10-01",
    phone: "0912345673",
  },
  {
    id: "4",
    name: "Phạm Minh D",
    email: "minhd@gmail.com",
    role: "Subject Head",
    status: "Active",
    joinDate: "2023-07-12",
    phone: "0912345674",
  },
  {
    id: "5",
    name: "Hoàng Công E",
    email: "conge@gmail.com",
    role: "Student",
    status: "Pending",
    joinDate: "2024-01-05",
    phone: "0912345675",
  },
  {
    id: "6",
    name: "Vũ Thị F",
    email: "thif@gmail.com",
    role: "Student",
    status: "Active",
    joinDate: "2023-11-22",
    phone: "0912345676",
  },
  {
    id: "7",
    name: "Đặng Văn G",
    email: "vang@gmail.com",
    role: "Teacher",
    status: "Active",
    joinDate: "2023-06-30",
    phone: "0912345677",
  },
  {
    id: "8",
    name: "Bùi Minh H",
    email: "minhh@gmail.com",
    role: "Student",
    status: "Inactive",
    joinDate: "2023-09-02",
    phone: "0912345678",
  },
];

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
    status: "Active",
  });

  const usersPerPage = 5;

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Inactive":
        return "status-inactive";
      case "Pending":
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
      status: "Active",
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
    // In a real app, you would call an API here
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

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      <div className="table-container">
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
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{user.name}</div>
                      <div className="text-xs text-[#616f89]">{user.email}</div>
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
      </div>

      <div className="pagination">
        <span className="text-sm">
          Showing <span className="font-bold">{indexOfFirstUser + 1}</span> to{" "}
          <span className="font-bold">
            {Math.min(indexOfLastUser, filteredUsers.length)}
          </span>{" "}
          of <span className="font-bold">{filteredUsers.length}</span> results
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
                          status: e.target.value as any,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
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
