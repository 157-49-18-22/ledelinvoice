import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import InvoiceDashboard from './components/InvoiceDashboard';
import InvoiceFilter from './components/InvoiceFilter';
import CreateInvoice from './components/CreateInvoice';
import SupplierDetails from './components/SupplierDetails';
import BuyerList from './components/BuyerList';
import BuyerDetails from './components/BuyerDetails';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import TransportationDetails from './components/TransportationDetails';
import OtherDetails from './components/OtherDetails';
import BankDetails from './components/BankDetails';
import EInvoiceSetup from './components/EInvoiceSetup';
import { addInvoice, updateInvoice, deleteInvoice, subscribeToInvoices } from './firebase/invoiceService';
import { getDraft, saveDraft, updateDraftField, clearDraft } from './utils/draftManager';
import './App.css';

// Storage keys
const BUYERS_STORAGE_KEY = 'invoiceApp_allBuyers';
const PRODUCTS_STORAGE_KEY = 'invoiceApp_allProducts';

const initialBuyers = [
  {
    id: 1,
    companyName: 'Cash Sale',
    address: '',
    gstin: '',
    state: '',
    city: '',
    pincode: ''
  },
  {
    id: 2,
    companyName: 'DEMO GST Register Party',
    address: 'Second Floor 106/3 Ava nti Vihar Road Raipur Raipur Chhattisgarh 492004,Raipur-492004',
    gstin: '22AAICG8226H1ZO',
    state: 'Chhattisgarh',
    city: 'Raipur',
    pincode: '492004'
  }
];

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

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

/* ----------------- Route Pages ----------------- */

function DashboardPage({
  invoices,
  activeTab,
  onTabChange,
  onDeleteInvoice,
  onCancelInvoice,
  onDuplicateInvoice,
  onConvertToTaxInvoice,
  onUpdateStatus,
  onSendEmail,
  onSendReminder
}) {
  const navigate = useNavigate();

  return (
    <InvoiceDashboard
      invoices={invoices}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateInvoice={() => {
        clearDraft();
        navigate('/create-invoice');
      }}
      onEditInvoice={(invoice) => {
        clearDraft();
        saveDraft(invoice);
        navigate(`/edit-invoice/${invoice.id}`);
      }}
      onFilterClick={() => navigate('/filter')}
      onDeleteInvoice={onDeleteInvoice}
      onCancelInvoice={onCancelInvoice}
      onDuplicateInvoice={onDuplicateInvoice}
      onConvertToTaxInvoice={onConvertToTaxInvoice}
      onUpdateStatus={onUpdateStatus}
      onSendEmail={onSendEmail}
      onSendReminder={onSendReminder}
    />
  );
}

function CreateInvoicePage({ onSave }) {
  const navigate = useNavigate();
  const draft = getDraft();

  return (
    <CreateInvoice
      onClose={() => {
        clearDraft();
        navigate('/');
      }}
      onSave={async (data) => {
        await onSave(data, null);
        clearDraft();
        navigate('/');
      }}
      initialInvoiceData={draft}
    />
  );
}

function EditInvoicePage({ invoices, onSave }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const foundInvoice = invoices.find(inv => String(inv.id) === String(id));
  const draft = getDraft();
  const invoiceData = draft || foundInvoice || null;

  return (
    <CreateInvoice
      onClose={() => {
        clearDraft();
        navigate('/');
      }}
      onSave={async (data) => {
        await onSave(data, id);
        clearDraft();
        navigate('/');
      }}
      initialInvoiceData={invoiceData}
    />
  );
}

const getReturnPath = () => {
  const draft = getDraft();
  return draft?.id ? `/edit-invoice/${draft.id}` : '/create-invoice';
};

function SupplierDetailsPage() {
  const navigate = useNavigate();
  const draft = getDraft();
  const returnPath = getReturnPath();

  return (
    <SupplierDetails
      onClose={() => navigate(returnPath)}
      onSave={(supplierData) => {
        updateDraftField('supplierData', supplierData);
        navigate(returnPath);
      }}
      initialData={draft?.supplierData || null}
    />
  );
}

