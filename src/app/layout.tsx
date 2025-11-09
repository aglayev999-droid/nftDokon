
'use client';
import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BottomNav from '@/components/bottom-nav';
import LoadingScreen from '@/components/loading-screen';
import { LanguageProvider } from '@/context/language-context';
import { WalletProvider } from '@/context/wallet-context';
import { NftProvider } from '@/context/nft-context';
import { FirebaseClientProvider } from '@/firebase';
import { TelegramUserProvider } from '@/context/telegram-user-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <TelegramUserProvider>
        <FirebaseClientProvider>
          <WalletProvider>
            <NftProvider>
              <html lang="uz">
                <head>
                  <link rel="preconnect" href="https://fonts.googleapis.com" />
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                  <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                  />
                  <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                  />
                </head>
                <body className="font-body antialiased min-h-screen flex flex-col">
                  {loading ? (
                    <LoadingScreen />
                  ) : (
                    <>
                      <Header />
                      <main className="flex-grow pb-16 md:pb-0">{children}</main>
                      <Footer />
                      <Toaster />
                      <BottomNav />
                    </>
                  )}
                </body>
              </html>
            </NftProvider>
          </WalletProvider>
        </FirebaseClientProvider>
      </TelegramUserProvider>
    </LanguageProvider>
  );
}
