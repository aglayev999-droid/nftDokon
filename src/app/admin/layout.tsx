
'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/admin-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect non-admins to the homepage
    if (typeof window !== 'undefined') {
      router.replace('/');
    }
    return null; // Render nothing while redirecting
  }

  const getActiveTab = () => {
    if (pathname.startsWith('/admin/history')) return 'history';
    return 'accounts'; // Default to accounts
  }


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Foydalanuvchilarni boshqarish va tranzaksiyalarni kuzatish.</p>
      </div>

      <Tabs value={getActiveTab()} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="accounts" asChild>
            <Link href="/admin/accounts">Hisoblar</Link>
          </TabsTrigger>
          <TabsTrigger value="history" asChild>
            <Link href="/admin/history">Tarix</Link>
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
