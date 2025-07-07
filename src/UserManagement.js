import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "./config";
import "./UserManagement.css"; // Include basic styles

function UserManagement() {
  const token = localStorage.getItem("jwt_token");
  const [users, setUsers] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);

  const [user, setUser] = useState({
    firstname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "",
    salesperson: "",
    customeremail:"",
  });

  // Fetch users and salespersons on load
  useEffect(() => {
    fetchUsers();
    fetchSalespersons();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Rep/GetAllUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSalespersons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Rep/GetSalesPerson`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalespersons(response.data);
    } catch (error) {
      console.error("Error fetching salespersons:", error);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleEdit = (u) => {
    setUser({
      firstname: u.firstname,
      username: u.username,
      email: u.email,
      password: "",
      confirmPassword: "",
      roles: u.roles,
      salesperson: u.salesperson || "",
      customeremail:u.customerEmail
    });
    setEditingUserId(u.id);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUser({
      firstname: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: "",
      salesperson: "",
      customeremail:"",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const url = editingUserId
      ? `${API_BASE_URL}/user/updateuser`
      : `${API_BASE_URL}/user/createuser`;

    const method =  "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname:user.firstname,
          username: user.username,
          email: user.email,
          password:"",
          roles: user.roles,
          salesperson: user.salesperson,
          customeremail:user.customeremail,
        }),
      });

     // const data = await response.json();

      if(response.status === 200)
      {
        alert("✅ User updated!");
        fetchUsers();
        handleCancelEdit();
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="user-form-wrapper">
      <h2>User Management</h2>

      {/* User Form */}
      <form className="user-form" onSubmit={handleSubmit}>
  <h3>{editingUserId ? "Edit User" : "Edit User"}</h3>
  <div className="form-group">
  <label htmlFor="firstname">Name</label>
  <input
    type="text"
    id="firstname"
    name="firstname"
    placeholder="Name"
    value={user.firstname}
    onChange={handleChange}
    required
  />
</div>
<div className="form-group">
  <label htmlFor="username">Username</label>
  <input
    type="text"
    id="username"
    name="username"
    placeholder="Username"
    value={user.username}
    onChange={handleChange}
    required
  />
</div>
<div className="form-group">
  <label htmlFor="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    placeholder="Email"
    value={user.email}
    onChange={handleChange}
    required
  />
  </div>
  <div className="form-group">

  <label htmlFor="roles">Role</label>
  <select
    id="roles"
    name="roles"
    value={user.roles}
    onChange={handleChange}
    required
  >
    <option value="">Select Role</option>
    <option value="admin">Admin</option>
    <option value="rep">Rep</option>
    <option value="repclerk">Rep Clerk</option>
  </select>
</div>
  {user.roles === "rep" && (
    <>
    <div className="form-group">
      <label htmlFor="salesperson">Salesperson</label>
      <select
        id="salesperson"
        name="salesperson"
        value={user.salesperson}
        onChange={handleChange}
        required
      >
        <option value="">Select Salesperson</option>
        {salespersons.map((sp) => (
          <option key={sp.salesperson} value={sp.salesperson}>
            {sp.name}
          </option>
        ))}
      </select>
      </div>
    </>
  )}
{user.roles === "repclerk" && (
    <div className="userform-group">
          <label>Customer Service Email(Multiple seperate by comma)</label>
          <input
            type="email"
            name="customeremail"
            value={user.customeremail}
            onChange={handleChange}
            required
          />
        </div>
)}
  <div className="form-buttons">
    <button type="submit">{editingUserId ? "Update" : "Save"}</button>
    {editingUserId && (
      <button type="button" onClick={handleCancelEdit}>
        Cancel
      </button>
    )}
  </div>
</form>


      {/* User Table */}
      <div className="user-table-container">
        <h3>User List</h3>
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Salesperson</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstname}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.roles}</td>
                <td>{u.salesperson || "-"}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>✏️ Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
