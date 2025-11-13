
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the default admin tab.
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/accounts');
  }, [router]);

  return null; // Nothing to render, will redirect immediately
}
