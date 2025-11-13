
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
import { PlusCircle, Upload, Send } from 'lucide-react';
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
import { useUser, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useTelegramUser } from '@/context/telegram-user-context';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InventoryPage() {
  const { nfts, removeNftFromInventory } = useNft();
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set());
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const { translations } = useLanguage();
  const { user: firebaseUser } = useUser();
  const { user: telegramUser } = useTelegramUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const t = (key: string, params?: { [key: string]: any }) => {
    let translation = translations[key] || key;
    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    return translation;
  };
  
  // Set initial telegram username
  useState(() => {
    if(telegramUser?.username) {
        setTelegramUsername(`@${telegramUser.username}`);
    }
  });

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

  const handleWithdraw = async () => {
    if (selectedNfts.size === 0 || !firebaseUser || !firestore) {
      return;
    }
    if (!telegramUsername || !telegramUsername.startsWith('@')) {
        toast({
            variant: 'destructive',
            title: t('error'),
            description: "Iltimos, to'g'ri Telegram manzilini kiriting (@username).",
        });
        return;
    }

    const withdrawalsRef = collection(firestore, 'withdrawals');
    const selectedNftIds = Array.from(selectedNfts);
    
    const batch = writeBatch(firestore);

    // Prepare a sample of the data for potential error reporting
    let sampleWithdrawalData: any = {};

    for (const nftId of selectedNftIds) {
      const nft = nfts.find(n => n.id === nftId);
      if (nft) {
        const withdrawalData = {
          userId: firebaseUser.uid,
          telegramUsername: telegramUsername,
          nftId: nft.id,
          nftName: nft.name,
          status: 'pending',
          requestedAt: serverTimestamp(),
        };

        if(Object.keys(sampleWithdrawalData).length === 0) {
            sampleWithdrawalData = withdrawalData;
        }

        const newWithdrawalRef = doc(withdrawalsRef); // Create a ref with a new ID
        batch.set(newWithdrawalRef, withdrawalData);

        // Also add deletion from inventory to the same batch
        const inventoryItemRef = doc(firestore, 'users', firebaseUser.uid, 'inventory', nftId);
        batch.delete(inventoryItemRef);
      }
    }
    
    try {
        await batch.commit();
        toast({
            title: "So'rov yuborildi",
            description: `${selectedNfts.size} ta NFTni yechib olish so'rovi muvaffaqiyatli yuborildi va inventardan olib tashlandi.`,
        });

    } catch (error: any) {
        if (error.code === 'permission-denied') {
            // A batch write can fail on any of its operations.
            // We'll report the error on the 'withdrawals' collection as that's the most likely culprit.
            const contextualError = new FirestorePermissionError({
                path: 'withdrawals', // Path of the collection for creating requests
                operation: 'create', // The operation within the batch that likely failed
                requestResourceData: sampleWithdrawalData, // Show sample data for context
            });
            errorEmitter.emit('permission-error', contextualError);
        } else {
            console.error("Error creating withdrawal request:", error);
            toast({
                variant: "destructive",
                title: "Xatolik",
                description: "So'rovni yuborishda xatolik yuz berdi. Iltimos, keyinroq yana urinib ko'ring.",
            });
        }
    }
    
    setSelectedNfts(new Set());
    setIsWithdrawDialogOpen(false);
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

  const withdrawableNfts = nfts.filter(nft => !nft.isListed);

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

          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
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
                {renderNftGrid(withdrawableNfts, true)}
              </div>
               <div className="space-y-2 mt-4">
                  <Label htmlFor="telegram-username">Telegram Username</Label>
                  <Input 
                    id="telegram-username" 
                    placeholder="@username" 
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    />
                  <p className="text-xs text-muted-foreground">Sovg'a yuborilishi uchun Telegram manzilingizni kiriting.</p>
                </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                   <Button
                    variant="outline"
                    onClick={() => setSelectedNfts(new Set())}
                    >
                    {t('cancel')}
                  </Button>
                </DialogClose>
                <Button
                  disabled={selectedNfts.size === 0 || !telegramUsername}
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

    