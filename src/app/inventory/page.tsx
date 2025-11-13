
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
import { Nft } from '@/lib/data';
import { PlusCircle, Upload, Send, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
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
  
  useEffect(() => {
    if(telegramUser?.username) {
        setTelegramUsername(`@${telegramUser.username}`);
    }
  }, [telegramUser]);

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

  const handleSelectNftForWithdraw = (nft: Nft) => {
    setSelectedNft(nft);
    setIsWithdrawDialogOpen(true);
  }

  const handleWithdraw = async () => {
    if (!selectedNft || !firebaseUser) return;
    if (!telegramUsername || !telegramUsername.startsWith('@')) {
        toast({
            variant: 'destructive',
            title: t('error'),
            description: "Iltimos, to'g'ri Telegram manzilini kiriting (@username).",
        });
        return;
    }

    setIsProcessing(true);

    try {
        const response = await fetch('/api/create-withdrawal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: firebaseUser.uid,
                nftId: selectedNft.id,
                nftName: selectedNft.name,
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
        
        setSelectedNft(null);
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

          <p className="text-xs text-muted-foreground text-center sm:hidden mt-2">NFT qo'shish uchun avval uni @nftkerak_saqlovchi ga yuboring.</p>

        </div>
      </div>

       {isLoading ? (
        <div className="col-span-full text-center py-16">
            <p className="text-muted-foreground">Inventar yuklanmoqda...</p>
        </div>
       ) : inventoryNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventoryNfts.map((nft) => (
                <NftCard key={nft.id} nft={nft} action="manage" onWithdrawClick={() => handleSelectNftForWithdraw(nft)} />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">{t('inventoryEmpty')}</p>
            </div>
       )}

      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>NFT Yechib Olish</DialogTitle>
            <DialogDescription>
                Siz inventaringizdan bir NFT yechib olmoqchisiz. Buning evaziga bizning zaxiramizdan mavjud bo'lgan Telegram sovg'asi sizga yuboriladi.
                <br/><br/>
                <strong className="text-destructive">Diqqat:</strong> Yechib olinayotgan NFT turi va yuboriladigan sovg'a turi bir-biriga mos kelmasligi mumkin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-username">Telegram Username</Label>
              <Input 
                id="telegram-username" 
                placeholder="@username" 
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                />
              <p className="text-xs text-muted-foreground">Sovg'a yuborilishi kerak bo'lgan Telegram manzil.</p>
            </div>
            <div className="rounded-lg border bg-background/50 p-3 text-center">
              <p className="text-sm text-muted-foreground">Xizmat uchun komissiya</p>
              <p className="text-lg font-bold text-primary">4,000 UZS</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setSelectedNft(null)}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button
              disabled={!telegramUsername || isProcessing}
              onClick={handleWithdraw}
            >
              {isProcessing ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
               {isProcessing ? 'Yuborilmoqda...' : `Tasdiqlash va Yechib olish`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
