import React, { useState, useEffect } from 'react';
import InvoiceDashboard from './components/InvoiceDashboard';
import CreateInvoice from './components/CreateInvoice';
import './App.css'; // Optional: Add global styles if needed

// Import Firebase functions
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Wait for Firebase to be available from index.html
let app, db;

// Function to initialize Firebase when available
const initFirebase = () => {
  if (window.firebaseApp && window.firebaseDb) {
    app = window.firebaseApp;
    db = window.firebaseDb;
    console.log('🔥 Firebase initialized from global window:', app);
    console.log('🔥 Firestore database object:', db);
    return true;
  }
  return false;
};

// Check if Firebase is already available
if (!initFirebase()) {
  // If not available, wait for it
  const checkFirebase = setInterval(() => {
    if (initFirebase()) {
      clearInterval(checkFirebase);
    }
  }, 100);
}

// Firebase service functions
const INVOICES_COLLECTION = 'invoices';

const addInvoice = async (invoiceData) => {
  try {
    console.log('🔥 Firebase: Attempting to add invoice to Firestore...');
    console.log('🔥 Firebase: Database object:', db);
    console.log('🔥 Firebase: Invoice data:', invoiceData);
    
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Firebase: Invoice added successfully with ID: ', docRef.id);
    return { id: docRef.id, ...invoiceData };
  } catch (error) {
    console.error('❌ Firebase: Error adding invoice: ', error);
    console.error('❌ Firebase: Error details:', error.message);
    throw error;
  }
};

const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: new Date()
    });
    console.log('Invoice updated successfully');
    return { id: invoiceId, ...invoiceData };
  } catch (error) {
    console.error('Error updating invoice: ', error);
    throw error;
  }
};

const deleteInvoice = async (invoiceId) => {
  try {
    await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    console.log('Invoice deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting invoice: ', error);
    throw error;
  }
};

const subscribeToInvoices = (callback) => {
  const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    callback(invoices);
  }, (error) => {
    console.error('Error listening to invoices: ', error);
  });
};

function App() {
  const [invoices, setInvoices] = useState([]);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'create'
  const [editingInvoice, setEditingInvoice] = useState(null); // Store invoice data for editing/duplicating
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToInvoices((invoicesData) => {
      setInvoices(invoicesData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- Handler Functions for InvoiceDashboard Actions ---

  const handleDeleteInvoice = async (invoiceIdToDelete) => {
    console.log(`[App handleDelete] Attempting to delete invoice ID: ${invoiceIdToDelete}`);
    try {
      await deleteInvoice(invoiceIdToDelete);
      console.log('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice. Please try again.');
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
    console.log('[App] Updating status for invoice:', invoiceId, 'to', newStatus);
    try {
      await updateInvoice(invoiceId, { status: newStatus });
      console.log('Invoice status updated successfully');
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Error updating invoice status. Please try again.');
    }
  };

  const handleEditInvoice = (invoiceToEdit) => {
    console.log('[App] Setting invoice to edit:', invoiceToEdit);
    setEditingInvoice(invoiceToEdit); 
    setActiveView('create');
  };

  const handleDuplicateInvoice = (invoiceToDuplicate) => {
    console.log('[App] Preparing to duplicate invoice:', invoiceToDuplicate.id);
    const newInvoiceData = {
      ...invoiceToDuplicate,
      id: null, // Remove ID to generate a new one on save
      date: '', 
      number: '', 
      prefix: '', // Assuming prefix exists, clear it too
      status: 'Unpaid', // Reset status
      // Clear any other fields that shouldn't be copied (e.g., payment details)
    };
    console.log('[App] Setting duplicated data for create form:', newInvoiceData);
    setEditingInvoice(newInvoiceData); 
    setActiveView('create');
  };

  // --- Handler Functions for CreateInvoice View ---

  const handleShowCreateInvoice = () => {
    console.log('[App] Showing create invoice screen (new).');
    setEditingInvoice(null); // Ensure no initial data for new invoice
    setActiveView('create');
  };

  const handleSaveInvoice = async (invoiceDataFromForm) => {
    console.log('[App] handleSaveInvoice called with:', invoiceDataFromForm);
    console.log('[App] handleSaveInvoice function:', handleSaveInvoice);
    console.log('[App] Attempting to save invoice:', invoiceDataFromForm);
    console.log('[App] Firebase app available:', !!app);
    console.log('[App] Firebase db available:', !!db);
    console.log('[App] handleSaveInvoice function name:', handleSaveInvoice.name);
    
    try {
      if (invoiceDataFromForm.id) {
        // Editing existing invoice
        console.log('[App] Updating existing invoice:', invoiceDataFromForm.id);
        await updateInvoice(invoiceDataFromForm.id, invoiceDataFromForm);
      } else {
        // Adding new invoice
        const newInvoiceWithDefaults = {
          ...invoiceDataFromForm,
          status: 'Unpaid' // Set default status
        };
        console.log('[App] Adding new invoice:', newInvoiceWithDefaults);
        await addInvoice(newInvoiceWithDefaults);
      }
      setActiveView('dashboard'); // Go back to dashboard
      setEditingInvoice(null); // Clear editing state
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice: ' + error.message);
    }
  };

  const handleCloseCreateInvoice = () => {
    console.log('[App] Closing create invoice screen.');
    setActiveView('dashboard');
    setEditingInvoice(null); // Clear editing state
  };

  // --- Render Logic ---

  console.log(`[App Render] Active view: ${activeView}, Editing Invoice ID: ${editingInvoice?.id}`);

  // Show loading state while Firebase is connecting
  if (loading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {activeView === 'dashboard' && (
        <InvoiceDashboard
          invoices={invoices}
          onCreateInvoice={handleShowCreateInvoice}
          // Pass down the action handlers
          onEditInvoice={handleEditInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onDuplicateInvoice={handleDuplicateInvoice}
          onUpdateStatus={handleUpdateInvoiceStatus}
          // Add dummy props for now if needed by InvoiceDashboard
          activeTab={'all'} 
          onTabChange={(tabId) => console.log('[App] Tab changed:', tabId)}
          onFilterClick={() => console.log('[App] Filter clicked')} 
        />
      )}
      {activeView === 'create' && (
        <CreateInvoice
          onClose={handleCloseCreateInvoice}
          onSave={handleSaveInvoice}
          // Pass initial data for editing/duplicating
          // Note: CreateInvoice needs to handle this prop correctly
          initialInvoiceData={editingInvoice} 
        />
      )}
    </div>
  );
}

export default App; 