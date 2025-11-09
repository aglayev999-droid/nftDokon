
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLanguage } from '@/context/language-context';
import { NftCard } from '@/components/nft-card';
import { nfts } from '@/lib/data';

export default function MarketplacePage() {
  const { translations } = useLanguage();
  const listedNfts = nfts.filter((nft) => nft.isListed);

  const t = (key: string) => {
    return translations[key] || key;
  };

  const filtersContent = (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="font-headline">{t('filters')}</CardTitle>
        <CardDescription>
          {t('filterDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder={t('searchByNameOrId')} className="pl-10" />
        </div>

        <Accordion type="multiple" defaultValue={['collections', 'price']}>
          <AccordionItem value="collections">
            <AccordionTrigger className="font-semibold">
              {t('collections')}
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="col-crypto-critters" />
                <Label htmlFor="col-crypto-critters">Crypto Critters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-pixel-presents" />
                <Label htmlFor="col-pixel-presents">Pixel Presents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-ton-treasures" />
                <Label htmlFor="col-ton-treasures">TON Treasures</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger className="font-semibold">{t('price')}</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex gap-2">
                <Input type="number" placeholder={t('min')} />
                <Input type="number" placeholder={t('max')} />
              </div>
              <Button className="w-full">{t('apply')}</Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="model">
            <AccordionTrigger className="font-semibold">
              {t('model')}
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="model-common" />
                <Label htmlFor="model-common">{t('common')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="model-rare" />
                <Label htmlFor="model-rare">{t('rare')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="model-epic" />
                <Label htmlFor="model-epic">{t('epic')}</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="background">
            <AccordionTrigger className="font-semibold">
              {t('background')}
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="bg-space" />
                <Label htmlFor="bg-space">{t('space')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="bg-neon" />
                <Label htmlFor="bg-neon">{t('neon')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="bg-holographic" />
                <Label htmlFor="bg-holographic">{t('holographic')}</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24">
            {filtersContent}
          </div>
        </aside>
        <main className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-4xl font-headline font-bold text-foreground">
              {t('nftMarketplace')}
            </h1>
            <div className="flex gap-2 w-full sm:w-auto">
               <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden flex-1">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {t('filters')}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('filters')}</SheetTitle>
                    <SheetDescription>{t('filterDescriptionMobile')}</SheetDescription>
                  </SheetHeader>
                   <div className="h-full overflow-y-auto">
                    {filtersContent}
                  </div>
                </SheetContent>
              </Sheet>
              <Select defaultValue="price-low-high">
                <SelectTrigger className="w-full sm:w-[180px] flex-1">
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low-high">{t('priceLowToHigh')}</SelectItem>
                  <SelectItem value="price-high-low">{t('priceHighToLow')}</SelectItem>
                  <SelectItem value="newest">{t('newest')}</SelectItem>
                  <SelectItem value="rarity">{t('rarity')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {listedNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listedNfts.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
            </div>
             ) : (
                <div className="col-span-full text-center py-16">
                    <p className="text-muted-foreground">{t('nothingOnMarketplace')}</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
