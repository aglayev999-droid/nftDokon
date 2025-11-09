'use client';

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Filter,
  Wallet,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
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
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { user } from '@/lib/data';

export function WalletDialog() {
  const { translations } = useLanguage();
  const t = (key: string) => translations[key] || key;
  const { toast } = useToast();

  const recentActions: any[] = [];
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [finalDepositInfo, setFinalDepositInfo] = useState<{ amount: number; card: string } | null>(null);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formattedInput = input.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formattedInput);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formattedInput = input;
    if (input.length > 2) {
      formattedInput = `${''}${input.substring(0, 2)}/${''}${input.substring(2, 4)}`;
    }
    setCardExpiry(formattedInput);
  };

  const handleDepositProceed = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('enterValidAmount'),
      });
      return;
    }
    const randomCents = Math.floor(Math.random() * 100);
    const finalAmount = amount + randomCents;
    setFinalDepositInfo({
      amount: finalAmount,
      card: '8600 **** **** 3444', 
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('copied'),
      description: `${label} ${t('copiedToClipboard')}`,
    });
  };

  const resetDepositFlow = () => {
    setDepositAmount('');
    setFinalDepositInfo(null);
  };
  
  return (
    <div className="bg-background">
      <DialogHeader className="p-4 border-b">
        <DialogTitle className="sr-only">{t('wallet')}</DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4">
        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="w-5 h-5" />
              <span>{t('walletNotConnected')}</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm" className="text-primary">
                  {t('connect')} +
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('connectYourCard')}</DialogTitle>
                  <DialogDescription>
                    {t('connectCardDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">{t('cardNumber')}</Label>
                    <Input id="cardNumber" placeholder="8600 1234 5678 9012" value={cardNumber} onChange={handleCardNumberChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">{t('cardExpiry')}</Label>
                    <Input id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={handleCardExpiryChange} />
                  </div>
                  <DialogClose asChild>
                    <Button className="w-full">{t('connectCard')}</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        <Card className="bg-primary/10 border-primary/20 text-center">
          <CardContent className="p-6">
            <p className="text-sm text-primary/80">{t('walletBalance')}</p>
            <p className="text-4xl font-bold font-headline text-primary">
              0.00 <span className="text-2xl">UZS</span>
            </p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-2">
          <Dialog onOpenChange={(open) => !open && resetDepositFlow()}>
            <DialogTrigger asChild>
               <Button size="lg" variant="outline">
                <ArrowDown className="mr-2 h-4 w-4" />
                {t('deposit')}
              </Button>
            </DialogTrigger>
            {!finalDepositInfo ? (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('depositAmount')}</DialogTitle>
                  <DialogDescription>{t('enterDepositAmount')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">{t('amountInUZS')}</Label>
                  <Input 
                    id="deposit-amount" 
                    type="number" 
                    placeholder="10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleDepositProceed} className="w-full">{t('proceed')}</Button>
                </DialogFooter>
              </DialogContent>
            ) : (
               <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('orderSuccessful')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-semibold">{user.username}</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('name')}:</span>
                    <span className="font-semibold">{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('price')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{finalDepositInfo.amount.toLocaleString()} UZS</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(String(finalDepositInfo.amount), t('price'))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('card')}:</span>
                     <div className="flex items-center gap-2">
                      <span className="font-mono">{finalDepositInfo.card}</span>
                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(finalDepositInfo.card.replace(/\s/g, ''), t('card'))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground pt-2">{t('transferInstruction')}</p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="w-full">{t('ok')}</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>

          <Button size="lg" variant="outline">
            <ArrowUp className="mr-2 h-4 w-4" />
            {t('withdraw')}
          </Button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{t('recentActions')}</h3>
            <Button variant="ghost" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {t('filter')}
            </Button>
          </div>
          <div className="space-y-2">
            {recentActions.length > 0 ? (
              recentActions.map((action, index) => (
                <div key={index}></div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t('noRecentActions')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}