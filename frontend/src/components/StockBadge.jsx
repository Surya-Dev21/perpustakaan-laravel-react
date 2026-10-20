import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export default function StockBadge({ stokTersedia, stokTotal, status, className }) {
  const isAvailable = status === 'Tersedia' || Number(stokTersedia) > 0;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Badge variant={isAvailable ? 'success' : 'destructive'} className="w-fit gap-1.5">
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            isAvailable ? 'bg-emerald-500' : 'bg-red-500'
          )}
        />
        {isAvailable ? 'Tersedia' : 'Habis'}
      </Badge>
      <span className="text-[11px] font-medium text-muted-foreground">
        {stokTersedia} / {stokTotal} eksemplar
      </span>
    </div>
  );
}
