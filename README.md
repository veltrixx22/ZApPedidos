# ZapPedido MVP

No-login MVP for creating a public digital menu and receiving orders on WhatsApp.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with Firebase client variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. Start the app:

```bash
npm run dev
```

## Temporary Firestore rules for MVP testing

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /stores/{storeId} {
      allow read, write: if true;
    }

    match /products/{productId} {
      allow read, write: if true;
    }
  }
}
```

Warning: These rules are for MVP testing only. Before scaling, secure writes with authentication or server-side validation.
