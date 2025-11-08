
'use client';

import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/language-context';


export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const { translations } = useLanguage();

  const t = (key: string) => {
    return translations[key] || key;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-foreground">
            {t('appName')}
          </h1>
        </div>
        <Progress value={progress} className="w-48 h-1.5" />
      </div>
    </div>
  );
}
