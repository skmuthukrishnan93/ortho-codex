import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RibbonForm.css';
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import API_BASE_URL from "./config";

function Dashboard() {
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [chartData, setChartData] = useState([]); // For GetDashboard API data
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("all"); // Default selection
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt_token');

  // Fetch Delivery Notes
  useEffect(() => {
    handleFetchDeliveryNotes();
  }, []);

  const handleFetchDeliveryNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Rep/GetDeliveryNotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        setDeliveryNotes(response.data);
      }
    } catch (err) {
      console.error("Error fetching delivery notes", err);
      setDeliveryNotes([]);
    }
  };

  // Fetch Dashboard Data (for Pie Chart)
  useEffect(() => {
    handleFetchDashboard();
  }, [period]);

  const handleFetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Rep/GetDashBoard?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Ensure data format: [{ name: "Rep Completed", value: 10 }, ...]
        const formattedData = response.data.map(item => ({
          name: item.name,
          value: item.value
        }));
        setChartData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

  return (
    <div className="ribbon-page">
      {loading && <p>Loading data...</p>}

      {/* Flex container */}
      <div className="dashboard-row">
        
        {/* Left Side - Delivery Notes Table */}
        <div className="delivery-notes-section">
          <h3>📑 Delivery Notes</h3>
          <div className="table-container">
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sales Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveryNotes.length > 0 ? (
                  deliveryNotes.map((note, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{note.salesOrder}</td>
                      <td>{note.customer}</td>
                      <td>
                      <span className={`status-badge ${(note.status ?? "notstarted")
  .toLowerCase()
  .replace(/\s+/g, "-")   // replace spaces
  .replace(/&/g, "-")     // replace &
}`}>
  {note.status ?? "not-started"}
</span>
                      </td>
                      <td>
                      <button
  className="action-btn"
  onClick={() => {
    const role = localStorage.getItem("roles"); // get role
    if (role === "repclerk") {
      navigate(`/repclerk?salesOrder=${note.salesOrder}`);
    } else if (role === "rep")  {
      navigate(`/form?salesOrder=${note.salesOrder}`);
    }
    else{
      navigate(`/ReviewDN?salesOrder=${note.salesOrder}`);
    }
  }}
>
  <FaEye /> View
</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No Delivery Notes Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Pie Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>📊 Delivery Status</h3>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="all">All</option>
              <option value="lastMonth">Last Month</option>
              <option value="last7days">Last 7 Days</option>
              <option value="currentMonth">Current Month</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
