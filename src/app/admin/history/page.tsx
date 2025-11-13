'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { WithdrawalRequest, Nft } from '@/lib/data'; // Assuming Nft type is needed
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

// Combined type for a richer history view
interface TransactionHistoryItem {
  id: string;
  type: 'Withdrawal' | 'Sale' | 'Purchase';
  date: Date;
  details: string;
  amount?: number;
  status: 'Completed' | 'Pending'; // Simplified status
}


export default function AdminHistoryPage() {
  const firestore = useFirestore();
  const [history, setHistory] = useState<TransactionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      const allHistory: TransactionHistoryItem[] = [];

      try {
        // Fetch withdrawals
        const withdrawalsRef = collection(firestore, 'withdrawals');
        const withdrawalsQuery = query(withdrawalsRef, orderBy('completedAt', 'desc'));
        const withdrawalSnap = await getDocs(withdrawalsQuery);

        withdrawalSnap.forEach(doc => {
          const data = doc.data() as WithdrawalRequest;
          if (data.completedAt) {
             allHistory.push({
              id: doc.id,
              type: 'Withdrawal',
              date: (data.completedAt as any).toDate(),
              details: `NFT "${data.nftName}" to @${data.telegramUsername}`,
              amount: 0, // No monetary value for withdrawal
              status: 'Completed',
            });
          }
        });
        
        // In the future, you would also fetch sales and purchases from a dedicated 'transactions' collection.
        // For now, we only have withdrawals.

        // Sort all history items by date, descending
        allHistory.sort((a, b) => b.date.getTime() - a.date.getTime());

        setHistory(allHistory);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [firestore]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Tranzaksiyalar Tarixi</h2>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Turi</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Tafsilotlar</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && history.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                   <Badge variant={item.type === 'Withdrawal' ? 'secondary' : 'default'}>{item.type}</Badge>
                </TableCell>
                <TableCell>{item.date.toLocaleString()}</TableCell>
                <TableCell className="font-medium">{item.details}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={item.status === 'Completed' ? 'default' : 'outline'} className="bg-green-500/20 text-green-400 border-green-500/30">
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && history.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Hozircha tranzaksiyalar mavjud emas.
        </div>
      )}
    </div>
  );
}
