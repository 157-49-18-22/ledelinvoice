import React from 'react';
import './EInvoiceSetup.css';

const EInvoiceSetup = ({ onClose }) => {
  return (
    <div className="einvoice-setup">
      <header className="einvoice-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>Invoices</h1>
        </div>
        <button className="create-new-button">
          Create New
        </button>
      </header>

      <div className="einvoice-content">
        <div className="einvoice-card">
          <h2>E-invoice</h2>
          <div className="qr-placeholder">
            {/* QR code will be generated here */}
          </div>
          <h3>E-Invoice Setup</h3>
          <button className="setup-button">
            Setup E-Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default EInvoiceSetup; 