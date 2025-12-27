import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Friday AI',
  description: 'Ghi nhận chi tiêu cực nhanh bằng giọng nói với sự hỗ trợ của Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-mesh-gradient min-h-screen text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

