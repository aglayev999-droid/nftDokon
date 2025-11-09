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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NftDetailDialog } from './nft-detail-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

interface NftCardProps {
  nft: Nft;
  action?: 'buy' | 'manage';
}

export function NftCard({ nft, action = 'buy' }: NftCardProps) {
  const { translations } = useLanguage();
  const t = (key: string, params?: { [key: string]: any }) => {
    let translation = translations[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    return translation;
  };
  const { toast } = useToast();
  const [price, setPrice] = useState('');

  const handleSell = () => {
    const sellPrice = parseFloat(price);
    if (!sellPrice || sellPrice <= 0) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('enterValidPrice'),
      });
      return;
    }
    // TODO: Update NFT state to listed with the new price
    console.log(`Selling ${nft.name} for ${sellPrice}`);
    toast({
      title: t('listForSaleSuccessTitle'),
      description: t('listForSaleSuccessDescription', { nftName: nft.name, price: sellPrice.toLocaleString() }),
    });
  };

  const handleUnlist = () => {
    // TODO: Update NFT state to unlisted
    console.log(`Unlisting ${nft.name}`);
    toast({
      title: t('unlistSuccessTitle'),
      description: t('unlistSuccessDescription', { nftName: nft.name }),
    });
  };

  const manageActions = (
    <div className="w-full grid grid-cols-2 gap-2">
      {nft.isListed ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">{t('unlist')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmUnlistTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmUnlistDescription', { nftName: nft.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnlist}>{t('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">{t('sell')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('listForSaleTitle')}</DialogTitle>
              <DialogDescription>{t('listForSaleDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="price">{t('priceInUZS')}</Label>
              <Input
                id="price"
                type="number"
                placeholder="50000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSell}>{t('listForSale')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Button variant="outline" className="w-full">{t('send')}</Button>
    </div>
  );


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
        {action === 'buy' && (
          <div className="flex items-center gap-2 text-primary font-bold text-2xl">
            <Tag className="w-5 h-5 text-accent" />
            <span>{nft.price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground font-normal">UZS</span>
          </div>
        )}
      </CardContent>
      {action === 'buy' || action === 'manage' ? (
        <CardFooter className="p-4 pt-0">
          {action === 'buy' ? (
            <Button className="w-full font-bold">{t('buy')}</Button>
          ) : (
            manageActions
          )}
        </CardFooter>
      ) : null}
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
