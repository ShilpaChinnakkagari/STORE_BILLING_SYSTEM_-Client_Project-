import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartLine, formatMoney, isWeighted, SaleType, useItems, useSales, useShop, useStockMovements,
} from "@/lib/store";
import { ItemCatalog } from "./ItemCatalog";
import { Receipt } from "./Receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Minus, Plus, Printer, Trash2, X, Receipt as ReceiptIcon, User, BadgeIndianRupee } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const QUICK_QTY = [0.25, 0.5, 0.75, 1];

export function BillingScreen() {
  const { findByCode, adjustStock } = useItems();
  const { shop } = useShop();
  const { addSale } = useSales();
  const { addMovement } = useStockMovements();
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("1");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [invoice, setInvoice] = useState(() => "INV-" + Date.now().toString().slice(-6));
  const [committed, setCommitted] = useState(false);
  const [customer, setCustomer] = useState("Customer");
  const [cashier, setCashier] = useState("Admin");
  const [saleType, setSaleType] = useState<SaleType>("Cash");
  const [discountInput, setDiscountInput] = useState("0");
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { codeRef.current?.focus(); }, []);

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + l.qty * l.price, 0),
    [cart]
  );
  const discount = Math.max(0, Math.min(parseFloat(discountInput) || 0, subtotal));
  const taxable = Math.max(0, subtotal - discount);
  const tax = (taxable * shop.taxPercent) / 100;
  const total = taxable + tax;
  const profit = useMemo(
    () => cart.reduce((s, l) => s + l.qty * (l.price - (l.cost ?? 0)), 0) - discount,
    [cart, discount]
  );
  const mrpTotal = useMemo(
    () => cart.reduce((s, l) => s + l.qty * (l.mrp ?? l.price), 0),
    [cart]
  );

  const previewItem = findByCode(code.trim());

  const addCode = (rawCode?: string, rawQty?: string) => {
    const c = (rawCode ?? code).trim();
    if (!c) return;
    const item = findByCode(c);
    if (!item) { toast.error(`No item with code ${c}`); return; }
    const q = parseFloat((rawQty ?? qty) || "1");
    if (isNaN(q) || q <= 0) { toast.error("Invalid quantity"); return; }
    setCart((prev) => {
      const existing = prev.find((l) => l.code === item.code);
      if (existing) {
        return prev.map((l) =>
          l.code === item.code ? { ...l, qty: +(l.qty + q).toFixed(3) } : l
        );
      }
      return [...prev, {
        code: item.code, name: item.name, unit: item.unit,
        price: item.price, qty: q, cost: item.cost, mrp: item.mrp,
      }];
    });
    setCode(""); setQty("1");
    codeRef.current?.focus();
  };

  const updateQty = (c: string, q: number) => {
    if (q <= 0) { setCart((prev) => prev.filter((l) => l.code !== c)); return; }
    setCart((prev) => prev.map((l) => (l.code === c ? { ...l, qty: +q.toFixed(3) } : l)));
  };

  const remove = (c: string) => setCart((prev) => prev.filter((l) => l.code !== c));
  const clear = () => {
    setCart([]); setCommitted(false);
    setInvoice("INV-" + Date.now().toString().slice(-6));
    setDiscountInput("0");
    setCustomer("Customer");
  };

  const commitSale = () => {
    if (committed || cart.length === 0) return;
    const date = new Date().toISOString();
    addSale({
      invoice, date, lines: cart, subtotal, discount, tax, total, profit,
      customer: customer.trim() || "Customer",
      cashier: cashier.trim() || "Admin",
      saleType,
    });
    cart.forEach((l) => {
      adjustStock(l.code, -l.qty);
      addMovement({
        id: "MV-" + Date.now() + "-" + l.code,
        date, code: l.code, name: l.name, unit: l.unit,
        qty: l.qty, type: "out", note: invoice,
      });
    });
    setCommitted(true);
  };

  const openReceipt = () => { commitSale(); setShowReceipt(true); };

  const onPrint = () => { commitSale(); setShowReceipt(true); setTimeout(() => window.print(), 300); };

  const onDownload = () => {
    commitSale();
    const node = document.getElementById("receipt-print");
    const html = node?.outerHTML ?? "";
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${invoice}</title>
<style>body{font-family:ui-monospace,Menlo,monospace;margin:0;padding:16px;color:#000;background:#fff}
#receipt-print{width:300px;margin:0 auto}
table{width:100%;border-collapse:collapse}
.bdash{border-top:1px dashed #000;margin:8px 0}
@media print{@page{margin:0;size:80mm auto}body{padding:0}}
</style></head><body>${html}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${invoice}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_360px]">
      <aside className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-3 py-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Item Codes
          </h2>
        </div>
        <ItemCatalog onPick={(item) => addCode(item.code, "1")} />
      </aside>

      <main className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs uppercase text-muted-foreground">Item code</Label>
              <Input
                ref={codeRef} value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addCode(); }}
                placeholder="Type code & press Enter (e.g. 101)"
                className="h-11 font-mono text-base"
              />
            </div>
            <div className="w-24">
              <Label className="text-xs uppercase text-muted-foreground">Qty</Label>
              <Input
                value={qty} onChange={(e) => setQty(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addCode(); }}
                className="h-11 text-center font-mono text-base"
              />
            </div>
            <Button onClick={() => addCode()} className="h-11">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
          {previewItem && isWeighted(previewItem.unit) && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Quick {previewItem.unit}:</span>
              {QUICK_QTY.map((q) => (
                <Button key={q} size="sm" variant="secondary" className="h-7 px-2 text-xs"
                  onClick={() => addCode(previewItem.code, q.toString())}>
                  {q === 1 ? "1" : q === 0.25 ? "¼" : q === 0.5 ? "½" : "¾"} {previewItem.unit}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="px-6">
                <ReceiptIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No items yet. Type a code or pick from the left.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background/95 text-xs uppercase text-muted-foreground backdrop-blur">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-2 py-2 text-left">Item</th>
                  <th className="px-2 py-2 text-center">Qty</th>
                  <th className="px-2 py-2 text-right">MRP</th>
                  <th className="px-2 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((l) => {
                  const mrp = l.mrp ?? l.price;
                  const saved = mrp > l.price;
                  return (
                    <tr key={l.code} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="px-4 py-2 font-mono text-xs font-bold text-primary">{l.code}</td>
                      <td className="px-2 py-2">
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">per {l.unit}</div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6"
                            onClick={() => updateQty(l.code, l.qty - (isWeighted(l.unit) ? 0.25 : 1))}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-mono text-sm">
                            {l.qty}<span className="text-xs text-muted-foreground">{l.unit}</span>
                          </span>
                          <Button size="icon" variant="ghost" className="h-6 w-6"
                            onClick={() => updateQty(l.code, l.qty + (isWeighted(l.unit) ? 0.25 : 1))}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-xs">
                        <span className={saved ? "line-through text-muted-foreground" : ""}>
                          {formatMoney(mrp)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right font-mono">{formatMoney(l.price)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">
                        {formatMoney(l.qty * l.price)}
                      </td>
                      <td className="px-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => remove(l.code)}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <aside className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bill Summary
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {invoice} {committed && <span className="ml-1 text-green-600">• saved</span>}
          </p>
        </div>

        <div className="space-y-2 border-b border-border px-4 py-3">
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Customer</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Customer"
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Cashier</Label>
              <Input
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                placeholder="Admin"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Sale type</Label>
              <Select value={saleType} onValueChange={(v) => setSaleType(v as SaleType)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">Discount (₹)</Label>
            <div className="relative">
              <BadgeIndianRupee className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                inputMode="decimal"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0"
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 px-4 py-4 text-sm">
          <Row label="Items" value={cart.length.toString()} />
          <Row label="Units" value={cart.reduce((s, l) => s + l.qty, 0).toFixed(2)} />
          <Row label="MRP total" value={formatMoney(mrpTotal)} />
          <div className="border-t border-border pt-2" />
          <Row label="Subtotal" value={formatMoney(subtotal)} />
          <Row label="Discount" value={`- ${formatMoney(discount)}`} />
          <Row label={`GST (${shop.taxPercent}%)`} value={formatMoney(tax)} />
          <Row label="Est. profit" value={formatMoney(profit)} />
          <div className="border-t border-border pt-2" />
          <div className="flex items-end justify-between">
            <span className="text-sm uppercase text-muted-foreground">Total</span>
            <span className="font-mono text-3xl font-bold tabular-nums text-primary">
              {formatMoney(total)}
            </span>
          </div>
        </div>
        <div className="space-y-2 border-t border-border bg-muted/20 p-4">
          <Button className="h-12 w-full text-base" disabled={cart.length === 0} onClick={openReceipt}>
            <ReceiptIcon className="mr-2 h-5 w-5" /> Generate Receipt
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={cart.length === 0} onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="secondary" disabled={cart.length === 0} onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
          <Button variant="outline" className="w-full" disabled={cart.length === 0} onClick={clear}>
            <Trash2 className="mr-2 h-4 w-4" /> {committed ? "New Bill" : "Clear Bill"}
          </Button>
        </div>

        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Receipt Preview</DialogTitle></DialogHeader>
            <Receipt shop={shop} cart={cart} invoiceNo={invoice} date={new Date()}
              customer={customer} cashier={cashier} saleType={saleType} discount={discount} />
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => window.print()}>
                <Printer className="mr-1 h-4 w-4" /> Print
              </Button>
              <Button variant="secondary" onClick={onDownload}>
                <Download className="mr-1 h-4 w-4" /> Save
              </Button>
              <Button variant="outline"
                onClick={() => { setShowReceipt(false); clear(); toast.success("Bill completed"); }}>
                New
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
