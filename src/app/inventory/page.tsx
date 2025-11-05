import { NftCard } from '@/components/nft-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nfts } from '@/lib/data';
import { PlusCircle, Upload } from 'lucide-react';

export default function InventoryPage() {
  const listedNfts = nfts.filter((nft) => nft.isListed);
  const unlistedNfts = nfts.filter((nft) => !nft.isListed);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          My Inventory
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add/Mint New
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Withdraw NFT
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">All ({nfts.length})</TabsTrigger>
          <TabsTrigger value="listed">Listed ({listedNfts.length})</TabsTrigger>
          <TabsTrigger value="unlisted">Unlisted ({unlistedNfts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NftCard key={nft.id} nft={nft} action="manage" />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="listed">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listedNfts.map((nft) => (
              <NftCard key={nft.id} nft={nft} action="manage" />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="unlisted">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {unlistedNfts.length > 0 ? (
                unlistedNfts.map((nft) => (
                  <NftCard key={nft.id} nft={nft} action="manage" />
                ))
            ) : (
                <div className="col-span-full text-center py-16">
                    <p className="text-muted-foreground">You have no unlisted NFTs.</p>
                </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
