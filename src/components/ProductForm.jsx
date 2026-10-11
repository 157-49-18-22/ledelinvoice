import React, { useState } from 'react';
import './ProductForm.css';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    type: 'Goods',
    description: '',
    hsnSac: '',
    salePrice: '',
    unit: '',
    gstRate: '0',
    cessRate: '0'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate amounts
  const salePrice = parseFloat(formData.salePrice) || 0;
  const gstRate = parseFloat(formData.gstRate) || 0;
  const cessRate = parseFloat(formData.cessRate) || 0;
  const gstAmount = (salePrice * gstRate) / 100;
  const cessAmount = (salePrice * cessRate) / 100;
  const totalAmount = salePrice + gstAmount + cessAmount;

  return (
    <form className="product-form">
      <div className="form-section">
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="type"
              value="Goods"
              checked={formData.type === 'Goods'}
              onChange={handleInputChange}
            />
            Goods
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="Services"
              checked={formData.type === 'Services'}
              onChange={handleInputChange}
            />
            Services
          </label>
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter description"
          />
        </div>

        <div className="input-group">
          <label>HSN/SAC</label>
          <input
            type="text"
            name="hsnSac"
            value={formData.hsnSac}
            onChange={handleInputChange}
            placeholder="Enter HSN/SAC code"
          />
        </div>

        <div className="input-group">
          <label>Sale Price *</label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleInputChange}
            placeholder="Enter sale price"
            required
          />
        </div>

        <div className="input-group">
          <label>Unit</label>
          <select name="unit" value={formData.unit} onChange={handleInputChange}>
            <option value="">Select Unit</option>
            <option value="PCS">PCS</option>
            <option value="KG">KG</option>
            <option value="LTR">LTR</option>
          </select>
        </div>

        <div className="tax-section">
          <div className="input-group">
            <label>GST Rate (%)</label>
            <select name="gstRate" value={formData.gstRate} onChange={handleInputChange}>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>

          <div className="input-group">
            <label>CESS Rate (%)</label>
            <select name="cessRate" value={formData.cessRate} onChange={handleInputChange}>
              <option value="0">0%</option>
              <option value="1">1%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
            </select>
          </div>
        </div>

        {/* Calculations Display Section */}
        <div className="calculations-box">
          <h3>Price Breakdown</h3>
          <div className="calc-row">
            <span>Base Price:</span>
            <span>₹{salePrice.toFixed(2)}</span>
          </div>
          <div className="calc-row">
            <span>GST ({gstRate}%):</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="calc-row">
            <span>CESS ({cessRate}%):</span>
            <span>₹{cessAmount.toFixed(2)}</span>
          </div>
          <div className="calc-row total">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button type="submit" className="submit-btn">Save</button>
    </form>
  );
};

export default ProductForm; 