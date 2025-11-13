
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
import { PlusCircle, Upload, Send, Loader2 } from 'lucide-react';
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
import { useUser } from '@/firebase';
import { useTelegramUser } from '@/context/telegram-user-context';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InventoryPage() {
  const { inventoryNfts, isLoading } = useNft();
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set());
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const { translations } = useLanguage();
  const { user: firebaseUser } = useUser();
  const { user: telegramUser } = useTelegramUser();
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
  
  useState(() => {
    if(telegramUser?.username) {
        setTelegramUsername(`@${telegramUser.username}`);
    }
  });

  const handleDeposit = async () => {
    if (!firebaseUser || !telegramUser) return;
    
    setIsDepositing(true);
    try {
        const response = await fetch('/api/deposit-nft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: firebaseUser.uid,
                telegramUserId: telegramUser.id,
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Serverda noma'lum xatolik yuz berdi.");
        }
        
        toast({
            title: "Muvaffaqiyatli!",
            description: result.message,
        });

    } catch (error: any) {
        console.error("Depositda xato:", error);
        toast({
            variant: "destructive",
            title: "Xatolik",
            description: error.message || "So'rovni yuborishda xatolik yuz berdi.",
        });
    } finally {
        setIsDepositing(false);
    }
  }

  const handleWithdraw = async () => {
    if (selectedNfts.size === 0 || !firebaseUser) return;
    if (!telegramUsername || !telegramUsername.startsWith('@')) {
        toast({
            variant: 'destructive',
            title: t('error'),
            description: "Iltimos, to'g'ri Telegram manzilini kiriting (@username).",
        });
        return;
    }

    setIsProcessing(true);
    
    const nftId = Array.from(selectedNfts)[0];
    const nft = inventoryNfts.find(n => n.id === nftId);

    if (!nft) {
        setIsProcessing(false);
        return;
    }

    try {
        const response = await fetch('/api/create-withdrawal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: firebaseUser.uid,
                nftId: nft.id,
                nftName: nft.name,
                telegramUsername: telegramUsername,
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Serverda noma'lum xatolik yuz berdi.");
        }
        
        toast({
            title: "Muvaffaqiyatli!",
            description: result.message,
        });
        
        setSelectedNfts(new Set());
        setIsWithdrawDialogOpen(false);

    } catch (error: any) {
        console.error("Yechib olishda xato:", error);
        toast({
            variant: "destructive",
            title: "Xatolik",
            description: error.message || "So'rovni yuborishda xatolik yuz berdi. Iltimos, keyinroq yana urinib ko'ring.",
        });
    } finally {
        setIsProcessing(false);
    }
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
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleDeposit} disabled={isDepositing}>
              {isDepositing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {t('addOrMint')}
          </Button>

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
                  {t('selectNftsToWithdraw')} (Hozircha bir vaqtda faqat bitta NFT yechish mumkin)
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                {renderNftGrid(inventoryNfts, true)}
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
                  disabled={selectedNfts.size !== 1 || !telegramUsername || isProcessing}
                  onClick={handleWithdraw}
                >
                  {isProcessing ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                   {isProcessing ? 'Yuborilmoqda...' : t('withdrawNSelected', { count: selectedNfts.size })}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

       {isLoading ? (
        <div className="col-span-full text-center py-16">
            <p className="text-muted-foreground">Inventar yuklanmoqda...</p>
        </div>
       ) : inventoryNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventoryNfts.map((nft) => (
                <NftCard key={nft.id} nft={nft} action="manage" />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">{t('inventoryEmpty')}</p>
            </div>
       )}

    </div>
  );
}

    