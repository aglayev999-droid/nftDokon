
'use client';
import Image from 'next/image';
import { user } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Diamond, Gift, HandCoins, Users, Wallet } from 'lucide-react';

export default function ProfilePage() {

  const referralLink = `https://nftkerak.com/join?ref=${user.username}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    // You can add a toast notification here
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-green-400 flex items-center justify-center">
             <span className="text-4xl font-bold text-white">
               {user.username.charAt(0).toUpperCase()}
             </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold font-headline text-center">
          {user.username}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Umumiy hajm</p>
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            <Diamond className="w-4 h-4 text-primary" /> {user.volume.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sotib olingan</p>
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            <Gift className="w-4 h-4" /> {user.bought}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sotilgan</p>
          <p className="text-lg font-bold flex items-center justify-center gap-1">
            <HandCoins className="w-4 h-4" /> {user.sold}
          </p>
        </div>
      </div>

       <Card className="mb-6 bg-green-500/10 border-green-500/20">
         <CardContent className="p-4 flex items-center justify-between">
           <div>
             <CardTitle className="text-lg font-bold text-green-400">0% Komissiya</CardTitle>
             <CardDescription className="text-xs text-green-400/80">8 kun 0 soat</CardDescription>
           </div>
           <div className="text-4xl">🔥</div>
         </CardContent>
       </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle className="font-headline">PORTALS LEVEL {user.portalsLevel}</CardTitle>
             <span className="text-sm font-bold text-primary">{user.portalsLevel * 20}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <Progress value={user.portalsLevel * 20} className="h-2" />
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Wallet className="w-4 h-4" />
                   <span>Ishlab topilgan (UZS)</span>
                </div>
                <p className="font-bold text-lg">{user.friendsVolume}</p>
             </div>
             <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Users className="w-4 h-4" />
                   <span>Do'stlar</span>
                </div>
                <p className="font-bold text-lg">{user.referrals}</p>
             </div>
           </div>
            <div className="text-center">
                 <p className="text-sm text-muted-foreground">Keyingi darajagacha</p>
                 <p className="font-bold text-primary flex items-center justify-center gap-1">
                    <Diamond className="w-4 h-4" /> 20000.01
                 </p>
            </div>
           <Button onClick={copyToClipboard} className="w-full font-bold">Do'stlarni taklif qilish</Button>
        </CardContent>
      </Card>
    </div>
  );
}