function BuyerListPage({ buyers, setBuyers }) {
  const navigate = useNavigate();
  const returnPath = getReturnPath();

  const handleAddNew = () => {
    navigate('/buyer-details');
  };

  const handleEdit = (buyer) => {
    navigate('/buyer-details', { state: { buyer } });
  };

  const handleDelete = (buyerId) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      const updated = buyers.filter(b => b.id !== buyerId);
      setBuyers(updated);
      try {
        localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSelect = (buyer) => {
    updateDraftField('selectedBuyer', buyer);
    navigate(returnPath);
  };

  return (
    <BuyerList
      buyers={buyers}
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSelect={handleSelect}
      onClose={() => navigate(returnPath)}
    />
  );
}

function BuyerDetailsPage({ buyers, setBuyers }) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = getReturnPath();
  const editingBuyer = location.state?.buyer || null;

  const handleSave = (buyerData) => {
    let updated;
    const existingIndex = buyers.findIndex(b => b.id === buyerData.id);
    if (existingIndex > -1) {
      updated = [...buyers];
      updated[existingIndex] = buyerData;
    } else {
      const newBuyer = { ...buyerData, id: buyerData.id || Date.now() };
      updated = [...buyers, newBuyer];
    }
    setBuyers(updated);
    try {
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    updateDraftField('selectedBuyer', buyerData);
    navigate(returnPath);
  };

  return (
    <BuyerDetails
      onClose={() => navigate(returnPath)}
      onSave={handleSave}
      initialData={editingBuyer}
    />
  );
}

function ProductListPage({ products, setProducts }) {
  const navigate = useNavigate();
  const returnPath = getReturnPath();

  const handleAddNew = () => {
    navigate('/product-details');
  };

  const handleEdit = (product) => {
    navigate('/product-details', { state: { product } });
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSelect = (product) => {
    const draft = getDraft() || {};
    const prods = draft.products || [];
    updateDraftField('products', [...prods, { ...product, quantity: 1 }]);
    navigate(returnPath);
  };

  return (
    <ProductList
      products={products}
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSelect={handleSelect}
      onClose={() => navigate(returnPath)}
    />
  );
}

function ProductDetailsPage({ products, setProducts }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editingProduct = location.state?.product || null;

  const handleSave = (productData) => {
    let updated;
    const existingIndex = products.findIndex(p => p.id === productData.id);
    if (existingIndex > -1) {
      updated = [...products];
      updated[existingIndex] = productData;
    } else {
      const newProduct = { ...productData, id: productData.id || Date.now() };
      updated = [...products, newProduct];
    }
    setProducts(updated);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    navigate('/product-list');
  };

  return (
    <ProductDetails
      onClose={() => navigate('/product-list')}
      onSave={handleSave}
      initialData={editingProduct}
    />
  );
}

function TransportationDetailsPage() {
  const navigate = useNavigate();
  const draft = getDraft();
  const returnPath = getReturnPath();

  return (
    <TransportationDetails
      onClose={() => navigate(returnPath)}
      onSave={(data) => {
        updateDraftField('transportData', data);
        navigate(returnPath);
      }}
      initialData={draft?.transportData || null}
    />
  );
}

function OtherDetailsPage() {
  const navigate = useNavigate();
  const draft = getDraft();
  const returnPath = getReturnPath();

  return (
    <OtherDetails
      onClose={() => navigate(returnPath)}
      onSave={(data) => {
        updateDraftField('otherData', data);
        navigate(returnPath);
      }}
      initialData={draft?.otherData || null}
    />
  );
}

function BankDetailsPage() {
  const navigate = useNavigate();
  const draft = getDraft();
  const returnPath = getReturnPath();

  return (
    <BankDetails
      onClose={() => navigate(returnPath)}
      onSave={(data) => {
        updateDraftField('bankData', data);
        navigate(returnPath);
      }}
      initialData={draft?.bankData || null}
    />
  );
}

function FilterPage({ onApply }) {
  const navigate = useNavigate();

  return (
    <InvoiceFilter
      onClose={() => navigate(-1)}
      onApply={(filters) => {
        onApply(filters);
        navigate(-1);
      }}
    />
  );
}

function EInvoiceSetupPage() {
  const navigate = useNavigate();

  return (
    <EInvoiceSetup
      onClose={() => navigate(-1)}
    />
  );
}

/* ----------------- Main App Component ----------------- */

function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [buyers, setBuyers] = useState(() => loadFromStorage(BUYERS_STORAGE_KEY, initialBuyers));
  const [products, setProducts] = useState(() => loadFromStorage(PRODUCTS_STORAGE_KEY, initialProducts));

  // Load invoices from Firebase when app starts
  useEffect(() => {
    console.log('🔥 Setting up Firebase real-time listener for invoices...');
    const unsubscribe = subscribeToInvoices((firebaseInvoices) => {
      console.log('🔥 Firebase: Received invoices from Firestore:', firebaseInvoices);
      setInvoices(firebaseInvoices);
    });

    return () => {
      console.log('🔥 Cleaning up Firebase subscription...');
      unsubscribe();
    };
  }, []);

  const handleFilterApply = (filters) => {
    console.log('Filter applied:', filters);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      console.log(`🔥 [App] Deleting invoice with ID: ${invoiceId} from Firebase...`);
      await deleteInvoice(invoiceId);
      console.log('✅ [App] Invoice deleted successfully from Firebase');
    } catch (error) {
      console.error('❌ [App] Error deleting invoice from Firebase:', error);
      alert('Error deleting invoice. Please try again.');
    }
  };

  const handleCancelInvoice = async (invoiceId) => {
    try {
      console.log(`🔥 [App] Cancelling invoice with ID: ${invoiceId} in Firebase...`);
      const invoiceToUpdate = invoices.find(invoice => invoice.id === invoiceId);
      if (invoiceToUpdate) {
        await updateInvoice(invoiceId, { ...invoiceToUpdate, status: 'cancelled' });
        console.log('✅ [App] Invoice cancelled successfully in Firebase');
      }
    } catch (error) {
      console.error('❌ [App] Error cancelling invoice in Firebase:', error);
      alert('Error cancelling invoice. Please try again.');
    }
  };

  const handleDuplicateInvoice = async (invoice) => {
    try {
      console.log(`🔥 [App] Duplicating invoice with ID: ${invoice.id} in Firebase...`);
      const newInvoiceData = {
        ...invoice,
        number: `${invoice.number || invoice.id}-copy`,
        date: new Date().toLocaleDateString('en-IN'),
        status: 'unpaid'
      };
      delete newInvoiceData.id;
      await addInvoice(newInvoiceData);
      console.log('✅ [App] Invoice duplicated successfully in Firebase');
    } catch (error) {
      console.error('❌ [App] Error duplicating invoice in Firebase:', error);
      alert('Error duplicating invoice. Please try again.');
    }
  };

  const handleUpdateStatus = async (invoiceId, status) => {
    try {
      console.log(`🔥 [App] Updating status for invoice ID: ${invoiceId} to ${status} in Firebase...`);
      const invoiceToUpdate = invoices.find(invoice => invoice.id === invoiceId);
      if (invoiceToUpdate) {
        await updateInvoice(invoiceId, { ...invoiceToUpdate, status });
        console.log('✅ [App] Invoice status updated successfully in Firebase');
      }
    } catch (error) {
      console.error('❌ [App] Error updating invoice status in Firebase:', error);
      alert('Error updating invoice status. Please try again.');
    }
  };

  const handleConvertToTaxInvoice = async (invoiceId) => {
    try {
      console.log(`🔥 [App] Converting proforma invoice ID: ${invoiceId} to tax invoice in Firebase...`);
      const invoiceToUpdate = invoices.find(invoice => invoice.id === invoiceId);
      if (invoiceToUpdate) {
        await updateInvoice(invoiceId, {
          ...invoiceToUpdate,
          type: 'tax-invoice',
          invoiceType: 'tax-invoice',
          status: 'unpaid'
        });
        console.log('✅ [App] Invoice converted successfully in Firebase');
      }
    } catch (error) {
      console.error('❌ [App] Error converting invoice in Firebase:', error);
      alert('Error converting invoice. Please try again.');
    }
  };

  const handleSendEmail = (invoiceId) => {
    console.log(`[App handleSendEmail] Would send email for invoice ID: ${invoiceId}`);
    alert(`Email would be sent for invoice ${invoiceId} in a real application`);
  };

  const handleSendReminder = (invoiceId) => {
    console.log(`[App handleSendReminder] Would send reminder for invoice ID: ${invoiceId}`);
    alert(`Payment reminder would be sent for invoice ${invoiceId} in a real application`);
  };

  const handleSaveInvoice = async (invoiceData, editingId = null) => {
    try {
      console.log('🔥 [App] Starting to save invoice to Firebase...', { invoiceData, editingId });

      const targetId = editingId || invoiceData.id;

      if (targetId) {
        console.log('🔥 [App] Updating existing invoice in Firebase...');
        const updatedInvoiceData = {
          ...invoiceData,
          type: invoiceData.invoiceType || 'tax-invoice',
          amount: invoiceData.amount || 0,
          number: invoiceData.invoiceNo || String(invoices.length + 1),
          date: invoiceData.date || new Date().toLocaleDateString('en-IN'),
          status: invoiceData.status || 'unpaid',
          selectedBuyer: invoiceData.selectedBuyer || {},
          supplierData: invoiceData.supplierData || {},
          products: invoiceData.products || [],
          transportData: invoiceData.transportData || {},
          otherData: invoiceData.otherData || {},
          bankData: invoiceData.bankData || {},
          includeSignature: invoiceData.includeSignature || false,
          signatureImage: invoiceData.signatureImage || null
        };
        await updateInvoice(targetId, updatedInvoiceData);
        console.log('✅ [App] Invoice updated successfully in Firebase');
      } else {
        console.log('🔥 [App] Creating new invoice in Firebase...');
        const newInvoiceData = {
          ...invoiceData,
          type: String(invoiceData.invoiceType || 'tax-invoice'),
          amount: Number(invoiceData.amount) || 0,
          number: String(invoiceData.invoiceNo || (invoices.length + 1)),
          date: invoiceData.date ? new Date(invoiceData.date).toISOString() : new Date().toISOString(),
          status: 'unpaid',
          selectedBuyer: invoiceData.selectedBuyer && typeof invoiceData.selectedBuyer === 'object'
            ? { ...invoiceData.selectedBuyer }
            : {},
          supplierData: invoiceData.supplierData && typeof invoiceData.supplierData === 'object'
            ? { ...invoiceData.supplierData }
            : {},
          products: Array.isArray(invoiceData.products)
            ? invoiceData.products.map(p => ({
                ...p,
                price: Number(p.price) || 0,
                quantity: Number(p.quantity) || 0,
                total: (Number(p.price) || 0) * (Number(p.quantity) || 0)
              }))
            : [],
          transportData: invoiceData.transportData && typeof invoiceData.transportData === 'object'
            ? { ...invoiceData.transportData }
            : {},
          otherData: invoiceData.otherData && typeof invoiceData.otherData === 'object'
            ? { ...invoiceData.otherData }
            : {},
          bankData: invoiceData.bankData && typeof invoiceData.bankData === 'object'
            ? { ...invoiceData.bankData }
            : {},
          includeSignature: Boolean(invoiceData.includeSignature),
          signatureImage: invoiceData.signatureImage || null,
          gstType: invoiceData.gstType || 'auto'
        };
        await addInvoice(newInvoiceData);
        console.log('✅ [App] Invoice created successfully in Firebase');
      }
    } catch (error) {
      console.error('❌ [App] Error saving invoice to Firebase:', error);
      alert('Error saving invoice. Please try again.');
    }
  };

  return (
    <div className="app">
      <Routes>
        {/* Dashboard Routes */}
        <Route
          path="/"
          element={
            <DashboardPage
              invoices={invoices}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onDeleteInvoice={handleDeleteInvoice}
              onCancelInvoice={handleCancelInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onConvertToTaxInvoice={handleConvertToTaxInvoice}
              onUpdateStatus={handleUpdateStatus}
              onSendEmail={handleSendEmail}
              onSendReminder={handleSendReminder}
            />
          }
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/invoices" element={<Navigate to="/" replace />} />

        {/* Invoice Creation & Editing Routes */}
        <Route
          path="/create-invoice"
          element={<CreateInvoicePage onSave={handleSaveInvoice} />}
        />
        <Route
          path="/edit-invoice/:id"
          element={<EditInvoicePage invoices={invoices} onSave={handleSaveInvoice} />}
        />

        {/* Supplier Routes */}
        <Route path="/supplier-details" element={<SupplierDetailsPage />} />
        <Route path="/create-invoice/supplier" element={<SupplierDetailsPage />} />
        <Route path="/create-invoice/supplier-details" element={<SupplierDetailsPage />} />
        <Route path="/suppliers" element={<SupplierDetailsPage />} />

        {/* Buyer Routes */}
        <Route
          path="/buyer-list"
          element={<BuyerListPage buyers={buyers} setBuyers={setBuyers} />}
        />
        <Route
          path="/create-invoice/buyer-list"
          element={<BuyerListPage buyers={buyers} setBuyers={setBuyers} />}
        />
        <Route
          path="/buyers"
          element={<BuyerListPage buyers={buyers} setBuyers={setBuyers} />}
        />
        <Route
          path="/buyer-details"
          element={<BuyerDetailsPage buyers={buyers} setBuyers={setBuyers} />}
        />
        <Route
          path="/create-invoice/buyer-details"
          element={<BuyerDetailsPage buyers={buyers} setBuyers={setBuyers} />}
        />

        {/* Product Routes */}
        <Route
          path="/product-list"
          element={<ProductListPage products={products} setProducts={setProducts} />}
        />
        <Route
          path="/create-invoice/product-list"
          element={<ProductListPage products={products} setProducts={setProducts} />}
        />
        <Route
          path="/products"
          element={<ProductListPage products={products} setProducts={setProducts} />}
        />
        <Route
          path="/product-details"
          element={<ProductDetailsPage products={products} setProducts={setProducts} />}
        />
        <Route
          path="/create-invoice/product-details"
          element={<ProductDetailsPage products={products} setProducts={setProducts} />}
        />

        {/* Transportation Routes */}
        <Route path="/transportation-details" element={<TransportationDetailsPage />} />
        <Route path="/create-invoice/transportation-details" element={<TransportationDetailsPage />} />
        <Route path="/transportation" element={<TransportationDetailsPage />} />

        {/* Other Details Routes */}
        <Route path="/other-details" element={<OtherDetailsPage />} />
        <Route path="/create-invoice/other-details" element={<OtherDetailsPage />} />

        {/* Bank Details Routes */}
        <Route path="/bank-details" element={<BankDetailsPage />} />
        <Route path="/create-invoice/bank-details" element={<BankDetailsPage />} />

        {/* Setup & Filter Routes */}
        <Route path="/filter" element={<FilterPage onApply={handleFilterApply} />} />
        <Route path="/einvoice-setup" element={<EInvoiceSetupPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
