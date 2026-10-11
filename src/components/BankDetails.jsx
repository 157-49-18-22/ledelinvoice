import React, { useState, useEffect } from 'react';
import './shared.css';
import './BankDetails.css';

const BANK_ACCOUNTS_KEY = 'savedBankAccounts';

const BankDetails = ({ onClose, onSave, initialData, viewOnly = false }) => {
  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem(BANK_ACCOUNTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved bank accounts:', e);
      }
    }
    return [];
  });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showView, setShowView] = useState(false);
  const [formData, setFormData] = useState({
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: '',
    ibanNumber: '',
    swiftCode: ''
  });

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(BANK_ACCOUNTS_KEY, JSON.stringify(bankAccounts));
    } catch (e) {
      console.error('Error saving bank accounts:', e);
    }
  }, [bankAccounts]);

  const handleAddNew = () => {
    setFormData({
      ifscCode: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      ibanNumber: '',
      swiftCode: ''
    });
    setSelectedIndex(null);
    setEditing(true);
  };

  const handleEdit = (idx) => {
    setFormData(bankAccounts[idx]);
    setSelectedIndex(idx);
    setEditing(true);
  };

  const handleView = (idx) => {
    setFormData(bankAccounts[idx]);
    setSelectedIndex(idx);
    setShowView(true);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setBankAccounts(accounts => accounts.filter((_, i) => i !== idx));
      setShowView(false);
      setEditing(false);
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.bankName || !formData.accountNumber) {
      alert('Please fill in required fields.');
      return;
    }
    if (selectedIndex !== null) {
      // Edit existing
      setBankAccounts(accounts => accounts.map((acc, i) => i === selectedIndex ? formData : acc));
    } else {
      // Add new
      setBankAccounts(accounts => [...accounts, formData]);
    }
    setEditing(false);
    setShowView(false);
  };

  // List view
  if (!editing && !showView) {
    return (
      <div className="details-page">
        <header className="details-header">
          <div className="header-left">
            <button className="back-button" onClick={onClose}>←</button>
            <h1>Bank Accounts</h1>
          </div>
          {!viewOnly && (
          <button className="add-button" onClick={handleAddNew} style={{background: '#FFD700', color: '#333', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Add New</button>
          )}
        </header>
        <div className="bank-accounts-list">
          {bankAccounts.length === 0 ? <div>No bank accounts saved.</div> : (
            <ul style={{listStyle: 'none', padding: 0}}>
              {bankAccounts.map((acc, idx) => (
                <li key={idx} style={{marginBottom: 16, border: '1px solid #eee', borderRadius: 8, padding: 12}}>
                  <div><b>Bank:</b> {acc.bankName}</div>
                  <div><b>Account:</b> {acc.accountNumber}</div>
                  <div><b>IFSC:</b> {acc.ifscCode}</div>
                  <div style={{marginTop: 8}}>
                    {!viewOnly && (
                      <>
                    <button className="edit-button" onClick={() => handleEdit(idx)} style={{background: '#FFD700', color: '#333', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Edit</button>
                        <button className="delete-button" onClick={() => handleDelete(idx)} style={{marginLeft: 8, background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Delete</button>
                      </>
                    )}
                    <button className="see-button" onClick={() => handleView(idx)} style={{marginLeft: 8, background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>See</button>
                    <button className="select-button" onClick={() => { onSave(acc); }} style={{marginLeft: 8, background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer'}}>Select</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // View modal
  if (showView) {
    return (
      <div className="details-page">
        <header className="details-header">
          <div className="header-left">
            <button className="back-button" onClick={() => setShowView(false)}>←</button>
            <h1>Bank Details</h1>
          </div>
        </header>
        <div className="details-summary">
          <div className="summary-row"><span className="summary-label">Bank Name:</span> <span className="summary-value">{formData.bankName}</span></div>
          <div className="summary-row"><span className="summary-label">Account Number:</span> <span className="summary-value">{formData.accountNumber}</span></div>
          {formData.ifscCode && <div className="summary-row"><span className="summary-label">IFSC Code:</span> <span className="summary-value">{formData.ifscCode}</span></div>}
          {formData.branchName && <div className="summary-row"><span className="summary-label">Branch Name:</span> <span className="summary-value">{formData.branchName}</span></div>}
          {formData.accountHolderName && <div className="summary-row"><span className="summary-label">Account Holder Name:</span> <span className="summary-value">{formData.accountHolderName}</span></div>}
          {formData.ibanNumber && <div className="summary-row"><span className="summary-label">IBAN Number:</span> <span className="summary-value">{formData.ibanNumber}</span></div>}
          {formData.swiftCode && <div className="summary-row"><span className="summary-label">Swift Code:</span> <span className="summary-value">{formData.swiftCode}</span></div>}
        </div>
      </div>
    );
  }

  // Form view (add/edit)
  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button className="back-button" onClick={() => { setEditing(false); setSelectedIndex(null); }}>←</button>
          <h1>{selectedIndex !== null ? 'Edit Bank Account' : 'Add Bank Account'}</h1>
        </div>
        <button className="save-button" onClick={handleSave}>Save</button>
      </header>
      <form className="details-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="ifscCode">IFSC Code</label>
          <input type="text" id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} placeholder="IFSC Code" />
        </div>
        <div className="form-group">
          <label htmlFor="bankName">Bank Name<span className="required">*</span></label>
          <input type="text" id="bankName" name="bankName" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="Bank Name" required />
        </div>
        <div className="form-group">
          <label htmlFor="branchName">Branch Name</label>
          <input type="text" id="branchName" name="branchName" value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} placeholder="Branch Name" />
        </div>
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number<span className="required">*</span></label>
          <input type="text" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="Account Number" required />
        </div>
        <div className="form-group">
          <label htmlFor="accountHolderName">Account Holder Name</label>
          <input type="text" id="accountHolderName" name="accountHolderName" value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} placeholder="Account Holder Name" />
        </div>
        <div className="form-group">
          <label htmlFor="ibanNumber">IBAN Number</label>
          <input type="text" id="ibanNumber" name="ibanNumber" value={formData.ibanNumber} onChange={e => setFormData({...formData, ibanNumber: e.target.value})} placeholder="IBAN Number" />
        </div>
        <div className="form-group">
          <label htmlFor="swiftCode">Swift Code</label>
          <input type="text" id="swiftCode" name="swiftCode" value={formData.swiftCode} onChange={e => setFormData({...formData, swiftCode: e.target.value})} placeholder="Swift Code" />
        </div>
      </form>
      <button className="save-button-bottom" onClick={handleSave}>SAVE</button>
    </div>
  );
};

export default BankDetails; 
