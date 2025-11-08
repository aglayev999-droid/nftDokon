
export default function AuctionPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Auksion
        </h1>
      </div>
      <div className="text-center py-16">
        <p className="text-muted-foreground">Auksion bo'limi tez kunda ishga tushadi.</p>
      </div>
    </div>
  );
}
