// Helper to persist and manage active invoice creation/editing draft across routes

const DRAFT_KEY = 'invoiceApp_currentDraft';

export const getDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error reading invoice draft:', err);
    return null;
  }
};

export const saveDraft = (data) => {
  try {
    const existing = getDraft() || {};
    const merged = { ...existing, ...data };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('Error saving invoice draft:', err);
    return data;
  }
};

export const updateDraftField = (field, value) => {
  try {
    const existing = getDraft() || {};
    existing[field] = value;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(existing));
    return existing;
  } catch (err) {
    console.error(`Error updating draft field ${field}:`, err);
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error('Error clearing invoice draft:', err);
  }
};
