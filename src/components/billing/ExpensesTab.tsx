import { useState, useEffect } from "react";
import { formatMoney, useExpenses } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function ExpensesTab() {
  const { expenses, addExpense, removeExpense, loading, refresh } = useExpenses();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  // Load expenses on mount
  useEffect(() => {
    refresh();
  }, []);

  const submit = async () => {
    const a = parseFloat(amount);
    if (!category.trim() || !a || a <= 0) {
      toast.error("Enter category and a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      await addExpense({
        id: "EXP-" + Date.now(),
        date: new Date(date).toISOString(),
        category: category.trim(),
        description: description.trim(),
        amount: a,
      });
      setCategory("");
      setDescription("");
      setAmount("");
      toast.success("Expense logged");
    } catch (error) {
      toast.error("Failed to add expense");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeExpense(id);
      toast.success("Deleted");
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error(error);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const totalToday = Array.isArray(expenses) 
    ? expenses.filter((e) => e.date?.slice(0, 10) === today).reduce((s, e) => s + e.amount, 0)
    : 0;
  const totalAll = Array.isArray(expenses) 
    ? expenses.reduce((s, e) => s + e.amount, 0)
    : 0;

  // 🔍 Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // 🔍 Show error if expenses is not an array
  if (!Array.isArray(expenses)) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border-2 border-red-400 p-6 rounded-lg max-w-md mx-auto">
          <h3 className="font-bold text-red-600 text-lg">⚠️ Error Loading Expenses</h3>
          <p className="text-sm mt-2 text-gray-600">Unable to load expense data. Please try refreshing.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Log Expense
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              />
            </div>
            <div className="col-span-2">
              <Label>Category</Label>
              <Input
                value={category} onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Rent, Electricity, Wages"
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Input
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="optional note"
              />
            </div>
          </div>
          <Button className="mt-3 w-full" onClick={submit} disabled={submitting}>
            <Plus className="mr-1 h-4 w-4" /> {submitting ? "Saving..." : "Add Expense"}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Today's Expenses" value={formatMoney(totalToday)} />
          <StatCard label="All-time Expenses" value={formatMoney(totalAll)} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No expenses logged yet.
                </TableCell>
              </TableRow>
            )}
            {expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">
                  {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="font-medium">{e.category || 'Uncategorized'}</TableCell>
                <TableCell className="text-muted-foreground">{e.description || '-'}</TableCell>
                <TableCell className="text-right font-mono">{formatMoney(e.amount || 0)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon"
                    onClick={() => handleDelete(e.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}