
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { UserAccount } from '@/lib/data';
import { collection } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';


export default function AdminAccountsPage() {
  const firestore = useFirestore();

  const usersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  
  const { data: users, isLoading } = useCollection<UserAccount>(usersRef);

  return (
    <div>
        <h2 className="text-2xl font-semibold mb-4">Foydalanuvchilar</h2>
        
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>To'liq Ism</TableHead>
                        <TableHead>Telegram Username</TableHead>
                        <TableHead className="text-right">Balans (UZS)</TableHead>
                        <TableHead className="text-right">Harakatlar</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && users?.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.fullName}</TableCell>
                            <TableCell>
                                {user.username ? (
                                    <a href={`https://t.me/${user.username}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        @{user.username}
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">Mavjud emas</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-mono">{user.balance.toLocaleString()} UZS</TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ko'rish
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {!isLoading && users?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                Hozircha foydalanuvchilar mavjud emas.
            </div>
        )}
    </div>
  );
}
