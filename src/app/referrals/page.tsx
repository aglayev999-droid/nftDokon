
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { user } from '@/lib/data';
import { Copy } from 'lucide-react';

export default function ReferralsPage() {
  const { toast } = useToast();
  const referralLink = `https://tongifts.com/join?ref=${user.username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Xotiraga saqlandi!',
      description: 'Sizning taklif havolangiz ulashishga tayyor.',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-headline font-bold text-foreground mb-8">
        Do'stlarni taklif qiling, mukofotlarga ega bo'ling
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Sizning taklif havolangiz</CardTitle>
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
    </div>
  );
}
