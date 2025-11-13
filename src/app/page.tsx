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
import { useNft } from '@/context/nft-context';
import { useState, useMemo } from 'react';
import type { Nft } from '@/lib/data';

type SortOption = 'price-low-high' | 'price-high-low' | 'newest' | 'rarity';

export default function MarketplacePage() {
  const { translations } = useLanguage();
  const { marketplaceNfts, isLoading } = useNft();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('price-low-high');
  const [filters, setFilters] = useState({
    collections: new Set<string>(),
    models: new Set<string>(),
    backgrounds: new Set<string>(),
    price: { min: '', max: '' },
  });

  const t = (key: string) => {
    return translations[key] || key;
  };

  const handleFilterChange = (category: 'collections' | 'models' | 'backgrounds', value: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[category]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [category]: newSet };
    });
  };

  const handlePriceFilterChange = (field: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      price: { ...prev.price, [field]: value }
    }));
  };
  
  const applyPriceFilter = () => {
    // This function is just to trigger re-render for price, 
    // the logic is already in useMemo.
    setFilters(prev => ({...prev}));
  }

  const filteredAndSortedNfts = useMemo(() => {
    let filtered = marketplaceNfts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Checkbox filters
    if (filters.collections.size > 0) {
      filtered = filtered.filter(nft => filters.collections.has(nft.collection));
    }
    if (filters.models.size > 0) {
      filtered = filtered.filter(nft => nft.model && filters.models.has(nft.model));
    }
    if (filters.backgrounds.size > 0) {
        filtered = filtered.filter(nft => nft.background && filters.backgrounds.has(nft.background));
    }

    // Price filter
    const minPrice = parseFloat(filters.price.min);
    const maxPrice = parseFloat(filters.price.max);
    if (!isNaN(minPrice)) {
      filtered = filtered.filter(nft => nft.price >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      filtered = filtered.filter(nft => nft.price <= maxPrice);
    }


    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'newest':
          // Assuming a timestamp 'createdAt' exists. If not, this won't work correctly.
          // Let's fallback to id as a proxy for creation time if no timestamp.
          return (b.id > a.id) ? 1 : -1;
        case 'rarity':
            const rarityOrder = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3 };
            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [marketplaceNfts, searchTerm, sortOption, filters]);

  const allCollections = ['TON Treasures', 'Plush Pepe', 'Fresh Socks'];
  const allModels = ['Common', 'Rare', 'Epic', 'pumpkin'];
  const allBackgrounds = ['Space', 'Neon', 'Holographic', 'Rainbow', 'onyx black'];

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
          <Input 
            placeholder={t('searchByNameOrId')} 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <Accordion type="multiple" defaultValue={['collections', 'price']}>
          <AccordionItem value="collections">
            <AccordionTrigger className="font-semibold">
              {t('collections')}
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {allCollections.map(col => (
                <div key={col} className="flex items-center space-x-2">
                  <Checkbox id={`col-${col}`} onCheckedChange={() => handleFilterChange('collections', col)} checked={filters.collections.has(col)} />
                  <Label htmlFor={`col-${col}`}>{col}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger className="font-semibold">{t('price')}</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex gap-2">
                <Input type="number" placeholder={t('min')} value={filters.price.min} onChange={e => handlePriceFilterChange('min', e.target.value)} />
                <Input type="number" placeholder={t('max')} value={filters.price.max} onChange={e => handlePriceFilterChange('max', e.target.value)} />
              </div>
              <Button onClick={applyPriceFilter} className="w-full">{t('apply')}</Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="model">
            <AccordionTrigger className="font-semibold">
              {t('model')}
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {allModels.map(model => (
                 <div key={model} className="flex items-center space-x-2">
                  <Checkbox id={`model-${model}`} onCheckedChange={() => handleFilterChange('models', model)} checked={filters.models.has(model)} />
                  <Label htmlFor={`model-${model}`}>{t(model.toLowerCase()) || model}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="background">
            <AccordionTrigger className="font-semibold">
              {t('background')}
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
               {allBackgrounds.map(bg => (
                <div key={bg} className="flex items-center space-x-2">
                  <Checkbox id={`bg-${bg}`} onCheckedChange={() => handleFilterChange('backgrounds', bg)} checked={filters.backgrounds.has(bg)} />
                  <Label htmlFor={`bg-${bg}`}>{t(bg.toLowerCase()) || bg}</Label>
                </div>
               ))}
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
              <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
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
          {isLoading ? (
             <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">Bozor yuklanmoqda...</p>
             </div>
          ) : filteredAndSortedNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedNfts.map((nft) => (
                  <NftCard key={nft.id} nft={nft} action="buy"/>
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
