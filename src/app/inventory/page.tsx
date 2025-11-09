
'use client';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { NftCard } from '@/components/nft-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Nft } from '@/lib/data';
import { PlusCircle, Upload, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNft } from '@/context/nft-context';

export default function InventoryPage() {
  const { nfts } = useNft();
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set());
  const { translations } = useLanguage();

  const t = (key: string, params?: { [key: string]: any }) => {
    let translation = translations[key] || key;
    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    return translation;
  };

  const listedNfts = nfts.filter((nft) => nft.isListed);
  const unlistedNfts = nfts.filter((nft) => !nft.isListed);

  const toggleNftSelection = (nftId: string) => {
    setSelectedNfts((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(nftId)) {
        newSelection.delete(nftId);
      } else {
        newSelection.add(nftId);
      }
      return newSelection;
    });
  };

  const handleWithdraw = () => {
    // Kelajakda yechib olish funksiyasi shu yerda bo'ladi
    console.log('Yechib olinadigan NFTlar:', Array.from(selectedNfts));
    alert(`${selectedNfts.size} ta NFT yechib olish uchun so'rov yuborildi.`);
    setSelectedNfts(new Set());
  };

  const renderNftGrid = (nftList: Nft[], inWithdrawMode: boolean) => {
    if (nftList.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <p className="text-muted-foreground">
            {inWithdrawMode ? t('noNftsToWithdraw') : t('noNftsInSection')}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nftList.map((nft) => (
          <div
            key={nft.id}
            onClick={() => inWithdrawMode && toggleNftSelection(nft.id)}
            className={`cursor-pointer rounded-lg transition-all ${
              selectedNfts.has(nft.id)
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : ''
            }`}
          >
            <NftCard nft={nft} action="manage" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          {t('myInventory')}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addOrMint')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('addNft')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('addNftDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>{t('understood')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                {t('withdrawNft')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('withdrawNfts')}</DialogTitle>
                <DialogDescription>
                  {t('selectNftsToWithdraw')}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                {renderNftGrid(nfts, true)}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button
                    variant="outline"
                    onClick={() => setSelectedNfts(new Set())}
                    >
                    {t('cancel')}
                  </Button>
                </DialogClose>
                <Button
                  disabled={selectedNfts.size === 0}
                  onClick={handleWithdraw}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {t('withdrawNSelected', { count: selectedNfts.size })}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">
            {t('all')} ({nfts.length})
          </TabsTrigger>
          <TabsTrigger value="listed">
            {t('listed')} ({listedNfts.length})
          </TabsTrigger>
          <TabsTrigger value="unlisted">
            {t('unlisted')} ({unlistedNfts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {nfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NftCard key={nft.id} nft={nft} action="manage" />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">{t('inventoryEmpty')}</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="listed">
          {listedNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {listedNfts.map((nft) => (
                <NftCard key={nft.id} nft={nft} action="manage" />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">{t('noListedNfts')}</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="unlisted">
          {unlistedNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {unlistedNfts.map((nft) => (
                <NftCard key={nft.id} nft={nft} action="manage" />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">{t('noUnlistedNfts')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
