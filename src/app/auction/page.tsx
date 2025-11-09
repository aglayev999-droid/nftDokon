
'use client';

import { useLanguage } from '@/context/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuctionCard } from '@/components/auction-card';
import { Nft } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// A simple in-memory cache to track which auctions have been processed
const processedAuctions = new Set<string>();

async function processEndedAuction(auctionId: string) {
    if (processedAuctions.has(auctionId)) {
        // Already processed in this session, don't send another request
        return;
    }
    try {
        const response = await fetch('/api/process-auction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auctionId }),
        });
        const result = await response.json();
        if (response.ok) {
            console.log(`Successfully processed auction ${auctionId}:`, result.message);
            processedAuctions.add(auctionId);
        } else {
            console.error(`Failed to process auction ${auctionId}:`, result.error);
        }
    } catch (error) {
        console.error(`Network error processing auction ${auctionId}:`, error);
    }
}


export default function AuctionPage() {
  const { translations } = useLanguage();
  const t = (key: string) => translations[key] || key;

  const firestore = useFirestore();
  
  const auctionsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'auctions') : null),
    [firestore]
  );
  
  const { data: auctionNfts, isLoading } = useCollection<Nft>(auctionsRef);

  // Effect to process ended auctions
  useEffect(() => {
    if (auctionNfts && auctionNfts.length > 0) {
      const now = Date.now();
      auctionNfts.forEach(nft => {
        if (nft.endTime && now > nft.endTime) {
          // This auction has ended, trigger the processing
          processEndedAuction(nft.id);
        }
      });
    }
  }, [auctionNfts]); // Rerun whenever the auction list changes

  const activeAuctions = auctionNfts?.filter(nft => nft.endTime && Date.now() < nft.endTime) || [];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          {t('auction')}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="ending-soon">
            <SelectTrigger className="w-full sm:w-[180px] flex-1">
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending-soon">{t('endingSoon')}</SelectItem>
              <SelectItem value="newest">{t('newest')}</SelectItem>
              <SelectItem value="price-high-low">
                {t('priceHighToLow')}
              </SelectItem>
              <SelectItem value="price-low-high">
                {t('priceLowToHigh')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
         <div className="col-span-full text-center py-16">
          <p className="text-muted-foreground">Auksionlar yuklanmoqda...</p>
        </div>
      )}

      {!isLoading && activeAuctions.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeAuctions.map((nft) => (
            <AuctionCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        !isLoading && (
            <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">{t('noAuctionsAvailable')}</p>
            </div>
        )
      )}
    </div>
  );
}
