
'use client';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Diamond, Gift, HandCoins, Users, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useTelegramUser } from '@/context/telegram-user-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { translations } = useLanguage();
  const t = (key: string) => translations[key] || key;
  const { user: telegramUser, isLoading } = useTelegramUser();

  const referralLink = `https://nftkerak.com/join?ref=${telegramUser?.username || telegramUser?.id}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    // You can add a toast notification here to confirm copy
  };

  if (isLoading || !telegramUser) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const user = { // Dummy data for now, will be replaced with real data from Firestore
    volume: 0,
    bought: 0,
    sold: 0,
    portalsLevel: 0,
    referrals: 0,
    friendsVolume: 0,
  };

  const displayName = telegramUser.last_name 
    ? `${telegramUser.first_name} ${telegramUser.last_name}`
    : telegramUser.first_name;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative">
          {telegramUser.photo_url ? (
            <Image
              src={telegramUser.photo_url}
              alt={displayName}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-2 border-primary"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground">
                {telegramUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold font-headline text-center">
          {displayName}
        </h1>
        {telegramUser.username && (
            <p className="text-muted-foreground">@{telegramUser.username}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mb-8">
        <div>
          <p className="text-sm text-muted-foreground">{t('totalVolume')}</p>
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            <Diamond className="w-4 h-4 text-primary" /> {user.volume.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('bought')}</p>
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            <Gift className="w-4 h-4" /> {user.bought}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('sold')}</p>
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            <HandCoins className="w-4 h-4" /> {user.sold}
          </p>
        </div>
      </div>

       <Card className="mb-6 bg-green-500/10 border-green-500/20">
         <CardContent className="p-4 flex items-center justify-between">
           <div>
             <CardTitle className="text-lg font-bold text-green-400">{t('commissionFee')}</CardTitle>
             <CardDescription className="text-xs text-green-400/80">{t('commissionFeeTime')}</CardDescription>
           </div>
           <div className="text-4xl">🔥</div>
         </CardContent>
       </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle className="font-headline">{t('level')} {user.portalsLevel}</CardTitle>
             <span className="text-sm font-bold text-primary">{user.portalsLevel * 20}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <Progress value={user.portalsLevel * 20} className="h-2" />
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <div className="w-4 h-4 font-bold text-center">UZS</div>
                   <span>{t('earned')}</span>
                </div>
                <p className="font-bold text-lg">{user.friendsVolume}</p>
             </div>
             <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Users className="w-4 h-4" />
                   <span>{t('friends')}</span>
                </div>
                <p className="font-bold text-lg">{user.referrals}</p>
             </div>
           </div>
            <div className="text-center">
                 <p className="text-sm text-muted-foreground">{t('toNextLevel')}</p>
                 <p className="font-bold text-primary flex items-center justify-center gap-1">
                    <Diamond className="w-4 h-4" /> 0
                 </p>
            </div>
           <Button onClick={copyToClipboard} className="w-full font-bold">{t('inviteFriends')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
