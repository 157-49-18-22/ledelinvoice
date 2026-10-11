import React, { useState } from 'react';
import './shared.css';
import './TransportationDetails.css';

const TransportationDetails = ({ onClose, onSave, initialData }) => {
  const [transportData, setTransportData] = useState({
    transportMode: initialData?.transportMode || 'not-applicable',
    documentNumber: initialData?.documentNumber || '',
    documentDate: initialData?.documentDate || '',
    vehicleNumber: initialData?.vehicleNumber || '',
    dateOfSupply: initialData?.dateOfSupply || new Date().toISOString().split('T')[0],
    placeOfSupply: initialData?.placeOfSupply || '',
    transporter: initialData?.transporter || '',
    supplyType: initialData?.supplyType || '',
    optionalField1: initialData?.optionalField1 || '',
    optionalValue1: initialData?.optionalValue1 || '',
    optionalField2: initialData?.optionalField2 || '',
    optionalValue2: initialData?.optionalValue2 || '',
    deliveryDate: initialData?.deliveryDate || new Date().toISOString().split('T')[0],
  });

  const getFieldLabels = () => {
    switch (transportData.transportMode) {
      case 'road':
        return { number: 'LR Number', date: 'LR Date' };
      case 'rail':
        return { number: 'RR Number', date: 'RR Date' };
      case 'air':
        return { number: 'Airway Bill Number', date: 'Airway Bill Date' };
      case 'ship':
        return { number: 'Landing Number', date: 'Landing Date' };
      default:
        return { number: 'Document Number', date: 'Document Date' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(transportData);
  };

  const labels = getFieldLabels();

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>Transportation Details</h1>
        </div>
      </header>

      <form className="details-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Transportation Mode</h2>
          
          <div className="transport-row">
            <label className="radio-label">
              <input
                type="radio"
                name="transportMode"
                value="road"
                checked={transportData.transportMode === 'road'}
                onChange={handleChange}
              />
              <span>Road</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="transportMode"
                value="rail"
                checked={transportData.transportMode === 'rail'}
                onChange={handleChange}
              />
              <span>Rail</span>
            </label>
          </div>

          <div className="transport-row">
            <label className="radio-label">
              <input
                type="radio"
                name="transportMode"
                value="air"
                checked={transportData.transportMode === 'air'}
                onChange={handleChange}
              />
              <span>Air</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="transportMode"
                value="ship"
                checked={transportData.transportMode === 'ship'}
                onChange={handleChange}
              />
              <span>Ship/Road Cum Ship</span>
            </label>
          </div>

          <div className="transport-row">
            <label className="radio-label">
              <input
                type="radio"
                name="transportMode"
                value="not-applicable"
                checked={transportData.transportMode === 'not-applicable'}
                onChange={handleChange}
              />
              <span>Not-Applicable</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="vehicleNumber">Vehicle Number</label>
          <input
            type="text"
            id="vehicleNumber"
            name="vehicleNumber"
            value={transportData.vehicleNumber}
            onChange={handleChange}
            placeholder="Enter vehicle number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deliveryDate">Delivery Date</label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={transportData.deliveryDate}
            onChange={handleChange}
          />
        </div>

        {transportData.transportMode !== 'not-applicable' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="documentNumber">{labels.number}</label>
              <input
                type="text"
                id="documentNumber"
                name="documentNumber"
                value={transportData.documentNumber}
                onChange={handleChange}
                placeholder="Enter No."
              />
            </div>
            <div className="form-group">
              <label htmlFor="documentDate">{labels.date}</label>
              <input
                type="date"
                id="documentDate"
                name="documentDate"
                value={transportData.documentDate}
                onChange={handleChange}
                className="date-input"
              />
            </div>
          </div>
        )}

        {transportData.transportMode !== 'not-applicable' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfSupply">Date of supply</label>
              <input
                type="date"
                id="dateOfSupply"
                name="dateOfSupply"
                value={transportData.dateOfSupply}
                onChange={handleChange}
                className="date-input"
              />
            </div>
          </div>
        )}

        {transportData.transportMode !== 'not-applicable' && (
          <>
            <div className="form-group">
              <label htmlFor="placeOfSupply">Place of Supply</label>
              <input
                type="text"
                id="placeOfSupply"
                name="placeOfSupply"
                value={transportData.placeOfSupply}
                onChange={handleChange}
                placeholder="Enter Supply Place"
              />
            </div>

            <div className="form-group">
              <label htmlFor="transporter">Transporter</label>
              <select
                id="transporter"
                name="transporter"
                value={transportData.transporter}
                onChange={handleChange}
              >
                <option value="">Select Transporter</option>
                <option value="transporter1">Transporter 1</option>
                <option value="transporter2">Transporter 2</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="supplyType">Supply Type</label>
              <select
                id="supplyType"
                name="supplyType"
                value={transportData.supplyType}
                onChange={handleChange}
              >
                <option value="">Select Supply Type</option>
                <option value="type1">Supply Type 1</option>
                <option value="type2">Supply Type 2</option>
              </select>
            </div>
          </>
        )}

        <div className="section-title">Optional Details</div>
        <div className="optional-fields">
          <div className="form-row">
            <input
              type="text"
              name="optionalField1"
              value={transportData.optionalField1}
              onChange={handleChange}
              placeholder="Optional Field 1"
            />
            <input
              type="text"
              name="optionalValue1"
              value={transportData.optionalValue1}
              onChange={handleChange}
              placeholder="Optional Value 1"
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="optionalField2"
              value={transportData.optionalField2}
              onChange={handleChange}
              placeholder="Optional Field 2"
            />
            <input
              type="text"
              name="optionalValue2"
              value={transportData.optionalValue2}
              onChange={handleChange}
              placeholder="Optional Value 2"
            />
          </div>
        </div>
      </form>

      <button className="save-button-bottom" onClick={handleSubmit}>
        SAVE
      </button>
    </div>
  );
};

export default TransportationDetails; 