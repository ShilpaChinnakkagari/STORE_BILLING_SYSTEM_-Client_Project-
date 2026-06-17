import { useItems, formatMoney, useStockMovements } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { AddItemDialog } from "./AddItemDialog";
import { StockInDialog } from "./StockInDialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useMemo, useEffect, useState } from "react";

export function ManageItems() {
  const { items, removeItem, refresh } = useItems();
  const { movements, loadMovements } = useStockMovements();
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadMovements();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMovements(), refresh()]);
    setRefreshing(false);
    toast.success("Data refreshed");
  };

  const totals = useMemo(() => {
    const m: Record<string, { in: number; out: number }> = {};
    movements.forEach((mv) => {
      m[mv.code] ??= { in: 0, out: 0 };
      if (mv.type === "in") {
        m[mv.code].in += mv.qty;
      } else if (mv.type === "out") {
        m[mv.code].out += mv.qty;
      }
    });
    return m;
  }, [movements]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const stockA = a.stock ?? 0;
      const stockB = b.stock ?? 0;
      return stockA - stockB;
    });
  }, [items]);

  const handleDelete = async (code: string, name: string) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(code);
    try {
      await removeItem(code);
      toast.success(`"${name}" deleted successfully!`);
      // Refresh the list to ensure it's gone
      await refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete "${name}": ${error.message || 'Unknown error'}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Item Catalog</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} items · Stocked, Sold and Balance update live.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
          <StockInDialog />
          <AddItemDialog />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Stocked In</TableHead>
              <TableHead className="text-right">Sold Out</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Buy Price</TableHead>
              <TableHead className="text-right">Sell Price</TableHead>
              <TableHead className="text-right">Profit/u</TableHead>
              <TableHead className="text-right">Margin %</TableHead>
              <TableHead className="text-right">Stock Value</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                  No items found. Click "Add Item" to create one.
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((i) => {
                const cost = i.cost ?? 0;
                const profit = i.price - cost;
                const margin = i.price > 0 ? (profit / i.price) * 100 : 0;
                const balance = i.stock ?? 0;
                const t = totals[i.code] ?? { in: 0, out: 0 };
                const stockValue = balance * cost;
                const isLowStock = balance <= 5;
                const isDeleting = deleting === i.code;

                return (
                  <TableRow 
                    key={i.code} 
                    className={`transition-colors hover:bg-muted/40 ${isLowStock ? 'bg-red-50/50' : ''}`}
                  >
                    <TableCell className="font-mono font-semibold text-primary">{i.code}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isLowStock && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {i.name}
                        {isLowStock && (
                          <span className="text-xs text-red-500 font-semibold">(Low Stock!)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{i.category}</TableCell>
                    <TableCell>{i.unit}</TableCell>
                    <TableCell className="text-right font-mono text-brand-cyan">+{t.in.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600 font-bold">
                      {t.out > 0 ? `-${t.out.toFixed(2)}` : '0.00'}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${balance <= 5 ? "text-red-600" : balance <= 10 ? "text-orange-500" : "text-green-600"}`}>
                      {balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatMoney(cost)}</TableCell>
                    <TableCell className="text-right font-mono">{formatMoney(i.price)}</TableCell>
                    <TableCell className={`text-right font-mono ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {formatMoney(profit)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${margin > 20 ? 'text-green-600' : margin > 10 ? 'text-orange-500' : 'text-red-500'}`}>
                      {margin.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatMoney(stockValue)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => handleDelete(i.code, i.name)}
                        title="Delete item"
                      >
                        {isDeleting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-50 border border-red-300 rounded"></div>
          <span>Low Stock (≤5)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-50 border border-orange-300 rounded"></div>
          <span>Medium Stock (6-10)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
          <span>Good Stock ({'>'}10)</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <span className="text-green-600">▲</span> High Margin ({'>'}20%)
        </div>
        <div className="flex items-center gap-1">
          <span className="text-orange-500">▲</span> Medium Margin (10-20%)
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-500">▼</span> Low Margin ({'<'}10%)
        </div>
      </div>
    </div>
  );
}