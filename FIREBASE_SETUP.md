# Firebase Setup Guide for Invoice App

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "invoice-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`) to add a web app
4. Enter app nickname (e.g., "invoice-web-app")
5. Click "Register app"
6. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory of your project
2. Copy the content from `src/firebase/env.example`
3. Replace the placeholder values with your actual Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-actual-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
REACT_APP_FIREBASE_APP_ID=your-actual-app-id
```

## Step 5: Set Firestore Security Rules (Optional)

For development, you can use these rules in Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Only for development!
    }
  }
}
```

**Warning**: These rules allow anyone to read/write your database. For production, implement proper authentication and security rules.

## Step 6: Test the Integration

1. Start your React app: `npm start`
2. Create a new invoice
3. Check Firebase Console > Firestore Database to see your data
4. Edit/delete invoices and verify real-time updates

## Features Added

- ✅ Real-time data synchronization
- ✅ Cloud storage for invoices
- ✅ Automatic data backup
- ✅ Multi-device access
- ✅ Offline support (with Firebase SDK)

## Troubleshooting

### Common Issues:

1. **"Firebase: No Firebase App '[DEFAULT]' has been created"**
   - Check your Firebase configuration values
   - Ensure `.env` file is in the root directory
   - Restart your development server

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Ensure you're using the correct project ID

3. **Data not syncing**
   - Check browser console for errors
   - Verify Firebase project is active
   - Check network connection

### Support

If you encounter issues, check:
- Firebase Console for error logs
- Browser console for JavaScript errors
- Network tab for failed requests


