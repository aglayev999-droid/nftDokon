
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LayoutGrid, User, Gavel, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useAdmin } from '@/context/admin-context';

export default function BottomNav() {
  const pathname = usePathname();
  const { translations } = useLanguage();
  const { isAdmin } = useAdmin();

  const t = (key: string) => {
    return translations[key] || key;
  };
  
  let navigation = [
    { name: t('market'), href: '/', icon: Store },
    { name: t('inventory'), href: '/inventory', icon: LayoutGrid },
    { name: t('auction'), href: '/auction', icon: Gavel },
    { name: t('profile'), href: '/profile', icon: User },
  ];

  if (isAdmin) {
    // Add admin link if user is an admin
    navigation.splice(2, 0, { name: 'Admin', href: '/admin', icon: Shield });
  }

  // Ensure only 4 or 5 items are shown to fit the layout
  const displayedNavigation = navigation.length > 4 && !isAdmin 
      ? navigation.filter(item => item.name !== 'Admin') // Fallback for safety
      : navigation;


  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border/40">
      <div className={cn(
        "grid h-full max-w-lg mx-auto font-medium",
        isAdmin ? "grid-cols-5" : "grid-cols-4"
      )}>
        {displayedNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-3 hover:bg-muted/50 group',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs text-center">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
