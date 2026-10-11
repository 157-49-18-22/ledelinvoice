import React, { useState, useEffect, useCallback } from 'react';
import './shared.css';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productData.name || !productData.salePrice) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(productData);
  };

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>{initialData ? 'Edit Product' : 'Add Product'}</h1>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Details
        </button>
        <button
          className={`tab ${activeTab === 'optional' ? 'active' : ''}`}
          onClick={() => setActiveTab('optional')}
        >
          Optional Details
        </button>
      </div>

      <form className="details-form" onSubmit={handleSubmit}>
        {activeTab === 'basic' && (
          <div className="basic-details">
            <div className="form-group">
              <label htmlFor="name">
                Item Name
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="form-group">
              <label>Item Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="goods"
                    checked={productData.type === 'goods'}
                    onChange={handleChange}
                  />
                  <span>Goods</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="services"
                    checked={productData.type === 'services'}
                    onChange={handleChange}
                  />
                  <span>Services</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hsn">HSN/SAC</label>
              <input
                type="text"
                id="hsn"
                name="hsn"
                value={productData.hsn}
                onChange={handleChange}
                placeholder="Enter HSN/SAC code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salePrice">
                Sale Price
                <span className="required">*</span>
              </label>
              <input
                type="number"
                id="salePrice"
                name="salePrice"
                value={productData.salePrice}
                onChange={handleChange}
                placeholder="Enter sale price"
                required
              />
            </div>

            <div className="price-calculations">
              <h3>Price Breakdown</h3>
              <div className="calc-row">
                <span>Base Price:</span>
                <span className="amount">₹{parseFloat(productData.salePrice || 0).toFixed(2)}</span>
              </div>
              <div className="calc-row">
                <span>GST ({productData.gst}%):</span>
                <span className="amount">₹{((parseFloat(productData.salePrice || 0) * parseFloat(productData.gst || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="calc-row">
                <span>CESS ({productData.cess}%):</span>
                <span className="amount">₹{((parseFloat(productData.salePrice || 0) * parseFloat(productData.cess || 0)) / 100).toFixed(2)}</span>
              </div>
              <div className="calc-row total">
                <span>Final Amount:</span>
                <span className="amount">₹{(
                  parseFloat(productData.salePrice || 0) + 
                  (parseFloat(productData.salePrice || 0) * parseFloat(productData.gst || 0)) / 100 +
                  (parseFloat(productData.salePrice || 0) * parseFloat(productData.cess || 0)) / 100
                ).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={productData.unit}
                onChange={handleChange}
              >
                <option value="">Select Unit</option>
                <option value="pcs">PCS</option>
                <option value="kg">KG</option>
                <option value="g">G</option>
                <option value="l">L</option>
                <option value="ml">ML</option>
              </select>
            </div>

            <div className="tax-type">
              <div className="toggle-switch">
                <span className={productData.taxType === 'inclusive' ? 'active' : ''}>Tax Inclusive</span>
                <div 
                  className={`toggle-track ${productData.taxType === 'exclusive' ? 'active' : ''}`}
                  onClick={() => handleChange({ target: { name: 'taxType', value: productData.taxType === 'inclusive' ? 'exclusive' : 'inclusive' } })}
                >
                  <div className="toggle-thumb" />
                </div>
                <span className={productData.taxType === 'exclusive' ? 'active' : ''}>Tax Exclusive</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>GST (%)</label>
                <select
                  name="gst"
                  value={productData.gst}
                  onChange={handleChange}
                >
                  <option value="0">GST @ 0</option>
                  <option value="5">GST @ 5%</option>
                  <option value="12">GST @ 12%</option>
                  <option value="18">GST @ 18%</option>
                  <option value="28">GST @ 28%</option>
                </select>
              </div>
              <div className="form-group">
                <label>CESS</label>
                <select
                  name="cess"
                  value={productData.cess}
                  onChange={handleChange}
                >
                  <option value="0">(% Percent wise)</option>
                  <option value="1">1%</option>
                  <option value="2">2%</option>
                  <option value="5">5%</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optional' && (
          <div className="optional-details">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purchasePrice">Purchase Price</label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={productData.purchasePrice}
                  onChange={handleChange}
                  placeholder="Enter purchase price"
                />
              </div>
              <div className="form-group">
                <label htmlFor="wholesalePrice">Wholesale Price</label>
                <input
                  type="number"
                  id="wholesalePrice"
                  name="wholesalePrice"
                  value={productData.wholesalePrice}
                  onChange={handleChange}
                  placeholder="Enter wholesale price"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="minWholesaleQty">Minimum Wholesale Quantity</label>
              <input
                type="number"
                id="minWholesaleQty"
                name="minWholesaleQty"
                value={productData.minWholesaleQty}
                onChange={handleChange}
                placeholder="Enter minimum wholesale quantity"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="maintainStock"
                  checked={productData.maintainStock}
                  onChange={handleChange}
                />
                <span>Maintain Stock</span>
              </label>
            </div>

            {productData.maintainStock && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="openingStock">Opening Stock</label>
                    <input
                      type="number"
                      id="openingStock"
                      name="openingStock"
                      value={productData.openingStock}
                      onChange={handleChange}
                      placeholder="Enter opening stock"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="openingStockUnit">Unit</label>
                    <select
                      id="openingStockUnit"
                      name="openingStockUnit"
                      value={productData.openingStockUnit}
                      onChange={handleChange}
                    >
                      <option value="">Select Unit</option>
                      <option value="pcs">PCS</option>
                      <option value="kg">KG</option>
                      <option value="g">G</option>
                      <option value="l">L</option>
                      <option value="ml">ML</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="openingStockDate">As of Date</label>
                  <input
                    type="date"
                    id="openingStockDate"
                    name="openingStockDate"
                    value={productData.openingStockDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lowStockAlert">Low Stock Alert</label>
                  <input
                    type="number"
                    id="lowStockAlert"
                    name="lowStockAlert"
                    value={productData.lowStockAlert}
                    onChange={handleChange}
                    placeholder="Enter low stock alert quantity"
                  />
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="barcode">Barcode</label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={productData.barcode}
                  onChange={handleChange}
                  placeholder="Enter barcode"
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemCode">Item Code</label>
                <input
                  type="text"
                  id="itemCode"
                  name="itemCode"
                  value={productData.itemCode}
                  onChange={handleChange}
                  placeholder="Enter item code"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      <button className="save-button-bottom" onClick={handleSubmit}>
        SAVE
      </button>
    </div>
  );
};

export default ProductDetails; 