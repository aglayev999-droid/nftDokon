
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description?: string;
  color?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  color = 'text-accent',
}: StatCardProps) {
  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-5 w-5 text-muted-foreground', color)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold font-headline', color)}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
