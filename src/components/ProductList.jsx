import React, { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './shared.css';
import './ProductList.css';

const ProductList = ({ products = [], onAddNew, onEdit, onDelete, onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNewClick = () => {
    onAddNew();
  };

  const filteredProducts = products.filter(product =>
    (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (product.hsn?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-list-page">
      <header className="list-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>Product List</h1>
        </div>
        <button className="add-button" onClick={handleAddNewClick}>+ Add New</button>
      </header>

      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Name or HSN/SAC"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="product-list">
        {filteredProducts.length > 0 ? filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <h2 onClick={() => onSelect(product)}>{product.name}</h2>
            
            <div className="product-card-actions">
              <button className="icon-button edit" onClick={() => onEdit(product)}>
                <FiEdit2 />
              </button>
              <button className="icon-button delete" onClick={() => onDelete(product.id)}>
                <FiTrash2 />
              </button>
            </div>

            <div className="product-info" onClick={() => onSelect(product)}>
              {product.hsn && (
                <div className="info-row">
                  <span className="label">HSN/SAC</span>
                  <span className="value">{product.hsn}</span>
                </div>
              )}
              {product.salePrice && (
                <div className="info-row">
                  <span className="label">Sale Price</span>
                  <span className="value">₹{product.salePrice}</span>
                </div>
              )}
              {product.type && (
                <div className="info-row">
                  <span className="label">Type</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>{product.type}</span>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="no-products-message">
            No products found. Add a new product to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
