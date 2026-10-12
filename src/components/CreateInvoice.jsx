import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveDraft, getDraft } from '../utils/draftManager';
import './CreateInvoice.css';
import SupplierDetails from './SupplierDetails';
import BuyerList from './BuyerList';
import BuyerDetails from './BuyerDetails';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';
import TransportationDetails from './TransportationDetails';
import OtherDetails from './OtherDetails';
import BankDetails from './BankDetails';
import SignatureCanvas from './SignatureCanvas';

// LocalStorage Keys
const BUYERS_STORAGE_KEY = 'invoiceApp_allBuyers';
const PRODUCTS_STORAGE_KEY = 'invoiceApp_allProducts';

// Function to load data from localStorage
const loadFromLocalStorage = (key, fallbackData) => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : fallbackData;
  } catch (error) {
    console.error(`Error loading data from localStorage key ${key}:`, error);
    return fallbackData;
  }
};

// Initial sample buyer data (moved from BuyerList)
const initialBuyers = [
  {
    id: 1,
    companyName: 'Cash Sale', // Changed 'name' to 'companyName' for consistency
    address: '',
    gstin: '',
    state: '',
    city: '',
    pincode: ''
  },
  {
    id: 2,
    companyName: 'DEMO GST Register Party', // Changed 'name' to 'companyName'
    address: 'Second Floor 106/3 Ava nti Vihar Road Raipur Raipur Chhattisgarh 492004,Raipur-492004',
    gstin: '22AAICG8226H1ZO',
    state: 'Chhattisgarh',
    city: 'Raipur',
    pincode: '492004'
  }
];

// Initial sample product data
const initialProducts = [
  {
    id: 101,
    name: 'Demo Product A',
    description: 'This is a sample product',
    hsn: '123456',
    salePrice: '100',
    unit: 'pcs',
    gst: '18',
    cess: '0',
    type: 'goods',
    taxType: 'exclusive'
  },
  {
    id: 102,
    name: 'Sample Service B',
    description: 'Consulting service',
    hsn: '998314',
    salePrice: '500',
    unit: 'hr',
    gst: '18',
    cess: '0',
    type: 'services',
    taxType: 'exclusive'
  }
];

// Helpers for auto-generating GST invoice prefix and sequential numbers
const getFinancialYearString = (dateObj = new Date()) => {
  const d = dateObj instanceof Date && !isNaN(dateObj) ? dateObj : new Date();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 is January, 3 is April
  // Indian Financial Year: April to March
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
};

const getDefaultPrefix = (dateString = null) => {
  const d = dateString ? new Date(dateString) : new Date();
  return `LE/${getFinancialYearString(d)}/`;
};

const getNextInvoiceNumber = (invoicesList = []) => {
  let maxNum = 0;
  if (Array.isArray(invoicesList) && invoicesList.length > 0) {
    invoicesList.forEach(inv => {
      const fullNo = String(inv.invoiceNo || inv.number || inv.invoiceNumber || '');
      const match = fullNo.match(/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxNum) {
          maxNum = val;
        }
      }
    });
  }
  const nextVal = maxNum + 1;
  return String(nextVal).padStart(3, '0');
};

