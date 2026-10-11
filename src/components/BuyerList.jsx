import React, { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './shared.css';
import './BuyerList.css';

const BuyerList = ({ buyers = [], onAddNew, onEdit, onDelete, onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNewClick = () => {
    onAddNew();
  };

  const filteredBuyers = buyers.filter(buyer =>
    (buyer.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (buyer.address?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (buyer.gstin?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (buyer.state?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="buyer-list-page">
      <header className="list-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>Buyer List</h1>
        </div>
        <button className="add-button" onClick={handleAddNewClick}>+ Add New</button>
      </header>

      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Name, Address, GSTIN, State"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="buyer-list">
        {filteredBuyers.length > 0 ? filteredBuyers.map(buyer => (
          <div key={buyer.id} className="buyer-card">
            <h2 onClick={() => onSelect(buyer)}>{buyer.companyName}</h2>
            
            <div className="buyer-card-actions">
              <button className="icon-button edit" onClick={() => onEdit(buyer)}>
                <FiEdit2 />
              </button>
              <button className="icon-button delete" onClick={() => onDelete(buyer.id)}>
                <FiTrash2 />
              </button>
            </div>

            <div className="buyer-info" onClick={() => onSelect(buyer)}>
              {buyer.address && (
                <div className="info-row">
                  <span className="label">Address</span>
                  <span className="value">{buyer.address}</span>
                </div>
              )}
              {buyer.gstin && (
                <div className="info-row">
                  <span className="label">GSTIN</span>
                  <span className="value">{buyer.gstin}</span>
                </div>
              )}
              {buyer.state && (
                <div className="info-row">
                  <span className="label">State</span>
                  <span className="value">{buyer.state}</span>
                </div>
              )}
            </div>
            </div>
        )) : (
          <div className="no-buyers-message">
            No buyers found. Add a new buyer to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerList; 