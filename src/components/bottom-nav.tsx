
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LayoutGrid, User, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export default function BottomNav() {
  const pathname = usePathname();
  const { translations } = useLanguage();

  const t = (key: string) => {
    return translations[key] || key;
  };
  
  const navigation = [
    { name: t('market'), href: '/', icon: Store },
    { name: t('inventory'), href: '/inventory', icon: LayoutGrid },
    { name: t('auction'), href: '/auction', icon: Gavel },
    { name: t('profile'), href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border/40">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
