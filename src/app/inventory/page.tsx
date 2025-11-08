
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Upload } from 'lucide-react';

export default function InventoryPage() {
  const nfts: any[] = [];
  const listedNfts = nfts.filter((nft) => nft.isListed);
  const unlistedNfts = nfts.filter((nft) => !nft.isListed);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Mening inventarim
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Yangi qo'shish/zarb qilish
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            NFTni yechib olish
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">Barchasi ({nfts.length})</TabsTrigger>
          <TabsTrigger value="listed">Ro'yxatda ({listedNfts.length})</TabsTrigger>
          <TabsTrigger value="unlisted">Ro'yxatdan tashqari ({unlistedNfts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
           <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">Sizning inventaringiz bo'sh.</p>
          </div>
        </TabsContent>
        <TabsContent value="listed">
           <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">Sizda ro'yxatga olingan NFTlar yo'q.</p>
          </div>
        </TabsContent>
        <TabsContent value="unlisted">
           <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">Sizda ro'yxatdan o'tmagan NFTlar yo'q.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
