# Firebase Setup for Blood Buddy Map

This guide will help you set up Firebase Firestore for the Blood Buddy Map application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "blood-buddy-map")
4. Choose your preferred location
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll update the rules)
4. Select a location for your database
5. Click "Enable"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon) → General
2. Under "Your apps", click the web icon (`</>`)
3. Register your app with a nickname
4. Copy the `firebaseConfig` object

## 4. Update Firebase Configuration

Replace the placeholder config in `src/lib/firebase.ts` with your actual configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Deploy Security Rules

### Option A: Using Firebase CLI

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option B: Using Firebase Console

1. Go to Firestore Database → Rules tab
2. Replace the existing rules with the content from `firestore.rules`
3. Click "Publish"

## 6. Security Rules

The current security rules allow public CRUD operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write, update, delete: if true;
    }
  }
}
```

⚠️ **WARNING**: These rules allow anyone to access your database. For production, consider implementing proper authentication and more restrictive rules.

## 7. Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the provided URL

## 8. Test the Integration

- The app will now load data from Firestore instead of mock data
- You can add new donors through the registration form
- All changes will be saved to Firestore in real-time
- The map will update automatically when data changes

## Data Structure

The donors are stored in the `donors` collection with the following structure:

```typescript
{
  name: string,
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
  phone: string,
  lastDonated: string (YYYY-MM-DD format),
  lat: number,
  lng: number,
  status: 'active' | 'inactive'
}
```

## Production Considerations

For production use, consider:

1. **Authentication**: Implement Firebase Authentication
2. **Security Rules**: Create more restrictive rules based on user authentication
3. **Validation**: Add Firestore data validation rules
4. **Indexing**: Set up proper database indexes for better performance
5. **Error Handling**: Implement proper error handling and retry logic

## Troubleshooting

- **Permission Denied**: Check that your Firestore rules are properly deployed
- **Configuration Error**: Ensure your Firebase config is correctly updated
- **Network Error**: Check your internet connection and Firebase project status
