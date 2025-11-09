'use client';

import Image from 'next/image';
import type { Nft } from '@/lib/data';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tag, Send, BarChart, Share2, Diamond } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface NftDetailDialogProps {
  nft: Nft;
}

export function NftDetailDialog({ nft }: NftDetailDialogProps) {
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

  const handleWatch = () => {
    // Creates a PascalCase version of the ID, e.g., "ice-cream-1" -> "IceCream-1"
    const nftLinkID = nft.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    const url = `https://t.me/nft/${nftLinkID}`;
    window.open(url, '_blank');
  };
  
  const handleStatus = () => {
    const status = nft.isListed ? t('listed') : t('unlisted');
    alert(`${t('status')}: ${status}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: nft.name,
      text: t('shareNftText', {nftName: nft.name, price: nft.price}),
      url: window.location.href, // Or a direct link to the NFT if available
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        alert(t('shareNotSupported'));
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const detailRow = (label: string, value: string) => (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );

  return (
    <div className="bg-card text-card-foreground">
      <div className="relative aspect-square max-w-sm mx-auto mt-6">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-cover rounded-2xl"
          data-ai-hint={nft.imageHint}
        />
      </div>
      <div className="p-6 space-y-4">
        <div className="text-center">
            <h2 className="text-2xl font-headline font-bold">{nft.name}</h2>
            <p className="font-mono text-muted-foreground">#{nft.id.split('-')[1]}</p>
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
            {detailRow(t('rarity'), nft.rarity)}
            {detailRow(t('background'), nft.background)}
        </div>

        <Separator />

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-center gap-2">
            <Diamond className="w-5 h-5 text-green-400" />
            <p className="text-sm font-semibold text-green-400">{t('commissionPeriod')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="lg">{t('makeAnOffer')}</Button>
            <Button size="lg" className="font-bold">{t('buy')}</Button>
        </div>
      </div>
    </div>
  );
}
