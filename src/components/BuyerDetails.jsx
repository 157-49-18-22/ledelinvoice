import React, { useState, useEffect } from 'react';
import './shared.css';

const BuyerDetails = ({ onClose, onSave, onDelete, initialData = null }) => {
  const [buyerData, setBuyerData] = useState({
    id: null,
    companyName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    email: '',
    phone: '',
  });

  const isEditing = initialData && initialData.id;

  useEffect(() => {
    if (initialData) {
      setBuyerData({
        id: initialData.id || null,
        companyName: initialData.companyName || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        gstin: initialData.gstin || '',
        email: initialData.email || '',
        phone: initialData.phone || ''
      });
    } else {
      setBuyerData({
        id: null,
        companyName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gstin: '',
        email: '',
        phone: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBuyerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buyerData.companyName || !buyerData.address || !buyerData.city || !buyerData.state || !buyerData.pincode) {
      alert('Please fill in all required fields: Company Name, Address, City, State, Pincode.');
      return;
    }
    onSave(buyerData);
  };

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>{isEditing ? 'Edit Buyer' : 'Add Buyer'}</h1>
        </div>
      </header>

      <form className="details-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName" data-required="true">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={buyerData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address" data-required="true">Address</label>
          <textarea
            id="address"
            name="address"
            value={buyerData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city" data-required="true">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={buyerData.city}
              onChange={handleChange}
              placeholder="Enter city"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="state" data-required="true">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={buyerData.state}
              onChange={handleChange}
              placeholder="Enter state"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pincode" data-required="true">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={buyerData.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gstin">GSTIN</label>
            <input
              type="text"
              id="gstin"
              name="gstin"
              value={buyerData.gstin}
              onChange={handleChange}
              placeholder="Enter GSTIN"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={buyerData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={buyerData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </form>

      <button className="save-button-bottom" onClick={handleSubmit}>
        {isEditing ? 'UPDATE' : 'SAVE'}
      </button>
    </div>
  );
};

export default BuyerDetails; 