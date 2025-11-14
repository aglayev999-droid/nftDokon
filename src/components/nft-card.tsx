
'use client';
import type { Nft } from '@/lib/data';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Tag, Upload } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NftDetailDialog } from './nft-detail-dialog';
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
} from './ui/alert-dialog';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNft } from '@/context/nft-context';
import Lottie from 'lottie-react';
import { Skeleton } from './ui/skeleton';
import { useUser } from '@/firebase';

interface NftCardProps {
  nft: Nft;
  action?: 'buy' | 'manage';
  onWithdrawClick?: () => void;
}

export function NftCard({ nft, action = 'buy', onWithdrawClick }: NftCardProps) {
  const { translations } = useLanguage();
  const { setNftForSale, removeNftFromSale, addNftToAuctions, buyNft } = useNft();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (nft.lottieUrl) {
      fetch(nft.lottieUrl)
        .then(response => response.json())
        .then(data => setAnimationData(data))
        .catch(() => setAnimationData(null));
    }
  }, [nft.lottieUrl]);


  const [price, setPrice] = useState('');
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  
  const [isAuctionStep1Open, setIsAuctionStep1Open] = useState(false);
  const [isAuctionStep2Open, setIsAuctionStep2Open] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState('');
  const [auctionStartPrice, setAuctionStartPrice] = useState('');


  const t = (key: string, params?: { [key: string]: any }) => {
    let translation = translations[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    return translation;
  };

  const handleBuy = () => {
    buyNft(nft);
  };

  const handleSell = () => {
    const sellPrice = parseFloat(price);
    if (!sellPrice || sellPrice <= 0) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('enterValidPrice'),
      });
      return;
    }
    
    setNftForSale(nft.id, sellPrice);
    setIsSellDialogOpen(false);
    setPrice('');
  };

  const handleUnlist = () => {
    removeNftFromSale(nft.id);
  };

  const handleProceedToAuctionStep2 = () => {
      const duration = parseInt(auctionDuration, 10);
      const startPrice = parseFloat(auctionStartPrice);
      if (isNaN(duration) || duration <= 0) {
        toast({ variant: 'destructive', title: t('error'), description: "Iltimos, to'g'ri auksion muddatini kiriting." });
        return;
      }
      if (isNaN(startPrice) || startPrice < 0) {
        toast({ variant: 'destructive', title: t('error'), description: "Iltimos, to'g'ri boshlang'ich narxni kiriting." });
        return;
      }

      setIsAuctionStep1Open(false);
      setIsAuctionStep2Open(true);
  }

  const handleConfirmAuction = async () => {
    if (!currentUser) return;
    const durationHours = parseInt(auctionDuration, 10);
    const startingPrice = parseFloat(auctionStartPrice);

    const startTime = Date.now();
    const endTime = startTime + durationHours * 60 * 60 * 1000;

    const auctionData: Nft = {
        ...nft,
        isListed: true,
        price: startingPrice,
        startingPrice: startingPrice,
        highestBid: startingPrice,
        highestBidderId: '',
        startTime,
        endTime,
    };
    
    await addNftToAuctions(auctionData);

    toast({
      title: "Muvaffaqiyatli!",
      description: `${nft.name} auksionga qo'yildi.`
    });

    setIsAuctionStep2Open(false);
    setAuctionDuration('');
    setAuctionStartPrice('');
  }
  
  const isOwner = currentUser && nft.ownerId === currentUser.uid;
  const nftIdNumber = nft.id.split('-').pop();

  const buyActions = (
    <>
      {isOwner ? (
        <Button disabled className="w-full font-bold">{t('youAreOwner')}</Button>
      ) : (
        <Button className="w-full font-bold" onClick={handleBuy}>{t('buy')}</Button>
      )}
    </>
  );

  const manageActions = (
    <div className="w-full grid grid-cols-2 gap-2">
      {nft.isListed ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">{t('unlist')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmUnlistTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmUnlistDescription', { nftName: nft.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnlist}>{t('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">{t('sell')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('listForSaleTitle')}</DialogTitle>
              <DialogDescription>{t('listForSaleDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="price">{t('priceInUZS')}</Label>
              <Input
                id="price"
                type="number"
                placeholder="50000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <DialogFooter>
                <Button onClick={handleSell}>{t('listForSale')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {!nft.isListed && (
        <div className="flex gap-2">
            <Dialog open={isAuctionStep1Open} onOpenChange={setIsAuctionStep1Open}>
              <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">{t('auction')}</Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Auksionga qo'yish</DialogTitle>
                    <DialogDescription>Auksion parametrlarini kiriting.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">Davomiyligi (soat)</Label>
                      <Input id="duration" type="number" value={auctionDuration} onChange={(e) => setAuctionDuration(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start-price" className="text-right">Boshlang'ich narx (UZS)</Label>
                      <Input id="start-price" type="number" value={auctionStartPrice} onChange={(e) => setAuctionStartPrice(e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleProceedToAuctionStep2}>Keyingisi</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
             <Button variant="outline" size="icon" onClick={onWithdrawClick}>
                <Upload className="h-4 w-4" />
             </Button>
        </div>
      )}
       <AlertDialog open={isAuctionStep2Open} onOpenChange={setIsAuctionStep2Open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Auksionni tasdiqlash</AlertDialogTitle>
              <AlertDialogDescription>
                Siz rostan ham "{nft.name}" giftini auksionga qo'ymoqchimisiz?
                <br /><br />
                <strong>Eslatma:</strong> Auksionga qo'ygandan keyin qaytarib bo'lmaydi!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAuctionStartPrice('')}>Yo'q</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAuction}>Ha</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );


  const cardContent = (
     <Card className="overflow-hidden group transition-all duration-300 hover:border-primary/50">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
           {animationData ? (
             <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }}/>
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
                {nft.lottieUrl ? <Skeleton className="w-full h-full" /> : <span className="text-muted-foreground text-xs">No Animation</span>}
            </div>
          )}
          <div className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-accent">
            {nft.rarity}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-baseline">
            <CardTitle className="text-xl font-headline truncate">{nft.name}</CardTitle>
            <span className="text-sm font-mono text-muted-foreground">#{nftIdNumber}</span>
        </div>
        {(action === 'buy' || (action === 'manage' && nft.isListed)) && (
          <div className="flex items-center gap-2 text-primary font-bold text-2xl">
            <Tag className="w-5 h-5 text-accent" />
            <span>{nft.price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground font-normal">UZS</span>
          </div>
        )}
      </CardContent>
      {action === 'buy' || (action === 'manage' && isOwner) ? (
        <CardFooter className="p-4 pt-0">
          {action === 'buy' ? buyActions : manageActions}
        </CardFooter>
      ) : null}
    </Card>
  );

  if (action === 'manage') {
    return cardContent;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {cardContent}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <NftDetailDialog nft={nft} action={action} />
      </DialogContent>
    </Dialog>
  );
}
