
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

export default function AuctionPage() {
  const { translations } = useLanguage();
  const t = (key: string) => translations[key] || key;

  const firestore = useFirestore();
  
  const auctionsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'auctions') : null),
    [firestore]
  );
  
  const { data: auctionNfts, isLoading } = useCollection<Nft>(auctionsRef);

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

      {!isLoading && auctionNfts && auctionNfts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {auctionNfts.map((nft) => (
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
