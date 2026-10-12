import React, { useState, useEffect, useCallback } from 'react';
import './ProductDetails.css';

const ProductDetails = ({ onClose, onSave, initialData = null }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const getInitialState = useCallback(() => {
    const defaults = {
      id: null,
      name: '',
      type: 'goods',
      description: '',
      hsn: '',
      salePrice: '',
      unit: '',
      taxType: 'inclusive',
      gst: '0',
      cess: '0',
      purchasePrice: '',
      wholesalePrice: '',
      minWholesaleQty: '',
      maintainStock: false,
      openingStock: '',
      openingStockUnit: '',
      openingStockDate: new Date().toISOString().split('T')[0],
      lowStockAlert: '',
      barcode: '',
      itemCode: ''
    };
    if (initialData) {
      return {
        ...defaults,
        ...initialData,
        openingStockDate: initialData.openingStockDate 
          ? new Date(initialData.openingStockDate).toISOString().split('T')[0] 
          : defaults.openingStockDate
      };
    } 
    return defaults;
  }, [initialData]);

  const [productData, setProductData] = useState(getInitialState);

  useEffect(() => {
    setProductData(getInitialState());
  }, [initialData, getInitialState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeSelect = (typeVal) => {
    setProductData(prev => ({ ...prev, type: typeVal }));
  };

  const handleTaxTypeSelect = (taxTypeVal) => {
    setProductData(prev => ({ ...prev, taxType: taxTypeVal }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!productData.name || !productData.salePrice) {
      alert('Please fill in all required fields (Item Name and Sale Price)');
      return;
    }
    onSave(productData);
  };

  const basePriceNum = parseFloat(productData.salePrice || 0);
  const gstRateNum = parseFloat(productData.gst || 0);
  const cessRateNum = parseFloat(productData.cess || 0);
  const gstAmount = (basePriceNum * gstRateNum) / 100;
  const cessAmount = (basePriceNum * cessRateNum) / 100;
  const finalAmount = basePriceNum + gstAmount + cessAmount;

  return (
    <div className="product-details-container">
      {/* Top Header */}
      <header className="product-header">
        <button className="product-back-btn" onClick={onClose} type="button" title="Back">
          ←
        </button>
        <h1>{initialData ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h1>
      </header>

      {/* Main Content Area */}
      <div className="product-form-wrapper">
        {/* Navigation Tabs */}
        <div className="product-nav-tabs">
          <button
            type="button"
            className={`product-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Details
          </button>
          <button
            type="button"
            className={`product-tab-btn ${activeTab === 'optional' ? 'active' : ''}`}
            onClick={() => setActiveTab('optional')}
          >
            Optional Details
          </button>
        </div>

        <form className="product-inner-form" onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="tab-pane-content">
              {/* Item Name */}
              <div className="field-block">
                <label htmlFor="name" className="field-label">
                  Item Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="field-input"
                  value={productData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* Item Type (Goods / Services) as modern selectable cards */}
              <div className="field-block">
                <label className="field-label">Item Type</label>
                <div className="type-pills-group">
                  <div
                    className={`type-card-pill ${productData.type === 'goods' ? 'active' : ''}`}
                    onClick={() => handleTypeSelect('goods')}
                  >
                    <span className="pill-radio-indicator"></span>
                    <span className="pill-icon">📦</span>
                    <span className="pill-label">Goods</span>
                  </div>
                  <div
                    className={`type-card-pill ${productData.type === 'services' ? 'active' : ''}`}
                    onClick={() => handleTypeSelect('services')}
                  >
                    <span className="pill-radio-indicator"></span>
                    <span className="pill-icon">🛠️</span>
                    <span className="pill-label">Services</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="field-block">
                <label htmlFor="description" className="field-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="field-textarea"
                  value={productData.description}
                  onChange={handleChange}
                  placeholder="Enter item description or specifications..."
                  rows="3"
                />
              </div>

              {/* HSN & Sale Price Row */}
              <div className="fields-grid-2">
                <div className="field-block">
                  <label htmlFor="hsn" className="field-label">HSN/SAC Code</label>
                  <input
                    type="text"
                    id="hsn"
                    name="hsn"
                    className="field-input"
                    value={productData.hsn}
                    onChange={handleChange}
                    placeholder="Enter HSN/SAC code"
                  />
                </div>
                <div className="field-block">
                  <label htmlFor="salePrice" className="field-label">
                    Sale Price (₹) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    id="salePrice"
                    name="salePrice"
                    className="field-input price-input"
                    value={productData.salePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Price Calculations Card */}
              {basePriceNum > 0 && (
                <div className="price-breakdown-card">
                  <div className="breakdown-header">Price Calculation Breakdown</div>
                  <div className="breakdown-grid">
                    <div className="breakdown-item">
                      <span className="b-label">Base Price:</span>
                      <span className="b-val">₹{basePriceNum.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="b-label">GST ({productData.gst}%):</span>
                      <span className="b-val">₹{gstAmount.toFixed(2)}</span>
                    </div>
                    {cessRateNum > 0 && (
                      <div className="breakdown-item">
                        <span className="b-label">CESS ({productData.cess}%):</span>
                        <span className="b-val">₹{cessAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="breakdown-item final-item">
                      <span className="b-label">Final Amount:</span>
                      <span className="b-val total-price">₹{finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unit Dropdown */}
              <div className="field-block">
                <label htmlFor="unit" className="field-label">Unit of Measurement</label>
                <select
                  id="unit"
                  name="unit"
                  className="field-select"
                  value={productData.unit}
                  onChange={handleChange}
                >
                  <option value="">Select Unit</option>
                  <option value="pcs">PCS (Pieces)</option>
                  <option value="nos">NOS (Numbers)</option>
                  <option value="kg">KG (Kilograms)</option>
                  <option value="g">G (Grams)</option>
                  <option value="mtr">MTR (Meters)</option>
                  <option value="l">L (Liters)</option>
                  <option value="ml">ML (Milliliters)</option>
                  <option value="box">BOX (Boxes)</option>
                  <option value="set">SET (Sets)</option>
                  <option value="sqft">SQFT (Square Feet)</option>
                </select>
              </div>

              {/* Tax Type Segmented Toggle */}
              <div className="field-block">
                <label className="field-label">Tax Preference</label>
                <div className="tax-preference-tabs">
                  <button
                    type="button"
                    className={`tax-pref-btn ${productData.taxType === 'inclusive' ? 'active' : ''}`}
                    onClick={() => handleTaxTypeSelect('inclusive')}
                  >
                    Tax Inclusive
                  </button>
                  <button
                    type="button"
                    className={`tax-pref-btn ${productData.taxType === 'exclusive' ? 'active' : ''}`}
                    onClick={() => handleTaxTypeSelect('exclusive')}
                  >
                    Tax Exclusive
                  </button>
                </div>
              </div>

              {/* GST & CESS Row */}
              <div className="fields-grid-2">
                <div className="field-block">
                  <label htmlFor="gst" className="field-label">GST Rate</label>
                  <select
                    id="gst"
                    name="gst"
                    className="field-select"
                    value={productData.gst}
                    onChange={handleChange}
                  >
                    <option value="0">GST @ 0% (Exempt)</option>
                    <option value="5">GST @ 5%</option>
                    <option value="12">GST @ 12%</option>
                    <option value="18">GST @ 18%</option>
                    <option value="28">GST @ 28%</option>
                  </select>
                </div>
                <div className="field-block">
                  <label htmlFor="cess" className="field-label">CESS (%)</label>
                  <select
                    id="cess"
                    name="cess"
                    className="field-select"
                    value={productData.cess}
                    onChange={handleChange}
                  >
                    <option value="0">0% (None)</option>
                    <option value="1">1%</option>
                    <option value="2">2%</option>
                    <option value="5">5%</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'optional' && (
            <div className="tab-pane-content">
              {/* Purchase & Wholesale Price */}
              <div className="fields-grid-2">
                <div className="field-block">
                  <label htmlFor="purchasePrice" className="field-label">Purchase Price (₹)</label>
                  <input
                    type="number"
                    id="purchasePrice"
                    name="purchasePrice"
                    className="field-input"
                    value={productData.purchasePrice}
                    onChange={handleChange}
                    placeholder="Enter purchase price"
                  />
                </div>
                <div className="field-block">
                  <label htmlFor="wholesalePrice" className="field-label">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    id="wholesalePrice"
                    name="wholesalePrice"
                    className="field-input"
                    value={productData.wholesalePrice}
                    onChange={handleChange}
                    placeholder="Enter wholesale price"
                  />
                </div>
              </div>

              {/* Minimum Wholesale Qty */}
              <div className="field-block">
                <label htmlFor="minWholesaleQty" className="field-label">Minimum Wholesale Quantity</label>
                <input
                  type="number"
                  id="minWholesaleQty"
                  name="minWholesaleQty"
                  className="field-input"
                  value={productData.minWholesaleQty}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                />
              </div>

              {/* Maintain Stock Switch Card */}
              <div className="stock-toggle-card">
                <label className="stock-checkbox-label">
                  <input
                    type="checkbox"
                    name="maintainStock"
                    checked={productData.maintainStock}
                    onChange={handleChange}
                  />
                  <div className="stock-text">
                    <span className="stock-title">Maintain Stock / Inventory</span>
                    <span className="stock-desc">Track opening stock, balance and low stock alerts</span>
                  </div>
                </label>
              </div>

              {productData.maintainStock && (
                <div className="stock-details-section">
                  <div className="fields-grid-2">
                    <div className="field-block">
                      <label htmlFor="openingStock" className="field-label">Opening Stock Quantity</label>
                      <input
                        type="number"
                        id="openingStock"
                        name="openingStock"
                        className="field-input"
                        value={productData.openingStock}
                        onChange={handleChange}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div className="field-block">
                      <label htmlFor="openingStockUnit" className="field-label">Stock Unit</label>
                      <select
                        id="openingStockUnit"
                        name="openingStockUnit"
                        className="field-select"
                        value={productData.openingStockUnit}
                        onChange={handleChange}
                      >
                        <option value="">Select Unit</option>
                        <option value="pcs">PCS</option>
                        <option value="kg">KG</option>
                        <option value="g">G</option>
                        <option value="l">L</option>
                        <option value="ml">ML</option>
                        <option value="box">BOX</option>
                      </select>
                    </div>
                  </div>

                  <div className="fields-grid-2">
                    <div className="field-block">
                      <label htmlFor="openingStockDate" className="field-label">As of Date</label>
                      <input
                        type="date"
                        id="openingStockDate"
                        name="openingStockDate"
                        className="field-input"
                        value={productData.openingStockDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field-block">
                      <label htmlFor="lowStockAlert" className="field-label">Low Stock Alert Qty</label>
                      <input
                        type="number"
                        id="lowStockAlert"
                        name="lowStockAlert"
                        className="field-input"
                        value={productData.lowStockAlert}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Barcode & Item Code */}
              <div className="fields-grid-2">
                <div className="field-block">
                  <label htmlFor="barcode" className="field-label">Barcode</label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    className="field-input"
                    value={productData.barcode}
                    onChange={handleChange}
                    placeholder="Enter barcode"
                  />
                </div>
                <div className="field-block">
                  <label htmlFor="itemCode" className="field-label">Item Code / SKU</label>
                  <input
                    type="text"
                    id="itemCode"
                    name="itemCode"
                    className="field-input"
                    value={productData.itemCode}
                    onChange={handleChange}
                    placeholder="Enter item code / SKU"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className="product-bottom-bar">
        <button className="product-save-action-btn" type="button" onClick={handleSubmit}>
          Save Product
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;