
'use client';
import {
  AlertDialog,
  AlertDialogAction,
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
import { nfts as allNfts, Nft } from '@/lib/data';
import { PlusCircle, Upload, Send } from 'lucide-react';
import { useState } from 'react';

export default function InventoryPage() {
  const [nfts, setNfts] = useState<Nft[]>(allNfts);
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set());

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
  };


  const renderNftGrid = (nftList: Nft[], inWithdrawMode: boolean) => {
    if (nftList.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <p className="text-muted-foreground">
            {inWithdrawMode
              ? 'Yechib olish uchun NFT mavjud emas.'
              : "Sizda bu bo'limda NFTlar yo'q."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          Mening inventarim
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Yangi qo'shish/zarb qilish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>NFT qo'shish</AlertDialogTitle>
                <AlertDialogDescription>
                  Hurmatli mijoz, inventarga NFT qo'shish uchun telegramdagi
                  NFTingizni @nullprime shu odamga yuboring!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Tushunarli</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                NFTni yechib olish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl">
              <AlertDialogHeader>
                <AlertDialogTitle>NFTlarni yechib olish</AlertDialogTitle>
                <AlertDialogDescription>
                  Yechib olmoqchi bo'lgan NFTlaringizni tanlang.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                {renderNftGrid(nfts, true)}
              </div>
              <AlertDialogFooter>
                 <AlertDialogAction
                  disabled={selectedNfts.size === 0}
                  onClick={handleWithdraw}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {selectedNfts.size} ta NFT yechish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">Barchasi ({nfts.length})</TabsTrigger>
          <TabsTrigger value="listed">
            Ro'yxatda ({listedNfts.length})
          </TabsTrigger>
          <TabsTrigger value="unlisted">
            Ro'yxatdan tashqari ({unlistedNfts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {nfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => <NftCard key={nft.id} nft={nft} action="manage" />)}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">
                Sizning inventaringiz bo'sh.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="listed">
          {listedNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {listedNfts.map((nft) => <NftCard key={nft.id} nft={nft} action="manage" />)}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">
                Sizda ro'yxatga olingan NFTlar yo'q.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="unlisted">
           {unlistedNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {unlistedNfts.map((nft) => <NftCard key={nft.id} nft={nft} action="manage" />)}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">
                Sizda ro'yxatdan o'tmagan NFTlar yo'q.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
