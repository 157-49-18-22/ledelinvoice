// Firebase service for invoice operations
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const INVOICES_COLLECTION = 'invoices';

// Helper function to convert Firestore data to plain JS objects
const convertTimestamps = (data) => {
  if (data === null || typeof data !== 'object') return data;
  
  // Convert Firestore Timestamp to Date
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }
  
  // Handle objects
  const result = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      result[key] = convertTimestamps(data[key]);
    }
  }
  return result;
};

// Helper function to clean data for Firestore
const cleanDataForFirestore = (data) => {
  if (data === null || data === undefined) {
    return null;
  }
  
  // Convert Date objects to Firestore Timestamp
  if (data instanceof Date) {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(cleanDataForFirestore);
  }
  
  // Handle plain objects
  if (typeof data === 'object') {
    const result = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        result[key] = cleanDataForFirestore(data[key]);
      }
    }
    return result;
  }
  
  // Return primitives as is
  return data;
};

// Add a new invoice
export const addInvoice = async (invoiceData) => {
  try {
    console.log('🔥 Firebase: Attempting to add invoice to Firestore...');
    
    // Clean all data before sending to Firestore
    const cleanedData = cleanDataForFirestore(invoiceData);
    
    // Prepare the invoice data
    const invoiceToAdd = {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('🔥 Firebase: Prepared invoice data:', invoiceToAdd);
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), invoiceToAdd);
    console.log('✅ Firebase: Invoice added successfully with ID: ', docRef.id);
    
    // Return the saved invoice with the new ID
    return { 
      id: docRef.id, 
      ...invoiceData, // Return original data, not the cleaned one
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Firebase: Error adding invoice: ', error);
    console.error('❌ Firebase: Error details:', error.message);
    throw error;
  }
};

// Update an existing invoice
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    
    // Clean all data before sending to Firestore
    const cleanedData = cleanDataForFirestore(invoiceData);
    
    const updateData = {
      ...cleanedData,
      updatedAt: serverTimestamp()
    };
    
    console.log('🔥 Firebase: Updating invoice with data:', updateData);
    
    await updateDoc(invoiceRef, updateData);
    console.log('✅ Firebase: Invoice updated successfully');
    
    return { 
      id: invoiceId, 
      ...invoiceData, // Return original data, not the cleaned one
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Firebase: Error updating invoice: ', error);
    throw error;
  }
};

// Delete an invoice
export const deleteInvoice = async (invoiceId) => {
  try {
    await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    console.log('Invoice deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting invoice: ', error);
    throw error;
  }
};

// Get all invoices
export const getAllInvoices = async () => {
  try {
    const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...convertTimestamps(data),
        id: doc.id
      };
    });
  } catch (error) {
    console.error('❌ Firebase: Error getting invoices: ', error);
    throw error;
  }
};

// Real-time listener for invoices
export const subscribeToInvoices = (callback) => {
  const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const invoices = querySnapshot.docs.map(doc => ({
      ...convertTimestamps(doc.data()),
      id: doc.id
    }));
    callback(invoices);
  }, (error) => {
    console.error('Error listening to invoices:', error);
  });
};
