import React, { useState } from 'react';
import './OtherDetails.css';

const OtherDetails = ({ onClose, onSave, initialData }) => {
  const [otherData, setOtherData] = useState({
    poNumber: initialData?.poNumber || '',
    poDate: initialData?.poDate || '',
    challanNumber: initialData?.challanNumber || '',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    ewayBillNumber: initialData?.ewayBillNumber || '',
    paymentTerms: initialData?.paymentTerms || '',
    termsOfDelivery: initialData?.termsOfDelivery || '',
    salesPerson: initialData?.salesPerson || '',
    reverseCharge: initialData?.reverseCharge || false,
    tcsEnabled: initialData?.tcsEnabled || false,
    tcsAmount: initialData?.tcsAmount || '',
    taxPreference: initialData?.taxPreference || 'tax-exclusive',
    freightCharge: {
      taxableAmount: initialData?.freightCharge?.taxableAmount || '',
      gst: initialData?.freightCharge?.gst || '',
      finalAmount: initialData?.freightCharge?.finalAmount || ''
    },
    insuranceCharge: {
      taxableAmount: initialData?.insuranceCharge?.taxableAmount || '',
      gst: initialData?.insuranceCharge?.gst || '',
      finalAmount: initialData?.insuranceCharge?.finalAmount || ''
    },
    loadingCharge: {
      taxableAmount: initialData?.loadingCharge?.taxableAmount || '',
      gst: initialData?.loadingCharge?.gst || '',
      finalAmount: initialData?.loadingCharge?.finalAmount || ''
    },
    packagingCharge: {
      taxableAmount: initialData?.packagingCharge?.taxableAmount || '',
      gst: initialData?.packagingCharge?.gst || '',
      finalAmount: initialData?.packagingCharge?.finalAmount || ''
    },
    otherCharge: {
      name: initialData?.otherCharge?.name || '',
      taxableAmount: initialData?.otherCharge?.taxableAmount || '',
      gst: initialData?.otherCharge?.gst || '',
      finalAmount: initialData?.otherCharge?.finalAmount || ''
    },
    optionalField1: initialData?.optionalField1 || '',
    optionalValue1: initialData?.optionalValue1 || '',
    optionalField2: initialData?.optionalField2 || '',
    optionalValue2: initialData?.optionalValue2 || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setOtherData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setOtherData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSave(otherData);
  };

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button type="button" className="back-button" onClick={onClose} aria-label="Go Back">←</button>
          <h1>Other Details</h1>
        </div>
      </header>

      <form className="other-details-form" onSubmit={handleSubmit}>
        {/* Order & Transport Info Grid */}
        <div className="section-heading">Order & Document Details</div>
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="poNumber">Customer PO Number</label>
            <input
              type="text"
              id="poNumber"
              name="poNumber"
              value={otherData.poNumber}
              onChange={handleChange}
              placeholder="e.g. Verbal / PO-9842"
            />
          </div>

          <div className="form-field">
            <label htmlFor="poDate">Customer PO Date</label>
            <input
              type="date"
              id="poDate"
              name="poDate"
              value={otherData.poDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="challanNumber">Challan Number</label>
            <input
              type="text"
              id="challanNumber"
              name="challanNumber"
              value={otherData.challanNumber}
              onChange={handleChange}
              placeholder="Enter Challan Number"
            />
          </div>

          <div className="form-field">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={otherData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ewayBillNumber">e-Way Bill Number</label>
            <input
              type="text"
              id="ewayBillNumber"
              name="ewayBillNumber"
              value={otherData.ewayBillNumber}
              onChange={handleChange}
              placeholder="Enter e-Way Bill Number"
            />
          </div>

          <div className="form-field">
            <label htmlFor="salesPerson">Sales Person</label>
            <input
              type="text"
              id="salesPerson"
              name="salesPerson"
              value={otherData.salesPerson}
              onChange={handleChange}
              placeholder="Sales Person Name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="paymentTerms">Payment Terms</label>
            <input
              type="text"
              id="paymentTerms"
              name="paymentTerms"
              value={otherData.paymentTerms}
              onChange={handleChange}
              placeholder="e.g. 100% against PI / Net 30 days"
            />
          </div>

          <div className="form-field">
            <label htmlFor="termsOfDelivery">Terms of Delivery</label>
            <input
              type="text"
              id="termsOfDelivery"
              name="termsOfDelivery"
              value={otherData.termsOfDelivery}
              onChange={handleChange}
              placeholder="e.g. Door Delivery / Ex-Works"
            />
          </div>
        </div>

        {/* Taxes & Preferences */}
        <div className="section-heading">Taxes & Preferences</div>

        <label className="checkbox-card">
          <input
            type="checkbox"
            id="reverseCharge"
            name="reverseCharge"
            checked={Boolean(otherData.reverseCharge)}
            onChange={handleChange}
          />
          <span>Applicable for Reverse Charge</span>
        </label>

        <label className="checkbox-card">
          <input
            type="checkbox"
            id="tcsEnabled"
            name="tcsEnabled"
            checked={Boolean(otherData.tcsEnabled)}
            onChange={handleChange}
          />
          <span>Enable TCS (Tax Collected at Source)</span>
        </label>

        {otherData.tcsEnabled && (
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="tcsAmount">TCS Amount (₹)</label>
            <input
              type="text"
              id="tcsAmount"
              name="tcsAmount"
              value={otherData.tcsAmount}
              onChange={handleChange}
              placeholder="Enter TCS Amount"
            />
          </div>
        )}

        <div className="form-field" style={{ marginTop: '12px' }}>
          <label>Tax Preference</label>
          <div className="tax-preference-container">
            <label className={`radio-pill ${otherData.taxPreference === 'tax-exclusive' ? 'active' : ''}`}>
              <input
                type="radio"
                name="taxPreference"
                value="tax-exclusive"
                checked={otherData.taxPreference === 'tax-exclusive'}
                onChange={handleChange}
              />
              <span>Tax Exclusive</span>
            </label>
            <label className={`radio-pill ${otherData.taxPreference === 'tax-inclusive' ? 'active' : ''}`}>
              <input
                type="radio"
                name="taxPreference"
                value="tax-inclusive"
                checked={otherData.taxPreference === 'tax-inclusive'}
                onChange={handleChange}
              />
              <span>Tax Inclusive</span>
            </label>
            <label className={`radio-pill ${otherData.taxPreference === 'no-gst' ? 'active' : ''}`}>
              <input
                type="radio"
                name="taxPreference"
                value="no-gst"
                checked={otherData.taxPreference === 'no-gst'}
                onChange={handleChange}
              />
              <span>No GST</span>
            </label>
          </div>
        </div>

        {/* Additional Charges Section */}
        <div className="section-heading">Additional Charges</div>

        <div className="charge-card">
          <div className="charge-card-title">Freight Charge</div>
          <div className="charge-inputs-row">
            <input
              type="text"
              name="freightCharge.taxableAmount"
              value={otherData.freightCharge.taxableAmount}
              onChange={handleChange}
              placeholder="Taxable Amount"
            />
            <input
              type="text"
              name="freightCharge.gst"
              value={otherData.freightCharge.gst}
              onChange={handleChange}
              placeholder="GST %"
            />
            <input
              type="text"
              name="freightCharge.finalAmount"
              value={otherData.freightCharge.finalAmount}
              onChange={handleChange}
              placeholder="Final Amount"
            />
          </div>
        </div>

        <div className="charge-card">
          <div className="charge-card-title">Insurance Charge</div>
          <div className="charge-inputs-row">
            <input
              type="text"
              name="insuranceCharge.taxableAmount"
              value={otherData.insuranceCharge.taxableAmount}
              onChange={handleChange}
              placeholder="Taxable Amount"
            />
            <input
              type="text"
              name="insuranceCharge.gst"
              value={otherData.insuranceCharge.gst}
              onChange={handleChange}
              placeholder="GST %"
            />
            <input
              type="text"
              name="insuranceCharge.finalAmount"
              value={otherData.insuranceCharge.finalAmount}
              onChange={handleChange}
              placeholder="Final Amount"
            />
          </div>
        </div>

        <div className="charge-card">
          <div className="charge-card-title">Loading Charge</div>
          <div className="charge-inputs-row">
            <input
              type="text"
              name="loadingCharge.taxableAmount"
              value={otherData.loadingCharge.taxableAmount}
              onChange={handleChange}
              placeholder="Taxable Amount"
            />
            <input
              type="text"
              name="loadingCharge.gst"
              value={otherData.loadingCharge.gst}
              onChange={handleChange}
              placeholder="GST %"
            />
            <input
              type="text"
              name="loadingCharge.finalAmount"
              value={otherData.loadingCharge.finalAmount}
              onChange={handleChange}
              placeholder="Final Amount"
            />
          </div>
        </div>

        <div className="charge-card">
          <div className="charge-card-title">Packaging Charge</div>
          <div className="charge-inputs-row">
            <input
              type="text"
              name="packagingCharge.taxableAmount"
              value={otherData.packagingCharge.taxableAmount}
              onChange={handleChange}
              placeholder="Taxable Amount"
            />
            <input
              type="text"
              name="packagingCharge.gst"
              value={otherData.packagingCharge.gst}
              onChange={handleChange}
              placeholder="GST %"
            />
            <input
              type="text"
              name="packagingCharge.finalAmount"
              value={otherData.packagingCharge.finalAmount}
              onChange={handleChange}
              placeholder="Final Amount"
            />
          </div>
        </div>

        <div className="charge-card">
          <div className="charge-card-title">Other Charge</div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="otherCharge.name"
              value={otherData.otherCharge.name}
              onChange={handleChange}
              placeholder="Charge Name (e.g. Handling Charge)"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div className="charge-inputs-row">
            <input
              type="text"
              name="otherCharge.taxableAmount"
              value={otherData.otherCharge.taxableAmount}
              onChange={handleChange}
              placeholder="Taxable Amount"
            />
            <input
              type="text"
              name="otherCharge.gst"
              value={otherData.otherCharge.gst}
              onChange={handleChange}
              placeholder="GST %"
            />
            <input
              type="text"
              name="otherCharge.finalAmount"
              value={otherData.otherCharge.finalAmount}
              onChange={handleChange}
              placeholder="Final Amount"
            />
          </div>
        </div>

        {/* Optional Custom Details */}
        <div className="section-heading">Custom Optional Details</div>
        <div className="optional-grid">
          <input
            type="text"
            name="optionalField1"
            value={otherData.optionalField1}
            onChange={handleChange}
            placeholder="Field Label 1 (e.g. Project Code)"
          />
          <input
            type="text"
            name="optionalValue1"
            value={otherData.optionalValue1}
            onChange={handleChange}
            placeholder="Field Value 1"
          />
        </div>
        <div className="optional-grid">
          <input
            type="text"
            name="optionalField2"
            value={otherData.optionalField2}
            onChange={handleChange}
            placeholder="Field Label 2 (e.g. Reference No)"
          />
          <input
            type="text"
            name="optionalValue2"
            value={otherData.optionalValue2}
            onChange={handleChange}
            placeholder="Field Value 2"
          />
        </div>
      </form>

      {/* Bottom Save Bar */}
      <div className="fixed-save-bar">
        <button type="button" className="save-action-btn" onClick={handleSubmit}>
          Save Other Details
        </button>
      </div>
    </div>
  );
};

export default OtherDetails;
