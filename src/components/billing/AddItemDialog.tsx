import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Item, Unit, useItems } from "@/lib/store";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const UNITS: Unit[] = ["pcs", "kg", "g", "litre", "ml"];

export function AddItemDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { items, addItem } = useItems();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState<Unit>("pcs");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();

  const reset = () => {
    setCode(""); setName(""); setCategory(""); setUnit("pcs");
    setPrice(""); setCost(""); setMrp(""); setStock("");
  };

  const submit = () => {
    if (!code.trim() || !name.trim() || !category.trim() || !price) {
      toast.error("Please fill code, name, category and sell price");
      return;
    }
    if (items.some((i) => i.code === code.trim())) {
      toast.error(`Code ${code} already exists`);
      return;
    }
    const p = parseFloat(price);
    const c = cost ? parseFloat(cost) : 0;
    const m = mrp ? parseFloat(mrp) : p;
    const s = stock ? parseFloat(stock) : 0;
    if (isNaN(p) || p < 0) { toast.error("Invalid sell price"); return; }
    const item: Item = {
      code: code.trim(), name: name.trim(), category: category.trim(),
      unit, price: p, cost: c, mrp: m, stock: s,
    };
    addItem(item);
    toast.success(`Added ${item.name}`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new item</DialogTitle>
          <DialogDescription>
            Define a unique code, category and unit. The price is per unit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 601" />
          </div>
          <div className="col-span-1">
            <Label>Sell price / unit</Label>
            <Input type="number" step="0.01" value={price}
              onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div className="col-span-1">
            <Label>Buy price / unit</Label>
            <Input type="number" step="0.01" value={cost}
              onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
          </div>
          <div className="col-span-1">
            <Label>MRP / unit</Label>
            <Input type="number" step="0.01" value={mrp}
              onChange={(e) => setMrp(e.target.value)} placeholder="same as sell" />
          </div>
          <div className="col-span-1">
            <Label>Opening stock</Label>
            <Input type="number" step="0.001" value={stock}
              onChange={(e) => setStock(e.target.value)} placeholder="0" />
          </div>
          <div className="col-span-2">
            <Label>Item name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Brown Bread" />
          </div>
          <div className="col-span-1">
            <Label>Category</Label>
            <Input
              list="cat-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Bakery"
            />
            <datalist id="cat-list">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="col-span-1">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
