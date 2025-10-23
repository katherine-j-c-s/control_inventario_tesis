'use client';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import QrScannerContent from './QrScannerContent';
import { useRouter } from "next/navigation";


export default function QrScannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);
  return (
    <AuthProvider>
      <QrScannerContent />
    </AuthProvider>
  );
}
