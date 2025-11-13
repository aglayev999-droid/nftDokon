'use client';

import Image from 'next/image';
import type { Nft } from '@/lib/data';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tag, Send, BarChart, Share2, Diamond } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { DialogHeader, DialogTitle } from './ui/dialog';
import { LottiePlayer } from './lottie-player';
import { useNft } from '@/context/nft-context';
import { useUser } from '@/firebase';

interface NftDetailDialogProps {
  nft: Nft;
  action?: 'buy' | 'manage';
}

export function NftDetailDialog({ nft, action = 'buy' }: NftDetailDialogProps) {
  const { translations } = useLanguage();
  const { buyNft } = useNft();
  const { user: currentUser } = useUser();
  
  const t = (key: string, params?: { [key: string]: any }) => {
    let translation = translations[key] || key;
    if (params) {
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
    }
    return translation;
  };

  const handleBuy = () => {
    buyNft(nft);
  };
  
  const handleWatch = () => {
    // Creates a PascalCase version of the ID, e.g., "ice-cream-1" -> "IceCream-1"
    const nftLinkID = nft.id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
    const url = `https://t.me/nft/${nftLinkID}`;
    window.open(url, '_blank');
  };
  
  const handleStatus = () => {
    const status = nft.isListed ? t('listed') : t('unlisted');
    alert(`${t('status')}: ${status}`);
  };

  const handleShare = () => {
    const shareData = {
      title: nft.name,
      text: t('shareNftText', {nftName: nft.name, price: nft.price}),
      url: window.location.href, // Or a direct link to the NFT if available
    };
    try {
      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          // Ignore errors from share, e.g. user cancelling the share sheet.
        });
      } else {
        alert(t('shareNotSupported'));
      }
    } catch (err) {
      // Error handling can be improved, but for now, we'll just ignore share errors.
    }
  };

  const detailRow = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
        </div>
    );
  };

  const nftIdNumber = nft.id.split('-').pop();
  const isOwner = currentUser && nft.ownerId === currentUser.uid;

  return (
    <div className="bg-card text-card-foreground">
       <DialogHeader className="sr-only">
        <DialogTitle>{nft.name}</DialogTitle>
      </DialogHeader>
      <div className="relative aspect-square max-w-sm mx-auto mt-6">
        {nft.lottieUrl ? (
            <LottiePlayer src={nft.lottieUrl} />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center rounded-2xl">
                <span className="text-muted-foreground text-sm">No Animation</span>
            </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="text-center">
            <h2 className="text-2xl font-headline font-bold">{nft.name}</h2>
            <p className="font-mono text-muted-foreground">#{nftIdNumber}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
             <Button onClick={handleWatch} variant="secondary" size="lg" className="flex-col h-auto py-2">
                 <Send className="w-5 h-5 mb-1" />
                 <span className="text-xs">{t('watch')}</span>
             </Button>
             <Button onClick={handleStatus} variant="secondary" size="lg" className="flex-col h-auto py-2">
                 <BarChart className="w-5 h-5 mb-1" />
                 <span className="text-xs">{t('status')}</span>
             </Button>
             <Button onClick={handleShare} variant="secondary" size="lg" className="flex-col h-auto py-2">
                 <Share2 className="w-5 h-5 mb-1" />
                 <span className="text-xs">{t('share')}</span>
             </Button>
        </div>

        <Separator />
        
        <div className="space-y-2">
            {detailRow(t('collection'), nft.collection)}
            {detailRow(t('model'), nft.model)}
            {detailRow('Symbol', nft.symbol)}
            {detailRow(t('rarity'), nft.rarity)}
            {detailRow(t('background'), nft.background)}
        </div>

        <Separator />

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-center gap-2">
            <Diamond className="w-5 h-5 text-green-400" />
            <p className="text-sm font-semibold text-green-400">{t('commissionPeriod')}</p>
        </div>

        { action === 'buy' && (
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="lg">{t('makeAnOffer')}</Button>
                {isOwner ? (
                     <Button size="lg" className="font-bold" disabled>{t('youAreOwner')}</Button>
                ) : (
                     <Button size="lg" className="font-bold" onClick={handleBuy}>{t('buy')}</Button>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
