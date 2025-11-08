
'use client';
import Image from 'next/image';
import { user } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/profile/stat-card';
import { BarChart, ShoppingBag, Landmark, Copy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { toast } = useToast();
  const referralLink = `https://nftkerak.com/join?ref=${user.username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Xotiraga saqlandi!',
      description: 'Sizning taklif havolangiz ulashishga tayyor.',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-card p-6 rounded-xl">
        <div className="relative">
          <Image
            src={user.avatarUrl}
            alt={user.username}
            width={128}
            height={128}
            className="rounded-full border-4 border-primary"
            data-ai-hint={user.avatarHint}
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-headline text-center md:text-left">
            {user.username}
          </h1>
          <p className="text-muted-foreground mt-1 text-center md:text-left">
            TON Gifter {new Date().getFullYear()} yildan beri
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={BarChart}
            title="Savdo hajmi"
            value={`${user.volume} TON`}
            color="text-primary"
          />
          <StatCard
            icon={ShoppingBag}
            title="Sotib olingan"
            value={`${user.bought} NFT`}
            color="text-green-500"
          />
          <StatCard
            icon={Landmark}
            title="Sotilgan"
            value={`${user.sold} NFT`}
            color="text-red-500"
          />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Do'stlarni taklif qiling</CardTitle>
          </div>
          <CardDescription>
             Ushbu havolani do'stlaringiz bilan ulashing. Siz ularning savdo hajmidan keshbek olasiz!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={referralLink} />
            <Button onClick={copyToClipboard} size="icon" aria-label="Havoladan nusxa olish">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
