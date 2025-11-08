
import Image from 'next/image';
import { user } from '@/lib/data';
import { Card } from '@/components/ui/card';

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
            TON Gifter {new Date().getFullYear()} yildan beri
          </p>
        </div>
      </div>

      <Card>
         <div className="text-center py-16">
            <p className="text-muted-foreground">Profil hozircha bo'sh.</p>
        </div>
      </Card>
    </div>
  );
}