// Accept initialInvoiceData and invoices prop
const CreateInvoice = ({ onClose, onSave, initialInvoiceData = null, invoices = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const draft = getDraft();
  const effectiveInitialData = initialInvoiceData || draft || null;

  console.log('CreateInvoice component props:', { onClose, onSave, initialInvoiceData });
  console.log('onSave prop type:', typeof onSave);
  console.log('onSave prop value:', onSave);

  // Store the original onSave function
  const originalOnSave = onSave;
  // --- State Initialization ---
  // Initialize state based on initialInvoiceData, draft, or defaults
  const [invoiceId, setInvoiceId] = useState(effectiveInitialData?.id || null);
  const [invoiceType, setInvoiceType] = useState(effectiveInitialData?.invoiceType || '');
  const [consigneeType, setConsigneeType] = useState(effectiveInitialData?.consigneeType || 'same'); // Default to 'same'
  const [gstType, setGstType] = useState(effectiveInitialData?.gstType || 'auto'); // 'auto', 'igst', 'sgst', 'both'
  const [selectedBuyer, setSelectedBuyer] = useState(effectiveInitialData?.selectedBuyer || null);
  const [transportData, setTransportData] = useState(effectiveInitialData?.transportData || null);
  const [otherData, setOtherData] = useState(effectiveInitialData?.otherData || null);
  const [bankData, setBankData] = useState(effectiveInitialData?.bankData || null);
  const [supplierData, setSupplierData] = useState(effectiveInitialData?.supplierData || null);
  const [invoiceDate, setInvoiceDate] = useState(effectiveInitialData?.date || new Date().toISOString().split('T')[0]); // Default to today

  // Extract prefix and number if invoiceNo exists, otherwise auto-generate
  const initialInvoiceNo = effectiveInitialData?.invoiceNo || '';
  const numberMatch = initialInvoiceNo.match(/\d+$/);
  const calculatedNextNum = getNextInvoiceNumber(invoices);
  const calculatedDefaultPrefix = getDefaultPrefix(effectiveInitialData?.date);

  const initialNum = numberMatch
    ? numberMatch[0]
    : (effectiveInitialData?.invoiceNumber || (effectiveInitialData?.id ? '' : calculatedNextNum));
  const initialPrefix = initialInvoiceNo.replace(initialNum, '')
    || (effectiveInitialData?.invoicePrefix || (effectiveInitialData?.id ? '' : calculatedDefaultPrefix));

  const [invoicePrefix, setInvoicePrefix] = useState(initialPrefix);
  const [invoiceNumber, setInvoiceNumber] = useState(initialNum);

  const [invoiceProducts, setInvoiceProducts] = useState(effectiveInitialData?.products || []);
  const [discountPercent, setDiscountPercent] = useState(effectiveInitialData?.discountPercent || 0);
  const [tdsEnabled, setTdsEnabled] = useState(effectiveInitialData?.tdsEnabled || false);
  const [tdsPercent, setTdsPercent] = useState(effectiveInitialData?.tdsPercent || 2);
  const [advancePaid, setAdvancePaid] = useState(effectiveInitialData?.advancePaid || 0);
  const [consigneeData, setConsigneeData] = useState(effectiveInitialData?.consigneeData || {
    companyName: '',
    address: '',
    gstin: '',
    state: '',
    stateCode: ''
  });
  const [isConsigneeSaved, setIsConsigneeSaved] = useState(Boolean(effectiveInitialData?.consigneeData?.companyName));

  // Other existing state...
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showBuyerList, setShowBuyerList] = useState(false);
  const [showBuyerDetails, setShowBuyerDetails] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showTransportationDetails, setShowTransportationDetails] = useState(false);
  const [showOtherDetails, setShowOtherDetails] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  // State for signature and editing
  // eslint-disable-next-line
  const invoiceTemplateRef = useRef(null);
  const [showSignature, setShowSignature] = useState(() => {
    if (initialInvoiceData?.includeSignature !== undefined) return initialInvoiceData.includeSignature;
    return loadFromLocalStorage('savedShowSignature', false);
  });
  const [signatureType, setSignatureType] = useState('upload');
  const [signatureImage, setSignatureImage] = useState(() => {
    if (initialInvoiceData?.signatureImage) return initialInvoiceData.signatureImage;
    try {
      return localStorage.getItem('savedSignatureImage') || null;
    } catch (e) {
      return null;
    }
  });
  // eslint-disable-next-line
  const fileInputRef = useRef(null);
  // eslint-disable-next-line
  const canvasRef = useRef(null);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  // eslint-disable-next-line
  const [viewBankDetailsOnly, setViewBankDetailsOnly] = useState(false);

  const [allBuyers, setAllBuyers] = useState(() => loadFromLocalStorage(BUYERS_STORAGE_KEY, initialBuyers));
  const [allProducts, setAllProducts] = useState(() => loadFromLocalStorage(PRODUCTS_STORAGE_KEY, initialProducts));

  // Debug log to check invoiceNumber state on every render
  console.log('Current invoiceNumber state:', invoiceNumber);

  const syncDraft = useCallback(() => {
    saveDraft({
      id: invoiceId,
      invoiceType,
      consigneeType,
      consigneeData,
      gstType,
      selectedBuyer,
      transportData,
      otherData,
      bankData,
      supplierData,
      date: invoiceDate,
      invoiceNo: `${invoicePrefix}${invoiceNumber}`,
      invoicePrefix,
      invoiceNumber,
      discountPercent,
      advancePaid,
      tdsEnabled,
      tdsPercent,
      products: invoiceProducts,
      includeSignature: showSignature,
      signatureImage
    });
  }, [
    invoiceId, invoiceType, consigneeType, consigneeData, gstType, selectedBuyer,
    transportData, otherData, bankData, supplierData, invoiceDate,
    invoicePrefix, invoiceNumber, discountPercent, advancePaid, tdsEnabled,
    tdsPercent, invoiceProducts, showSignature, signatureImage
  ]);

  // Sync state whenever draft is updated from subroutes (e.g., on navigate back)
  useEffect(() => {
    const currentDraft = getDraft();
    if (currentDraft) {
      if (currentDraft.supplierData !== undefined) setSupplierData(currentDraft.supplierData);
      if (currentDraft.selectedBuyer !== undefined) setSelectedBuyer(currentDraft.selectedBuyer);
      if (currentDraft.products !== undefined) setInvoiceProducts(currentDraft.products);
      if (currentDraft.transportData !== undefined) setTransportData(currentDraft.transportData);
      if (currentDraft.otherData !== undefined) setOtherData(currentDraft.otherData);
      if (currentDraft.bankData !== undefined) setBankData(currentDraft.bankData);
      if (currentDraft.date !== undefined && currentDraft.date) setInvoiceDate(currentDraft.date);
      if (currentDraft.invoicePrefix !== undefined) setInvoicePrefix(currentDraft.invoicePrefix);
      if (currentDraft.invoiceNumber !== undefined) setInvoiceNumber(currentDraft.invoiceNumber);
      if (currentDraft.invoiceType !== undefined && currentDraft.invoiceType) setInvoiceType(currentDraft.invoiceType);
      if (currentDraft.consigneeType !== undefined) setConsigneeType(currentDraft.consigneeType);
      if (currentDraft.consigneeData !== undefined) setConsigneeData(currentDraft.consigneeData);
      if (currentDraft.gstType !== undefined) setGstType(currentDraft.gstType);
      if (currentDraft.discountPercent !== undefined) setDiscountPercent(currentDraft.discountPercent);
      if (currentDraft.advancePaid !== undefined) setAdvancePaid(currentDraft.advancePaid);
      if (currentDraft.tdsEnabled !== undefined) setTdsEnabled(currentDraft.tdsEnabled);
      if (currentDraft.tdsPercent !== undefined) setTdsPercent(currentDraft.tdsPercent);
    }
  }, [location.key]);

  // Effect to update state if initial data prop changes after initial mount (less common)
  useEffect(() => {
    if (initialInvoiceData) {
      console.log('[CreateInvoice Effect] Initial data received, setting state:', initialInvoiceData);
      setInvoiceId(initialInvoiceData.id || null);
      setInvoiceType(initialInvoiceData.invoiceType || '');
      setConsigneeType(initialInvoiceData.consigneeType || 'same');
      setConsigneeData(initialInvoiceData.consigneeData || { companyName: '', address: '', gstin: '', state: '', stateCode: '' });
      setGstType(initialInvoiceData.gstType || 'auto');
      setSelectedBuyer(initialInvoiceData.selectedBuyer || null);
      setTransportData(initialInvoiceData.transportData || null);
      setOtherData(initialInvoiceData.otherData || null);
      setBankData(initialInvoiceData.bankData || null);
      setSupplierData(initialInvoiceData.supplierData || null);
      setInvoiceDate(initialInvoiceData.date || new Date().toISOString().split('T')[0]);
      setInvoiceProducts(initialInvoiceData.products || []);
      setSignatureImage(initialInvoiceData.signatureImage || null);

      const invNo = initialInvoiceData.invoiceNo || '';
      const numMatch = invNo.match(/\d+$/);
      const num = numMatch ? numMatch[0] : '';
      const prefix = invNo.replace(num, '');
      setInvoicePrefix(prefix);
      setInvoiceNumber(num);
      setDiscountPercent(initialInvoiceData.discountPercent || 0);
      setAdvancePaid(initialInvoiceData.advancePaid || 0);
      setTdsEnabled(initialInvoiceData.tdsEnabled || false);
      setTdsPercent(initialInvoiceData.tdsPercent || 2);
    } else {
      // Reset state if initialInvoiceData becomes null (e.g., switching from edit to new)
      console.log('[CreateInvoice Effect] Initial data is null, resetting state.');
      setInvoiceId(null);
      setInvoiceType('');
      setConsigneeType('same');
      setGstType('auto');
      setSelectedBuyer(null);
      // ... reset other fields as needed ...
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setInvoicePrefix(getDefaultPrefix());
      setInvoiceNumber(getNextInvoiceNumber(invoices));
      setInvoiceProducts([]);
      setDiscountPercent(0);
      setTdsEnabled(false);
      setTdsPercent(2);
    }
  }, [initialInvoiceData, invoices]); // Depend on prop

  // Auto-fill prefix and next invoice number if new invoice and currently empty
  useEffect(() => {
    if (!invoiceId && (!effectiveInitialData || !effectiveInitialData.id)) {
      if (!invoicePrefix) {
        setInvoicePrefix(getDefaultPrefix(invoiceDate));
      }
      if (!invoiceNumber) {
        setInvoiceNumber(getNextInvoiceNumber(invoices));
      }
    }
  }, [invoices, invoiceId, effectiveInitialData]);

  // Save buyers whenever allBuyers changes
  useEffect(() => {
    try {
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(allBuyers));
    } catch (error) {
      console.error('Error saving buyers to localStorage:', error);
    }
  }, [allBuyers]);

  // Save products whenever allProducts changes
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(allProducts));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }, [allProducts]);

  // Save showSignature toggle whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('savedShowSignature', JSON.stringify(showSignature));
    } catch (error) {
      console.error('Error saving showSignature to localStorage:', error);
    }
  }, [showSignature]);

  const handleSupplierSave = (data) => {
    setSupplierData(data);
    setShowSupplierDetails(false);
  };

  const handleBuyerSelect = (buyer) => {
    setSelectedBuyer(buyer);
    setShowBuyerList(false);
  };

  const handleAddNewBuyer = () => {
    setEditingBuyer(null);
    setShowBuyerList(false);
    setShowBuyerDetails(true);
  };

  const handleBuyerSave = (buyerData) => {
    setAllBuyers(prevBuyers => {
      const existingBuyerIndex = prevBuyers.findIndex(b => b.id === buyerData.id);
      if (existingBuyerIndex > -1) {
        const updatedBuyers = [...prevBuyers];
        updatedBuyers[existingBuyerIndex] = buyerData;
        return updatedBuyers;
      } else {
        const newBuyer = { ...buyerData, id: Date.now() };
        return [...prevBuyers, newBuyer];
      }
    });
    setSelectedBuyer(buyerData.id ? buyerData : { ...buyerData, id: Date.now() });
    setEditingBuyer(null);
    setShowBuyerDetails(false);
    setShowBuyerList(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setShowProductList(false);
    setShowProductDetails(true);
  };

  const handleProductDelete = (productId) => {
    setAllProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    setInvoiceProducts(prevInvoiceProducts => prevInvoiceProducts.filter(p => p.id !== productId));
  };

  const handleProductEdit = (product) => {
    setEditingProduct(product);
    setShowProductList(false);
    setShowProductDetails(true);
  };

  const handleProductSave = (productData) => {
    setAllProducts(prevProducts => {
      const existingProductIndex = prevProducts.findIndex(p => p.id === productData.id);
      if (existingProductIndex > -1) {
        const updatedProducts = [...prevProducts];
        updatedProducts[existingProductIndex] = productData;
        return updatedProducts;
      } else {
        const newProduct = { ...productData, id: Date.now() };
        return [...prevProducts, newProduct];
      }
    });

    setEditingProduct(null);
    setShowProductDetails(false);
    setShowProductList(true);
  };

  const handleSave = async () => {
    console.log('[CreateInvoice Save] Preparing invoice data.');
    // Recalculate total amount based on current invoiceProducts
    const totalAmount = invoiceProducts.reduce((sum, product) => {
      // Use calculated amounts if available, otherwise recalculate (safer)
      const quantity = parseFloat(product.quantity) || 0;
      const salePrice = parseFloat(product.salePrice) || 0;
      const gstRate = parseFloat(product.gstRate) || parseFloat(product.gst) || 0;
      const cessRate = parseFloat(product.cessRate) || parseFloat(product.cess) || 0;

      let itemTotal = quantity * salePrice;
      let gstAmt = 0;
      let cessAmt = 0;

      if (product.taxType === 'inclusive') {
        const totalTaxRate = gstRate + cessRate;
        const inclusiveAmountPerItem = salePrice;
        const basePricePerItem = inclusiveAmountPerItem / (1 + (totalTaxRate / 100));

        itemTotal = quantity * basePricePerItem;
        gstAmt = quantity * (basePricePerItem * (gstRate / 100));
        cessAmt = quantity * (basePricePerItem * (cessRate / 100));
      } else {
        gstAmt = itemTotal * (gstRate / 100);
        cessAmt = itemTotal * (cessRate / 100);
      }

      return sum + itemTotal + gstAmt + cessAmt;
    }, 0);

    // Apply discount
    const parsedDiscount = parseFloat(discountPercent) || 0;
    const discountAmount = totalAmount * (parsedDiscount / 100);
    const finalAmount = totalAmount - discountAmount;

    // Create a clean buyer data object
    const buyerData = selectedBuyer ? {
      companyName: selectedBuyer.companyName || '',
      address: selectedBuyer.address || '',
      city: selectedBuyer.city || '',
      state: selectedBuyer.state || '',
      pincode: selectedBuyer.pincode || '',
      gstin: selectedBuyer.gstin || '',
      stateCode: selectedBuyer.stateCode || '06' // Default state code if not provided
    } : {};

    // TDS calculation
    const parsedTdsPercent = tdsEnabled ? parseFloat(tdsPercent) || 0 : 0;
    const tdsAmount = finalAmount * (parsedTdsPercent / 100);
    const amountAfterTds = finalAmount - tdsAmount;

    const invoiceData = {
      // Include the id if we are editing
      id: invoiceId,
      invoiceType,
      invoiceNo: `${invoicePrefix}${invoiceNumber}`, // Combine prefix and number
      invoiceNumber: invoiceNumber, // Keep individual number for reference
      invoicePrefix: invoicePrefix, // Keep individual prefix for reference
      date: invoiceDate,
      amount: amountAfterTds, // Use final amount after discount and TDS
      discountPercent: discountPercent,
      advancePaid: parseFloat(advancePaid) || 0,
      tdsEnabled: tdsEnabled,
      tdsPercent: tdsEnabled ? parsedTdsPercent : 0,
      supplierData: supplierData || {},
      selectedBuyer: buyerData, // Keep for backward compatibility
      buyerData, // This is what InvoiceTemplate expects
      consigneeType,
      consigneeData: consigneeType === 'same' ? buyerData : (consigneeData || {}),
      gstType, // Add GST type selection
      products: invoiceProducts, // Pass the current list of products
      transportData: transportData || {},
      otherData: otherData || {},
      bankData: bankData || {},
      includeSignature: showSignature || false,
      signatureImage: showSignature ? signatureImage : null
    };
    console.log('Saving invoice with invoiceNumber:', invoiceNumber); // Debug log
    console.log('About to call onSave with data:', invoiceData); // Debug log
    console.log('onSave function type:', typeof onSave); // Debug log
    console.log('onSave function:', onSave); // Debug log

    if (typeof originalOnSave === 'function') {
      console.log('Calling originalOnSave function...'); // Debug log
      console.log('originalOnSave function:', originalOnSave); // Debug log
      originalOnSave(invoiceData); // onSave in App.js will handle add vs update based on id
      console.log('originalOnSave call completed'); // Debug log
    } else {
      console.error('originalOnSave is not a function!', originalOnSave); // Debug log
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignatureImage(e.target.result);
        try { localStorage.setItem('savedSignatureImage', e.target.result); } catch (err) {}
      };
      reader.readAsDataURL(file);
    }
  };

  // eslint-disable-next-line
  const handleSignatureSave = (dataUrl) => {
    setSignatureImage(dataUrl);
    setSignatureType('upload');
    try { localStorage.setItem('savedSignatureImage', dataUrl); } catch (err) {}
  };

  const handleDeleteSignature = () => {
    setSignatureImage(null);
    try { localStorage.removeItem('savedSignatureImage'); } catch (err) {}
  };

  const handleInvoiceDateChange = (e) => {
    const newDate = e.target.value;
    setInvoiceDate(newDate);
    // If invoicePrefix matches standard LE/YY-YY/ or is empty, auto-update financial year
    if (!invoicePrefix || /^LE\/\d{2}-\d{2}\/$/.test(invoicePrefix)) {
      setInvoicePrefix(getDefaultPrefix(newDate));
    }
  };

  const handleInvoiceNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setInvoiceNumber(value);
    }
  };

  const handleBuyerDelete = (buyerId) => {
    setAllBuyers(prevBuyers => prevBuyers.filter(b => b.id !== buyerId));
    if (selectedBuyer && selectedBuyer.id === buyerId) {
      setSelectedBuyer(null);
    }
  };

  // Commenting out unused state variables
  // const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  // const [viewBankDetailsOnly, setViewBankDetailsOnly] = useState(false);

  const handleBankDetailsSave = (data) => {
    setBankData(data);
    setShowBankDetails(false);
    // Save to localStorage
    try {
      localStorage.setItem('savedBankDetails', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving bank details:', error);
    }
  };

  // Load bank details from localStorage on mount
  useEffect(() => {
    try {
      const savedBankDetails = localStorage.getItem('savedBankDetails');
      if (savedBankDetails) {
        setBankData(JSON.parse(savedBankDetails));
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
    }
  }, []);

  const [showSupplierView, setShowSupplierView] = useState(false);

  if (showSupplierDetails) {
    return (
      <SupplierDetails
        onClose={() => setShowSupplierDetails(false)}
        onSave={handleSupplierSave}
        initialData={supplierData}
      />
    );
  }

  if (showSupplierView) {
    return (
      <div className="modal-overlay" onClick={() => setShowSupplierView(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <SupplierDetails
            initialData={supplierData}
            viewOnly={true}
            onClose={() => setShowSupplierView(false)}
          />
        </div>
      </div>
    );
  }

  if (showBuyerList) {
    return (
      <BuyerList
        buyers={allBuyers}
        onAddNew={handleAddNewBuyer}
        onEdit={(buyer) => {
          setEditingBuyer(buyer);
          setShowBuyerList(false);
          setShowBuyerDetails(true);
        }}
        onDelete={handleBuyerDelete}
        onSelect={handleBuyerSelect}
        onClose={() => setShowBuyerList(false)}
      />
    );
  }

  if (showBuyerDetails) {
    return (
      <BuyerDetails
        onClose={() => {
          setShowBuyerDetails(false);
          setEditingBuyer(null);
        }}
        onSave={handleBuyerSave}
        initialData={editingBuyer}
      />
    );
  }

  if (showProductList) {
    return (
      <ProductList
        products={allProducts}
        onAddNew={handleAddNewProduct}
        onEdit={handleProductEdit}
        onDelete={handleProductDelete}
        onSelect={(product) => {
          setInvoiceProducts(prev => [...prev, { ...product, quantity: 1 }]);
          setShowProductList(false);
        }}
        onClose={() => setShowProductList(false)}
      />
    );
  }

  if (showProductDetails) {
    return (
      <ProductDetails
        onClose={() => {
          setShowProductDetails(false);
          setEditingProduct(null);
        }}
        onSave={handleProductSave}
        initialData={editingProduct}
      />
    );
  }

  if (showTransportationDetails) {
    return (
      <TransportationDetails
        onClose={() => setShowTransportationDetails(false)}
        onSave={(data) => {
          setTransportData(data);
          setShowTransportationDetails(false);
        }}
        initialData={transportData}
      />
    );
  }

  if (showOtherDetails) {
    return (
      <OtherDetails
        onClose={() => setShowOtherDetails(false)}
        onSave={(data) => {
          setOtherData(data);
          setShowOtherDetails(false);
        }}
        initialData={otherData}
      />
    );
  }

  if (showBankDetails) {
    return (
      <BankDetails
        onClose={() => {
          setShowBankDetails(false);
          setViewBankDetailsOnly(false);
        }}
        onSave={handleBankDetailsSave}
        initialData={bankData}
      />
    );
  }

  return (
    <div className="create-invoice">
      <header className="invoice-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>←</button>
          <h1>Create Invoice</h1>
        </div>
        <button className="save-button" onClick={handleSave}>SAVE</button>
      </header>

      <div className="invoice-form">
        <div className="invoice-type">
          <label className="radio-label">
            <input
              type="radio"
              name="invoice-type"
              checked={invoiceType === 'tax-invoice'}
              onChange={() => setInvoiceType('tax-invoice')}
            />
            Tax Invoice/E-Invoice
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="invoice-type"
              checked={invoiceType === 'bill-of-supply'}
              onChange={() => setInvoiceType('bill-of-supply')}
            />
            Bill Of Supply
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="invoice-type"
              checked={invoiceType === 'proforma-invoice'}
              onChange={() => setInvoiceType('proforma-invoice')}
            />
            Proforma Invoice
          </label>
        </div>

        <div className="invoice-details">
          <div className="section-header">
            <h2>Invoice Details</h2>
            <div className="buyer-actions">
              <button className="action-button edit" onClick={() => {
                setInvoiceDate(new Date().toISOString().split('T')[0]);
                setInvoicePrefix(getDefaultPrefix());
                setInvoiceNumber(getNextInvoiceNumber(invoices));
              }}>
                Reset
              </button>
              <button className="action-button delete" onClick={() => {
                if (window.confirm('Are you sure you want to clear invoice details?')) {
                  setInvoiceDate('');
                  setInvoicePrefix('');
                  setInvoiceNumber('');
                }
              }}>
                <span>🗑️</span> Clear
              </button>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-field">
              <label>Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={handleInvoiceDateChange}
                className="date-input"
              />
            </div>
            <div className="detail-field">
              <label>Invoice Prefix</label>
              <input
                type="text"
                placeholder="e.g. LE/26-27/"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
              />
            </div>
            <div className="detail-field">
              <label>Invoice No.</label>
              <input
                type="text"
                placeholder="e.g. 001"
                value={invoiceNumber}
                onChange={handleInvoiceNumberChange}
                maxLength={6}
              />
            </div>
          </div>
          {(invoicePrefix || invoiceNumber) && (
            <div className="invoice-no-preview">
              <span className="preview-label">Full Invoice No:</span>
              <span className="preview-badge">{invoicePrefix}{invoiceNumber}</span>
            </div>
          )}
        </div>

        <section className="form-section">
          <div className="section-header">
            <h2>Supplier Details</h2>
            {supplierData && (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => { syncDraft(); navigate('/supplier-details'); }}>
                  Edit
                </button>
                <button className="action-button see" onClick={() => setShowSupplierView(true)}>
                  See
                </button>
                <button className="action-button delete" onClick={() => {
                  if (window.confirm('Are you sure you want to delete supplier details?')) {
                    setSupplierData(null);
                  }
                }}>
                  <span>🗑️</span> Delete
                </button>
              </div>
            )}
          </div>
          {supplierData ? (
            <div className="details-summary">
              <div className="summary-row">
                <span className="summary-label">Company:</span>
                <span className="summary-value">{supplierData.name || supplierData.companyName}</span>
              </div>
              {supplierData.address && (
                <div className="summary-row">
                  <span className="summary-label">Address:</span>
                  <span className="summary-value">
                    {`${supplierData.address}${supplierData.city ? `, ${supplierData.city}` : ''}${supplierData.state ? `, ${supplierData.state}` : ''}${supplierData.pincode ? ` - ${supplierData.pincode}` : ''}`}
                  </span>
                </div>
              )}
              {supplierData.gstin && (
                <div className="summary-row">
                  <span className="summary-label">GSTIN:</span>
                  <span className="summary-value">{supplierData.gstin}</span>
                </div>
              )}
            </div>
          ) : (
            <button className="add-button" onClick={() => { syncDraft(); navigate('/supplier-details'); }}>
              Add Supplier Details
            </button>
          )}
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Buyer Details</h2>
            {selectedBuyer && (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => {
                  syncDraft();
                  navigate('/buyer-details', { state: { buyer: selectedBuyer } });
                }}>
                  Edit
                </button>
                <button className="action-button see" onClick={() => {
                  syncDraft();
                  navigate('/buyer-list');
                }}>
                  See
                </button>
                <button className="action-button delete" onClick={() => {
                  if (window.confirm('Are you sure you want to delete this buyer?')) {
                    handleBuyerDelete(selectedBuyer.id);
                  }
                }}>
                  <span>🗑️</span> Delete
                </button>
              </div>
            )}
          </div>
          {selectedBuyer ? (
            <div className="details-summary">
              <div className="summary-row buyer-name-summary">
                <span className="summary-label">Company:</span>
                <span className="summary-value">
                  {selectedBuyer.companyName}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Address:</span>
                <span className="summary-value">{selectedBuyer.address}, {selectedBuyer.city}, {selectedBuyer.state} - {selectedBuyer.pincode}</span>
              </div>
              {selectedBuyer.gstin && (
                <div className="summary-row">
                  <span className="summary-label">GSTIN:</span>
                  <span className="summary-value">{selectedBuyer.gstin}</span>
                </div>
              )}
            </div>
          ) : (
            <button className="add-button" onClick={() => { syncDraft(); navigate('/buyer-list'); }}>
              Add Buyer
            </button>
          )}
        </section>

        <section className="form-section">
          <h2>Consignee Details</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="consignee"
                checked={consigneeType === 'same'}
                onChange={() => setConsigneeType('same')}
              />
              Show Consignee (Same as above)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="consignee"
                checked={consigneeType === 'not-required'}
                onChange={() => setConsigneeType('not-required')}
              />
              Consignee Not Required
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="consignee"
                checked={consigneeType === 'different'}
                onChange={() => setConsigneeType('different')}
              />
              Add Consignee (If different from above)
            </label>
          </div>
          {consigneeType === 'different' && (
            <div style={{ marginTop: '16px' }}>
              {isConsigneeSaved && consigneeData?.companyName ? (
                <div className="details-summary" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '13px' }}>✓ Consignee Details Saved</span>
                    <div className="buyer-actions" style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="action-button edit"
                        onClick={() => setIsConsigneeSaved(false)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-button delete"
                        style={{ marginLeft: '8px' }}
                        onClick={() => {
                          setConsigneeData({ companyName: '', address: '', gstin: '', state: '', stateCode: '' });
                          setIsConsigneeSaved(false);
                          syncDraft();
                        }}
                      >
                        <span>🗑️</span> Clear
                      </button>
                    </div>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Company:</span>
                    <span className="summary-value">{consigneeData.companyName}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Address:</span>
                    <span className="summary-value">{consigneeData.address}</span>
                  </div>
                  {consigneeData.gstin && (
                    <div className="summary-row">
                      <span className="summary-label">GSTIN:</span>
                      <span className="summary-value">{consigneeData.gstin}</span>
                    </div>
                  )}
                  {consigneeData.state && (
                    <div className="summary-row">
                      <span className="summary-label">State:</span>
                      <span className="summary-value">{consigneeData.state} {consigneeData.stateCode ? `(${consigneeData.stateCode})` : ''}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Consignee (Ship to) Address</h3>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Company / Receiver Name <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      value={consigneeData?.companyName || ''}
                      onChange={(e) => setConsigneeData({ ...consigneeData, companyName: e.target.value })}
                      placeholder="Enter Consignee Name"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Address <span style={{ color: 'red' }}>*</span></label>
                    <textarea
                      value={consigneeData?.address || ''}
                      onChange={(e) => setConsigneeData({ ...consigneeData, address: e.target.value })}
                      placeholder="Enter Complete Address"
                      rows={2}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>GSTIN</label>
                      <input
                        type="text"
                        value={consigneeData?.gstin || ''}
                        onChange={(e) => setConsigneeData({ ...consigneeData, gstin: e.target.value })}
                        placeholder="GSTIN"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>State</label>
                      <input
                        type="text"
                        value={consigneeData?.state || ''}
                        onChange={(e) => setConsigneeData({ ...consigneeData, state: e.target.value })}
                        placeholder="State"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 90px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>State Code</label>
                      <input
                        type="text"
                        value={consigneeData?.stateCode || ''}
                        onChange={(e) => setConsigneeData({ ...consigneeData, stateCode: e.target.value })}
                        placeholder="e.g. 06"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!consigneeData?.companyName?.trim()) {
                        alert('Please enter Consignee Company / Receiver Name');
                        return;
                      }
                      setIsConsigneeSaved(true);
                      syncDraft();
                    }}
                    style={{
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 20px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Save Consignee
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="form-section">
          <h2>GST Type</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="gst-type"
                checked={gstType === 'auto'}
                onChange={() => setGstType('auto')}
              />
              Auto (Based on State)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="gst-type"
                checked={gstType === 'igst'}
                onChange={() => setGstType('igst')}
              />
              IGST Only
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="gst-type"
                checked={gstType === 'sgst'}
                onChange={() => setGstType('sgst')}
              />
              SGST/CGST Only
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="gst-type"
                checked={gstType === 'both'}
                onChange={() => setGstType('both')}
              />
              Both (IGST + SGST/CGST)
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Product Details</h2>
            {invoiceProducts.length > 0 && (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => { syncDraft(); navigate('/product-list'); }}>
                  Edit List
                </button>
                <button className="action-button see" onClick={() => { syncDraft(); navigate('/product-list'); }}>
                  See List
                </button>
                <button className="action-button delete" onClick={() => {
                  if (window.confirm('Are you sure you want to remove all products from this invoice?')) {
                    setInvoiceProducts([]);
                  }
                }}>
                  <span>🗑️</span> Remove All
                </button>
              </div>
            )}
          </div>
          {invoiceProducts.length > 0 ? (
            <div className="details-summary">
              {invoiceProducts.map((product, index) => (
                <div key={product.id || index} className="product-summary">
                  <div className="summary-row">
                    <span className="summary-label">Name:</span>
                    <span className="summary-value">{product.name}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Quantity:</span>
                    <input
                      type="number"
                      value={product.quantity || 1}
                      onChange={(e) => {
                        const newQty = parseFloat(e.target.value) || 0;
                        setInvoiceProducts(currentProducts =>
                          currentProducts.map(p =>
                            p.id === product.id ? { ...p, quantity: newQty } : p
                          )
                        );
                      }}
                      className="quantity-input"
                      min="0"
                    />
                    <span className="summary-value unit-label">{product.unit || 'pcs'}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Price:</span>
                    <span className="summary-value">₹{product.salePrice || 0}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="summary-label">Total:</span>
                    <span className="summary-value">₹{((product.quantity || 1) * (product.salePrice || 0)).toFixed(2)}</span>
                  </div>
                  <div className="item-actions">
                    <button className="action-button delete small" onClick={() => {
                      if (window.confirm('Remove this product from invoice?')) {
                        setInvoiceProducts(currentProducts => currentProducts.filter(p => p.id !== product.id));
                      }
                    }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button className="add-button" onClick={() => { syncDraft(); navigate('/product-list'); }}>
                Add More Products From List
              </button>
            </div>
          ) : (
            <button className="add-button" onClick={() => { syncDraft(); navigate('/product-list'); }}>
              Add Product From List
            </button>
          )}
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Discount Details ( Optional )</h2>
          </div>
          <div className="detail-row">
            <div className="detail-field">
              <label>Discount Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="Enter discount (%)"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>TDS Details ( Optional )</h2>
          </div>
          <div className="detail-row" style={{ alignItems: 'center', gap: '16px' }}>
            <div className="detail-field" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row', flex: 'none' }}>
              <input
                type="checkbox"
                id="tdsEnabled"
                checked={tdsEnabled}
                onChange={(e) => setTdsEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="tdsEnabled" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600 }}>
                Enable TDS Deduction
              </label>
            </div>
            {tdsEnabled && (
              <div className="detail-field">
                <label>TDS Rate</label>
                <select
                  value={tdsPercent}
                  onChange={(e) => setTdsPercent(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value={2}>2% - (194C / 194J etc.)</option>
                  <option value={10}>10% - (194J Professional / Royalty)</option>
                </select>
              </div>
            )}
          </div>
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Advance Payment ( Optional )</h2>
          </div>
          <div className="detail-row">
            <div className="detail-field">
              <label>Advance Amount Paid / Received (₹)</label>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                placeholder="Enter advance amount (e.g. 30000)"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Transportation Details ( Optional )</h2>
            {transportData && (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => { syncDraft(); navigate('/transportation-details'); }}>
                  Edit
                </button>
                <button className="action-button delete" onClick={() => {
                  if (window.confirm('Are you sure you want to delete transportation details?')) {
                    setTransportData(null);
                  }
                }}>
                  <span>🗑️</span> Delete
                </button>
              </div>
            )}
          </div>
          {transportData ? (
            <div className="details-summary">
              <div className="summary-row">
                <span className="summary-label">Mode:</span>
                <span className="summary-value">{transportData.transportMode}</span>
              </div>
              {transportData.vehicleNumber && (
                <div className="summary-row">
                  <span className="summary-label">Vehicle No:</span>
                  <span className="summary-value">{transportData.vehicleNumber}</span>
                </div>
              )}
              {transportData.deliveryDate && (
                <div className="summary-row">
                  <span className="summary-label">Delivery Date:</span>
                  <span className="summary-value">{transportData.deliveryDate}</span>
                </div>
              )}
            </div>
          ) : (
            <button className="add-button" onClick={() => { syncDraft(); navigate('/transportation-details'); }}>
              Add Transportation details
            </button>
          )}
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Other Details ( Optional )</h2>
            {otherData && (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => { syncDraft(); navigate('/other-details'); }}>
                  Edit
                </button>
                <button className="action-button delete" onClick={() => {
                  if (window.confirm('Are you sure you want to delete other details?')) {
                    setOtherData(null);
                  }
                }}>
                  <span>🗑️</span> Delete
                </button>
              </div>
            )}
          </div>
          {otherData ? (
            <div className="details-summary">
              {otherData.poNumber && <div className="summary-row"><span className="summary-label">PO No:</span> <span className="summary-value">{otherData.poNumber}</span></div>}
              {otherData.poDate && <div className="summary-row"><span className="summary-label">PO Date:</span> <span className="summary-value">{otherData.poDate}</span></div>}
              {otherData.paymentTerms && <div className="summary-row"><span className="summary-label">Payment Terms:</span> <span className="summary-value">{otherData.paymentTerms}</span></div>}
              {otherData.termsOfDelivery && <div className="summary-row"><span className="summary-label">Terms of Delivery:</span> <span className="summary-value">{otherData.termsOfDelivery}</span></div>}
              {otherData.ewayBillNumber && <div className="summary-row"><span className="summary-label">E-Way Bill:</span> <span className="summary-value">{otherData.ewayBillNumber}</span></div>}
            </div>
          ) : (
            <button className="add-button" onClick={() => { syncDraft(); navigate('/other-details'); }}>
              Add Other Details
            </button>
          )}
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Bank Details ( Optional )</h2>
            {bankData && bankData.bankName && bankData.accountNumber ? (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => { syncDraft(); navigate('/bank-details'); }}>
                  Edit
                </button>
                <button className="action-button see" style={{ background: '#2196f3', color: 'white', marginLeft: 8 }} onClick={() => {
                  syncDraft();
                  navigate('/bank-details');
                }}>
                  See
                </button>
                <button className="action-button delete" style={{ background: '#f44336', color: 'white', marginLeft: 8 }} onClick={() => {
                  if (window.confirm('Are you sure you want to delete bank details?')) {
                    setBankData(null);
                    localStorage.removeItem('savedBankDetails');
                  }
                }}>
                  Delete
                </button>
              </div>
            ) : null}
          </div>
          {bankData && bankData.bankName && bankData.accountNumber ? (
            <div className="details-summary">
              <div className="summary-row"><span className="summary-label">Bank:</span> <span className="summary-value">{bankData.bankName}</span></div>
              <div className="summary-row"><span className="summary-label">Account:</span> <span className="summary-value">{bankData.accountNumber}</span></div>
              {bankData.ifscCode && <div className="summary-row"><span className="summary-label">IFSC:</span> <span className="summary-value">{bankData.ifscCode}</span></div>}
            </div>
          ) : (
            <button className="add-button" onClick={() => { syncDraft(); navigate('/bank-details'); }}>
              <span>Add Bank Details</span>
            </button>
          )}
        </section>

        <section className="form-section terms">
          <h2>Terms and Conditions</h2>
          <div className="terms-text">
            <p>1. This is an electronically generated document.</p>
            <p>2. All disputes are subject to SELLER CITY jurisdiction</p>
          </div>
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Add Signature ( Optional )</h2>
            {showSignature && (
              <div className="buyer-actions">
                <button className="action-button edit" onClick={() => setShowSignature(false)}>
                  Edit
                </button>
                <button className="action-button delete" onClick={() => {
                  if (window.confirm('Are you sure you want to remove the signature?')) {
                    setShowSignature(false);
                    setSignatureImage(null);
                  }
                }}>
                  <span>🗑️</span> Delete
                </button>
              </div>
            )}
          </div>

          <div className="signature-section">
            <div className="toggle-container">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showSignature}
                  onChange={(e) => setShowSignature(e.target.checked)}
                />
                <div className={`toggle-track ${showSignature ? 'active' : ''}`}>
                  <div className="toggle-thumb"></div>
                </div>
                <span>Include signature in invoice</span>
              </label>
            </div>

            {showSignature && (
              <div className="signature-content">
                <div className="signature-type-selector">
                  <button
                    className={`type-button ${signatureType === 'upload' ? 'active' : ''}`}
                    onClick={() => {
                      setSignatureType('upload');
                      if (!signatureImage && fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    Upload Signature
                  </button>
                  <button
                    className={`type-button ${signatureType === 'draw' ? 'active' : ''}`}
                    onClick={() => setSignatureType('draw')}
                  >
                    Draw Signature
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSignatureUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {signatureType === 'upload' && (
                  <div className="signature-upload">
                    {signatureImage ? (
                      <div className="signature-preview">
                        <img src={signatureImage} alt="Signature" />
                        <button className="delete-signature" onClick={handleDeleteSignature}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <span>Click to upload signature image</span>
                      </div>
                    )}
                  </div>
                )}

                {signatureType === 'draw' && (
                  <div className="signature-draw-container">
                    {signatureImage ? (
                      <div className="signature-preview">
                        <img src={signatureImage} alt="Signature" />
                        <button className="delete-signature" onClick={handleDeleteSignature}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <SignatureCanvas onSave={handleSignatureSave} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateInvoice;


