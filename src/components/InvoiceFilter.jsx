import React, { useState } from 'react';
import './InvoiceFilter.css';

const InvoiceFilter = ({ onClose, onApply }) => {
  const [sortBy, setSortBy] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleApply = () => {
    onApply({
      sortBy,
      dateFilter,
      statusFilter,
    });
    onClose();
  };

  const handleClearAll = () => {
    setSortBy('');
    setDateFilter('');
    setStatusFilter('');
  };

  return (
    <div className="filter-modal">
      <header className="filter-header">
        <h2>Sort & Filters</h2>
        <button onClick={onClose} className="save-button">Save</button>
      </header>

      <div className="filter-section">
        <h3>Sort by</h3>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="sort"
              value="latest"
              checked={sortBy === 'latest'}
              onChange={(e) => setSortBy(e.target.value)}
            />
            Invoice Date (Latest First)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="sort"
              value="oldest"
              checked={sortBy === 'oldest'}
              onChange={(e) => setSortBy(e.target.value)}
            />
            Invoice Date (Oldest First)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="sort"
              value="low-high"
              checked={sortBy === 'low-high'}
              onChange={(e) => setSortBy(e.target.value)}
            />
            Invoice Amount (Low to High)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="sort"
              value="high-low"
              checked={sortBy === 'high-low'}
              onChange={(e) => setSortBy(e.target.value)}
            />
            Invoice Amount (High to Low)
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by date</h3>
        <div className="radio-group date-filters">
          <div className="filter-row">
            <label className="radio-label">
              <input
                type="radio"
                name="date"
                value="this-month"
                checked={dateFilter === 'this-month'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              This Month
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="date"
                value="last-month"
                checked={dateFilter === 'last-month'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              Last Month
            </label>
          </div>
          <div className="filter-row">
            <label className="radio-label">
              <input
                type="radio"
                name="date"
                value="current-fy"
                checked={dateFilter === 'current-fy'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              Financial Year (2025-2026)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="date"
                value="last-fy"
                checked={dateFilter === 'last-fy'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              Last Financial Year (2024-2025)
            </label>
          </div>
          <div className="filter-row">
            <label className="radio-label">
              <input
                type="radio"
                name="date"
                value="custom"
                checked={dateFilter === 'custom'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              Custom Date
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="date"
                value="all-time"
                checked={dateFilter === 'all-time'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              All Time
            </label>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by</h3>
        <div className="radio-group status-filters">
          <div className="filter-row">
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="all"
                checked={statusFilter === 'all'}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              All
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="partial"
                checked={statusFilter === 'partial'}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              Partial Due
            </label>
          </div>
          <div className="filter-row">
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="paid"
                checked={statusFilter === 'paid'}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              Paid
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="unpaid"
                checked={statusFilter === 'unpaid'}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              Unpaid
            </label>
          </div>
          <div className="filter-row">
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="active"
                checked={statusFilter === 'active'}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              Active
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="cancelled"
                checked={statusFilter === 'cancelled'}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              Cancelled
            </label>
          </div>
        </div>
      </div>

      <div className="filter-actions">
        <button className="clear-button" onClick={handleClearAll}>
          Clear all
        </button>
        <button className="apply-button" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default InvoiceFilter; 