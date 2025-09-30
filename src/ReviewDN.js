import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RibbonForm.css';
import { FaUndo, FaShare } from 'react-icons/fa'; // Added reroute icon
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "./config";
import Popup from './Popup';
import { useLoader } from './LoaderContext';
import { useLocation } from 'react-router-dom';

function ReviewDN() {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const { loading, setLoading } = useLoader();

  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [showPopup, setShowPopup] = useState(false);
  const [showReroutePopup, setShowReroutePopup] = useState(false); // 🔑 reroute popup
  const [clerks, setClerks] = useState([]); // 🔑 store clerks list
  const [selectedClerk, setSelectedClerk] = useState("");

  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('jwt_token');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const salesOrder = queryParams.get('salesOrder'); 

  useEffect(() => {
    if (!token) {
      alert('Authentication Error: Token not found. Please log in again.');
      return;
    }
  }, []);
  useEffect(() => {
    if (salesOrder) {
      setDeliveryNote(salesOrder);
      handleFetch(salesOrder); // fetch data for this sales order
    }
  }, [salesOrder]);
  const handleSave = async () => {
    setSaving(true);
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/Rep/updatestatus`, {
        data: tableData
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        alert('Data updated successfully!');
        handleFetch();
      } else {
        alert('Failed to save data.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleFetch = async (note = deliveryNote) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/Rep/revieworderdetails`, {
        SalesOrderNumber: note
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        alert("No data found!");
        return;
      }

      setTableData(response.data);
    } catch (err) {
      console.error(err);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRerouteClick = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Rep/getclerks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClerks(res.data || []);
      setShowReroutePopup(true);
    } catch (err) {
      console.error("Failed to fetch clerks", err);
      alert("Failed to load clerks");
    }
  };

  const handleConfirmReroute = async () => {
    if (!selectedClerk) {
      alert("Please select a clerk to reroute!");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/Rep/reroute`, {
        deliveryNote,
        clerkId: selectedClerk
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Rerouted successfully!");
      setShowReroutePopup(false);
    } catch (err) {
      console.error("Reroute error:", err);
      alert("Failed to reroute.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetch();
    }
  };
  const isRerouteAllowed = filteredData.some(
    (item) => item.status === "RepCompleted" || item.status === "StoreInProgress"
  );
  const handleFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let filtered = tableData.filter(item =>
      Object.keys(columnFilters).every(key => {
        const filterVal = columnFilters[key]?.toLowerCase() || '';
        const itemVal = (item[key] ?? '').toString().toLowerCase();
        return itemVal.includes(filterVal);
      })
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = (a[sortConfig.key] ?? '').toString();
        const bVal = (b[sortConfig.key] ?? '').toString();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
  }, [tableData, columnFilters, sortConfig]);

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return '⬍';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const isValidateAllowed = filteredData.some(
    (item) =>
      item.status === 'ReadyToPostSyspro' ||
      item.status === 'Send Email To Customer Service' ||
      item.status === 'Completed&ReadyForValidation'
  );

  return (
    <div className="ribbon-page" onClick={() => setAdminMenuOpen(false)}>
      {isValidateAllowed && (
        <div className="ribbon-bar">
          <div className="ribbon-buttons">
            <button className="ribbon-button" onClick={handleSave}>
              <FaUndo className="icon" /> Update Status To InProgress
            </button>

            {/* 🔑 New Reroute Button */}
            {isRerouteAllowed && (
        <button className="ribbon-button" onClick={handleRerouteClick}>
          <FaShare className="icon" /> Reroute to Clerk
        </button>
      )}
          </div>
        </div>
      )}

      {/* Existing delivery note popup */}
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        onSelect={(noteNo) => {
          setDeliveryNote(noteNo);
          setTimeout(() => {
            handleFetch(noteNo);
          }, 1000);
        }}
      />

      {/* 🔑 Reroute Popup */}
      {showReroutePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Reroute to Another Clerk</h3>
            <select
              value={selectedClerk}
              onChange={(e) => setSelectedClerk(e.target.value)}
            >
              <option value="">-- Select Clerk --</option>
              {clerks.map((clerk) => (
                <option key={clerk.id} value={clerk.id}>
                  {clerk.name}
                </option>
              ))}
            </select>
            <div className="popup-actions">
              <button onClick={handleConfirmReroute}>Confirm</button>
              <button onClick={() => setShowReroutePopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="delivery-note-container">
        <label htmlFor="deliveryNote">Delivery Note</label>
        <div className="input-button-wrapper">
          <input
            type="text"
            id="deliveryNote"
            name="deliveryNote"
            placeholder="📦 Scan or enter sales order"
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            className="delivery-input"
            onKeyPress={handleKeyPress}
          />
          <Popup
  show={showPopup}
  onClose={() => setShowPopup(false)}
  onSelect={(noteNo) => {
    setDeliveryNote(noteNo);
    setTimeout(() => {
      handleFetch(noteNo); // pass the value directly
    }, 1000);
  }}
/>

          <button
  className="fetch-button"
  onClick={() => setShowPopup(true)}
  disabled={loading}
>
  🔍 Browse For Delivery Notes
</button>
        </div>
      </div>

      {loading && <p>Loading data...</p>}

      <div className="form-content">
        <table className="ortho-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Sno {renderSortArrow('sno')}</th>
              <th>Status {renderSortArrow('status')}</th>
              <th>Syspro Status {renderSortArrow('sysprostatus')}</th>
              <th>Set {renderSortArrow('setsCode')}</th>
              <th>Warehouse {renderSortArrow('mwarehouse')}</th>
              <th>Stock Code {renderSortArrow('mstockCode')}</th>
              <th>Description {renderSortArrow('mstockDes')}</th>
              <th>Qty Required {renderSortArrow('morderQty')}</th>
              <th>Qty Delivered {renderSortArrow('mshipQty')}</th>
              <th>Rep Usage Qty {renderSortArrow('repUsageQty')}</th>
              <th>Checked Return Qty {renderSortArrow('retQty')}</th>
              <th>Usage {renderSortArrow('usage')}</th>
              <th>Variance {renderSortArrow('variance')}</th>
            </tr>
            <tr>
              <th></th>
              {[
                'status', 'sysprostatus', 'setsCode', 'mwarehouse', 'mstockCode',
                'mstockDes', 'morderQty', 'mshipQty', 'repUsageQty','retQty','usage',
                'variance'
              ].map(key => (
                <th key={key}>
                  <input
                    type="text"
                    placeholder="Filter"
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.status??"not started"}</td>
                  <td>{item.orderStatus}</td>
                  <td>{item.setsCode}</td>
                  <td>{item.mwarehouse}</td>
                  <td>{item.mstockCode}</td>
                  <td>{item.mstockDes}</td>
                  <td style={{ textAlign: 'right' }}>{item.morderQty}</td>
                  <td style={{ textAlign: 'right' }}>{item.mshipQty}</td>
                  <td style={{ textAlign: 'right' }}>{item.repUsageQty}</td>
                  <td style={{ textAlign: 'right' }}>{item.retQty}</td>
                  <td style={{ textAlign: 'right' }}>{item.usage}</td>
                  <td style={{ textAlign: 'right' }}>{item.variance}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="10" style={{ textAlign: 'center' }}>No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReviewDN;
