import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import './CreateInvoice.css';

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [invoiceType, setInvoiceType] = useState('standard');
  const [includeSignature, setIncludeSignature] = useState(false);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving invoice...');
  };

  return (
    <div className="create-invoice-container">
      <header className="invoice-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoArrowBack />
          </button>
          <h1>Create New Invoice</h1>
        </div>
        <button className="save-button" onClick={handleSave}>
          Save Invoice
        </button>
      </header>

      <form className="invoice-form">
        <div className="invoice-type">
          <h2>Invoice Type</h2>
          <label className="radio-label">
            <input
              type="radio"
              name="invoiceType"
              value="standard"
              checked={invoiceType === 'standard'}
              onChange={(e) => setInvoiceType(e.target.value)}
            />
            Standard Invoice
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="invoiceType"
              value="recurring"
              checked={invoiceType === 'recurring'}
              onChange={(e) => setInvoiceType(e.target.value)}
            />
            Recurring Invoice
          </label>
        </div>

        <div className="invoice-details">
          <h2>Invoice Details</h2>
          <div className="detail-row">
            <div className="detail-field">
              <label>Invoice Number</label>
              <input type="text" placeholder="INV-001" />
            </div>
            <div className="detail-field">
              <label>Invoice Date</label>
              <input type="date" className="date-input" />
            </div>
            <div className="detail-field">
              <label>Due Date</label>
              <input type="date" className="date-input" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Client Information</h2>
          <div className="details-summary">
            <div className="summary-row">
              <span className="summary-label">Client Name:</span>
              <span className="summary-value">John Doe</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Email:</span>
              <span className="summary-value">john.doe@example.com</span>
            </div>
            <button className="edit-button">
              <FiEdit2 />
            </button>
          </div>
          <button className="add-button">
            <span>Add New Client</span>
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="form-section">
          <h2>Products & Services</h2>
          <div className="product-summary">
            <div className="summary-row">
              <span className="summary-label">Item:</span>
              <span className="summary-value">Web Development</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Quantity:</span>
              <span className="summary-value">1</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Price:</span>
              <span className="summary-value">$1,000.00</span>
            </div>
            <button className="edit-button">
              <FiEdit2 />
            </button>
          </div>
          <button className="add-button">
            <span>Add Product or Service</span>
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="form-section">
          <h2>Terms & Conditions</h2>
          <div className="terms-text">
            <p>Please review the following terms and conditions:</p>
            <p>1. Payment is due within 30 days of invoice date</p>
            <p>2. Late payments will incur a 2% monthly fee</p>
            <p>3. All prices are in USD unless otherwise specified</p>
          </div>
          <div className="signature-toggle">
            <span>Include Digital Signature</span>
            <div 
              className={`toggle-track ${includeSignature ? 'active' : ''}`}
              onClick={() => setIncludeSignature(!includeSignature)}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice; 