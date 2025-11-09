
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
import { Tag } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NftDetailDialog } from './nft-detail-dialog';

interface NftCardProps {
  nft: Nft;
  action?: 'buy' | 'manage';
}

export function NftCard({ nft, action = 'buy' }: NftCardProps) {
  const { translations } = useLanguage();
  const t = (key: string) => translations[key] || key;

  const cardContent = (
     <Card className="overflow-hidden group transition-all duration-300 hover:border-primary/50">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={nft.imageUrl}
            alt={nft.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={nft.imageHint}
          />
          <div className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-accent">
            {nft.rarity}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <CardTitle className="text-xl font-headline truncate">{nft.name}</CardTitle>
        <div className="flex items-center gap-2 text-primary font-bold text-2xl">
          <Tag className="w-5 h-5 text-accent" />
          <span>{nft.price}</span>
          <span className="text-sm text-muted-foreground font-normal">UZS</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {action === 'buy' ? (
          <Button className="w-full font-bold">{t('buy')}</Button>
        ) : (
          <div className="w-full grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">{t('sell')}</Button>
            <Button variant="outline" className="w-full">{t('send')}</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );

  if (action === 'manage') {
    return cardContent;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {cardContent}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <NftDetailDialog nft={nft} />
      </DialogContent>
    </Dialog>
  );
}
