
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, Menu, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function Header() {
  const pathname = usePathname();
  const [isTelegram, setIsTelegram] = useState(false);
  const { language, setLanguage, translations } = useLanguage();
  const [theme, setTheme] = useState('dark');

  const t = (key: string) => {
    return translations[key] || key;
  };

  const navigation = [
    { name: t('market'), href: '/' },
    { name: t('inventory'), href: '/inventory' },
    { name: t('auction'), href: '/auction' },
    { name: t('profile'), href: '/profile' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.Telegram && window.Telegram.WebApp) {
        setIsTelegram(true);
        window.Telegram.WebApp.ready();
      }
      const storedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(storedTheme);
      document.documentElement.className = storedTheme;
    }
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem('theme', value);
    document.documentElement.className = value;
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              {t('appName')}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="md:hidden">
            <Sheet>
            <SheetTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                aria-label={t('openNavigation')}
                >
                <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <Link href="/" className="flex items-center">
                <Gift className="h-6 w-6 text-primary" />
                <span className="ml-2 font-bold font-headline">{t('appName')}</span>
                </Link>
                <div className="mt-8 flex flex-col space-y-4">
                {navigation.map((item) => (
                    <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                        'text-lg font-medium transition-colors hover:text-foreground/80',
                        pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                    )}
                    >
                    {item.name}
                    </Link>
                ))}
                </div>
            </SheetContent>
            </Sheet>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button variant="outline" className="font-semibold">
              0 UZS
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary ml-2">
                  <Plus className="h-4 w-4" />
              </div>
            </Button>
          <Button className="font-bold hidden sm:flex">
             {isTelegram ? t('connected') : t('connectWallet')}
          </Button>
           <Dialog>
              <DialogTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5 text-foreground" />
                 </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>{t('settings')}</DialogTitle>
                 </DialogHeader>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="language">{t('language')}</Label>
                       <Select value={language} onValueChange={(value) => setLanguage(value as 'uz' | 'ru' | 'en')}>
                          <SelectTrigger id="language">
                             <SelectValue placeholder={t('selectLanguage')} />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="uz">O'zbek</SelectItem>
                             <SelectItem value="ru">Русский</SelectItem>
                             <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="theme">{t('theme')}</Label>
                       <Select value={theme} onValueChange={handleThemeChange}>
                          <SelectTrigger id="theme">
                             <SelectValue placeholder={t('selectTheme')} />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="light">{t('light')}</SelectItem>
                             <SelectItem value="dark">{t('dark')}</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </DialogContent>
           </Dialog>
        </div>
      </div>
    </header>
  );
}
