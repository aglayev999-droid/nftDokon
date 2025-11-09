
'use client';

import Image from 'next/image';
import type { Nft } from '@/lib/data';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Tag, Timer } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useState, useEffect } from 'react';
import { LottiePlayer } from './lottie-player';

interface AuctionCardProps {
  nft: Nft;
}

export function AuctionCard({ nft }: AuctionCardProps) {
  const { translations } = useLanguage();
  const t = (key: string, params?: { [key: string]: string | number }) => {
    let translation = translations[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, String(params[param]));
      });
    }
    return translation;
  };

  const calculateTimeLeft = () => {
    const difference = +new Date(nft.endTime || 0) - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  }

  const bidAmount = (nft.highestBid || 0) * 1.05;

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:border-primary/50">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          {nft.lottieUrl ? (
            <LottiePlayer src={nft.lottieUrl} />
          ) : (
            <Image
              src={nft.imageUrl}
              alt={nft.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={nft.imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-baseline">
            <CardTitle className="text-xl font-headline truncate">{nft.name}</CardTitle>
            <span className="text-sm font-mono text-muted-foreground">#{nft.id.split('-')[1]}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('highestBid')}</span>
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Tag className="w-4 h-4 text-accent" />
                <span>{nft.highestBid} UZS</span>
            </div>
        </div>
         <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{t('timeRemaining')}</span>
            <div className="flex items-center gap-1 font-mono">
                <Timer className="w-4 h-4" />
                {timeLeft.days > 0 && <span>{timeLeft.days}d :</span>}
                <span>{formatTime(timeLeft.hours)}:</span>
                <span>{formatTime(timeLeft.minutes)}:</span>
                <span>{formatTime(timeLeft.seconds)}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full font-bold">{t('placeBid')} {bidAmount.toFixed(2)} UZS</Button>
      </CardFooter>
    </Card>
  );
}
