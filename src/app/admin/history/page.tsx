
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { WithdrawalRequest } from '@/lib/data';
import { collection, query, orderBy } from 'firebase/firestore';
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
import { useLanguage } from '@/context/language-context';


export default function AdminHistoryPage() {
  const firestore = useFirestore();
  const { translations } = useLanguage();
  const t = (key: string) => translations[key] || key;

  const withdrawalsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'withdrawals') : null),
    [firestore]
  );

  const withdrawalsQuery = useMemoFirebase(
    () => (withdrawalsRef ? query(withdrawalsRef, orderBy('requestedAt', 'desc')) : null),
    [withdrawalsRef]
  );
  
  const { data: withdrawals, isLoading } = useCollection<WithdrawalRequest>(withdrawalsQuery);
  
  const getStatusVariant = (status: 'pending' | 'completed') => {
    switch (status) {
        case 'completed':
            return 'default'; // Uses primary color, often green or blue
        case 'pending':
            return 'secondary'; // Muted, greyish background
        default:
            return 'outline';
    }
  }
  const getStatusClass = (status: 'pending' | 'completed') => {
    switch (status) {
        case 'completed':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'pending':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default:
            return '';
    }
  }


  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Pul Yechib Olish Tarixi</h2>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead>NFT</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && withdrawals?.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">@{item.telegramUsername}</div>
                  <div className="text-xs text-muted-foreground">{item.userId}</div>
                </TableCell>
                <TableCell>{item.nftName}</TableCell>
                <TableCell>{item.requestedAt?.toDate().toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={getStatusVariant(item.status)} className={getStatusClass(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && withdrawals?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Hozircha pul yechib olishlar mavjud emas.
        </div>
      )}
    </div>
  );
}
