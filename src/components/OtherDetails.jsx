import React, { useState } from 'react';
import './shared.css';
import './OtherDetails.css';

const OtherDetails = ({ onClose, onSave, initialData }) => {
  const [otherData, setOtherData] = useState({
    poNumber: initialData?.poNumber || '',
    poDate: initialData?.poDate || '',
    challanNumber: initialData?.challanNumber || '',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    ewayBillNumber: initialData?.ewayBillNumber || '',
    salesPerson: initialData?.salesPerson || '',
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
    e.preventDefault();
    onSave(otherData);
  };

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>Other Details</h1>
        </div>
      </header>

      <form className="details-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="poNumber">PO Number</label>
          <input
            type="text"
            id="poNumber"
            name="poNumber"
            value={otherData.poNumber}
            onChange={handleChange}
            placeholder="Enter PO Number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="poDate">PO Date</label>
          <input
            type="date"
            id="poDate"
            name="poDate"
            value={otherData.poDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={otherData.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <label htmlFor="salesPerson">Sales Person</label>
          <input
            type="text"
            id="salesPerson"
            name="salesPerson"
            value={otherData.salesPerson}
            onChange={handleChange}
            placeholder="Sales Person"
          />
        </div>

        <div className="section-title">Other Charges</div>

        <div className="form-group">
          <label>Reverse Charge</label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="reverseCharge"
              name="reverseCharge"
              checked={otherData.reverseCharge}
              onChange={handleChange}
            />
            <label htmlFor="reverseCharge">
              Is this transaction applicable for reverse charge?
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>TCS (Tax Collected at Source)</label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="tcsEnabled"
              name="tcsEnabled"
              checked={otherData.tcsEnabled}
              onChange={handleChange}
            />
            <label htmlFor="tcsEnabled">TCS</label>
          </div>
          {otherData.tcsEnabled && (
            <input
              type="text"
              name="tcsAmount"
              value={otherData.tcsAmount}
              onChange={handleChange}
              placeholder="Enter TCS"
            />
          )}
        </div>

        <div className="form-group">
          <label>Tax Preference</label>
          <div className="tax-preference">
            <label>
              <input
                type="radio"
                name="taxPreference"
                value="tax-exclusive"
                checked={otherData.taxPreference === 'tax-exclusive'}
                onChange={handleChange}
              />
              Tax Exclusive
            </label>
            <label>
              <input
                type="radio"
                name="taxPreference"
                value="tax-inclusive"
                checked={otherData.taxPreference === 'tax-inclusive'}
                onChange={handleChange}
              />
              Tax Inclusive
            </label>
            <label>
              <input
                type="radio"
                name="taxPreference"
                value="no-gst"
                checked={otherData.taxPreference === 'no-gst'}
                onChange={handleChange}
              />
              No GST
            </label>
          </div>
        </div>

        <div className="charge-section">
          <div className="charge-group">
            <h3>Freight Charge</h3>
            <div className="charge-inputs">
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
                placeholder="GST"
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

          <div className="charge-group">
            <h3>Insurance Charge</h3>
            <div className="charge-inputs">
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
                placeholder="GST"
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

          <div className="charge-group">
            <h3>Loading Charge</h3>
            <div className="charge-inputs">
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
                placeholder="GST"
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

          <div className="charge-group">
            <h3>Packaging Charge</h3>
            <div className="charge-inputs">
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
                placeholder="GST"
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

          <div className="charge-group">
            <h3>Other Charge</h3>
            <input
              type="text"
              name="otherCharge.name"
              value={otherData.otherCharge.name}
              onChange={handleChange}
              placeholder="Other Charge Name"
              className="charge-name"
            />
            <div className="charge-inputs">
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
                placeholder="GST"
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
        </div>

        <div className="section-title">Optional Details</div>
        <div className="optional-fields">
          <div className="form-row">
            <input
              type="text"
              name="optionalField1"
              value={otherData.optionalField1}
              onChange={handleChange}
              placeholder="Optional Field 1"
            />
            <input
              type="text"
              name="optionalValue1"
              value={otherData.optionalValue1}
              onChange={handleChange}
              placeholder="Optional Value 1"
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="optionalField2"
              value={otherData.optionalField2}
              onChange={handleChange}
              placeholder="Optional Field 2"
            />
            <input
              type="text"
              name="optionalValue2"
              value={otherData.optionalValue2}
              onChange={handleChange}
              placeholder="Optional Value 2"
            />
          </div>
        </div>
      </form>
      <div className="fixed-bottom-save">
        <button onClick={handleSubmit}>Save</button>
      </div>
    </div>
  );
};

export default OtherDetails;
