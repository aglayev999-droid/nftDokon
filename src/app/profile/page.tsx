import Image from 'next/image';
import {
  Award,
  DollarSign,
  Gift,
  HeartHandshake,
  Percent,
  Rocket,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react';
import { user } from '@/lib/data';
import { StatCard } from '@/components/profile/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
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
            TON Gifter since {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Volume"
          value={`$${user.volume.toLocaleString()}`}
          description="Total value of trades"
          color="text-green-400"
        />
        <StatCard
          icon={ShoppingCart}
          title="Bought"
          value={user.bought.toString()}
          description="NFTs purchased"
        />
        <StatCard
          icon={Tag}
          title="Sold"
          value={user.sold.toString()}
          description="NFTs sold"
        />
        <StatCard
          icon={Percent}
          title="Cashback Bonus"
          value={`${user.cashbackBonus}%`}
          description="On eligible purchases"
          color="text-blue-400"
        />
        <StatCard
          icon={Gift}
          title="Giveaways"
          value={user.giveaways.toString()}
          description="Entered or won"
        />
        <StatCard
          icon={Rocket}
          title="Portals Level"
          value={`Lv. ${user.portalsLevel}`}
          description="Your portal mastery"
          color="text-purple-400"
        />
        <StatCard
          icon={Users}
          title="Referrals"
          value={user.referrals.toString()}
          description="Friends invited"
        />
        <StatCard
          icon={HeartHandshake}
          title="Friends Volume"
          value={`$${user.friendsVolume.toLocaleString()}`}
          description="Volume from your referrals"
          color="text-yellow-400"
        />
        
        <Card className="lg:col-span-2 xl:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Award className="text-accent" />
              Season Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.seasonAchievements.map((ach, index) => (
              <div key={ach.name}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">{ach.name}</p>
                  <p className="text-sm font-medium text-accent">{ach.value}</p>
                </div>
                <Progress value={ach.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
