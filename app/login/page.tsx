'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginScreen from '@/components/LoginScreen';
import { signInWithGoogle, getCurrentUser } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Nếu đã đăng nhập, redirect về home
    const user = getCurrentUser();
    if (user) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // Redirect về home sau khi login thành công
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Đăng nhập thất bại: ' + (error?.message || 'Lỗi không xác định'));
    }
  };

  return <LoginScreen onLogin={handleLogin} />;
}

