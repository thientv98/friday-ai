<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Hs0knd9BtoFyUebE1EfbKKrPzX2bqQbW

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   yarn install
   # hoặc
   npm install
   ```

2. Tạo file `.env.local` và thêm các biến môi trường:
   ```bash
   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   - Lấy Gemini API key tại: https://ai.google.dev/
   - Lấy Firebase config tại: Firebase Console > Project Settings > General > Your apps

3. Chạy ứng dụng:
   ```bash
   yarn dev
   # hoặc
   npm run dev
   ```

4. Mở trình duyệt tại: http://localhost:3000

## Cấu trúc dự án

- `app/api/parse-expense/route.ts` - API route xử lý gọi Gemini (API key được bảo mật ở server-side)
- `services/geminiService.ts` - Client-side service gọi API route
- `app/page.tsx` - Trang chính của ứng dụng
- `components/` - Các React components

## Cấu hình Firestore Security Rules

**QUAN TRỌNG**: Bạn cần cấu hình Firestore Security Rules để ứng dụng có thể lưu dữ liệu.

### Cách 1: Qua Firebase Console (Khuyến nghị)

1. Mở [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Firestore Database** > **Rules**
4. Copy và paste nội dung từ file `firestore.rules` vào editor
5. Click **Publish**

### Cách 2: Qua Firebase CLI

1. Cài đặt Firebase CLI (nếu chưa có):
   ```bash
   npm install -g firebase-tools
   ```

2. Login vào Firebase:
   ```bash
   firebase login
   ```

3. Init Firebase project (nếu chưa):
   ```bash
   firebase init firestore
   ```

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Bảo mật

- API key của Gemini được lưu trong biến môi trường `GEMINI_API_KEY` và chỉ được sử dụng ở server-side (trong API routes). Không bao giờ expose API key ra frontend.
- Firestore Security Rules đảm bảo mỗi user chỉ có thể đọc/ghi data của chính họ.
