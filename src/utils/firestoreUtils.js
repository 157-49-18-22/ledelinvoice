/**
 * Prepares JavaScript objects for Firestore by converting complex types to Firestore-compatible formats
 * @param {*} data - The data to prepare for Firestore
 * @returns {*} - Firestore-compatible data
 */
export const prepareForFirestore = (data) => {
  // Handle primitive types and null/undefined
  if (data === null || typeof data !== 'object' || data instanceof Date) {
    return data instanceof Date ? data.toISOString() : data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => prepareForFirestore(item));
  }

  // Handle objects
  const result = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      result[key] = prepareForFirestore(data[key]);
    }
  }
  return result;
};

/**
 * Converts Firestore data back to application format
 * @param {*} data - The data from Firestore
 * @returns {*} - Application-formatted data
 */
export const fromFirestore = (data) => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => fromFirestore(item));
  }

  const result = {};
  for (const key in data) {
    result[key] = fromFirestore(data[key]);
  }
  return result;
};
