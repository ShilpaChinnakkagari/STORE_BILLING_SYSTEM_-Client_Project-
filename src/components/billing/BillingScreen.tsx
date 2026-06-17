import { useState, useEffect, useRef } from "react";
import { useItems, useSales, useShop, CartLine, formatMoney, Unit } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, Minus, Search, X, ShoppingCart } from "lucide-react";
import { Receipt } from "./Receipt";

type SaleType = "Cash" | "Card" | "UPI" | "Credit";

export function BillingScreen() {
  const { items, adjustStock } = useItems();
  const { addSale } = useSales();
  const { shop } = useShop();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [itemCode, setItemCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [saleType, setSaleType] = useState<SaleType>("Cash");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const codeInputRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...new Set(items.map(i => i.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateInvoice = () => {
    const now = new Date();
    const prefix = "INV";
    const timestamp = now.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
  };

  useEffect(() => {
    setInvoiceNo(generateInvoice());
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  const handleItemLookup = () => {
    if (!itemCode.trim()) {
      toast.error("Please enter an item code");
      return;
    }

    const item = items.find(i => i.code === itemCode.trim());
    if (!item) {
      toast.error(`Item "${itemCode}" not found`);
      setItemCode("");
      return;
    }

    const currentStock = item.stock || 0;
    if (currentStock <= 0) {
      toast.error(`"${item.name}" is OUT OF STOCK!`);
      setItemCode("");
      return;
    }

    addItemToCart(item);
    setItemCode("");
    setQuantity(1);
    setQuantityInput("1");
    setSelectedItem(null);
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  };

  const handleItemClick = (item: any) => {
    const currentStock = item.stock || 0;
    if (currentStock <= 0) {
      toast.error(`"${item.name}" is OUT OF STOCK!`);
      return;
    }
    setSelectedItem(item);
    setItemCode(item.code);
    addItemToCart(item);
  };

  const getUnitLabel = (unit: Unit): string => {
    const unitMap: Record<Unit, string> = {
      'pcs': 'pcs',
      'kg': 'kg',
      'g': 'g',
      'litre': 'L',
      'ml': 'mL'
    };
    return unitMap[unit] || unit;
  };

  const addItemToCart = (item: any) => {
    const currentStock = item.stock || 0;
    if (currentStock <= 0) {
      toast.error(`"${item.name}" is OUT OF STOCK!`);
      return;
    }

    const qtyToAdd = quantity;

    const existing = cart.find(c => c.code === item.code);
    if (existing) {
      const newQty = existing.qty + qtyToAdd;
      if (newQty > currentStock) {
        toast.error(`Only ${currentStock} ${item.unit}(s) available in stock`);
        return;
      }
      updateCart(item.code, newQty);
    } else {
      if (qtyToAdd > currentStock) {
        toast.error(`Only ${currentStock} ${item.unit}(s) available in stock`);
        return;
      }
      const newItem: CartLine = {
        code: item.code,
        name: item.name,
        unit: item.unit,
        price: item.price,
        qty: qtyToAdd,
        cost: item.cost || 0,
        mrp: item.mrp || item.price,
      };
      setCart([...cart, newItem]);
      toast.success(`Added ${item.name} (${qtyToAdd} ${getUnitLabel(item.unit)})`);
    }
  };

  const updateCart = (code: string, newQty: number) => {
    const item = items.find(i => i.code === code);
    if (item && newQty > (item.stock || 0)) {
      toast.error(`Only ${item.stock} ${item.unit}(s) available in stock`);
      return;
    }
    setCart(cart.map(c => c.code === code ? { ...c, qty: newQty } : c));
  };

  const removeFromCart = (code: string) => {
    setCart(cart.filter(c => c.code !== code));
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setDiscountPercent(0);
    setSelectedItem(null);
    setQuantity(1);
    setQuantityInput("1");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = (taxable * shop.taxPercent) / 100;
  const total = taxable + tax;
  const profit = cart.reduce((sum, item) => sum + (item.qty * (item.price - (item.cost || 0))), 0);

  const handleSubmitBill = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    // Double check stock before billing
    for (const cartItem of cart) {
      const item = items.find(i => i.code === cartItem.code);
      if (!item) {
        toast.error(`Item "${cartItem.name}" not found!`);
        return;
      }
      if ((item.stock || 0) < cartItem.qty) {
        toast.error(`Insufficient stock for "${item.name}". Available: ${item.stock}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const sale = {
        invoice: invoiceNo,
        date: new Date().toISOString(),
        lines: cart,
        subtotal: subtotal,
        discount: discountAmount,
        tax: tax,
        total: total,
        profit: profit,
        customer: customerName || "Customer",
        cashier: "Admin",
        saleType: saleType,
      };

      await addSale(sale);
      cart.forEach(item => adjustStock(item.code, -item.qty));
      toast.success(`Bill ${invoiceNo} generated successfully!`);
      setShowReceipt(true);
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error("Failed to generate bill");
    } finally {
      setSubmitting(false);
    }
  };

  const generateNewInvoice = () => {
    setInvoiceNo(generateInvoice());
    clearCart();
    setShowReceipt(false);
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleItemLookup();
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantityInput(value);
    if (value === "") return;
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
    }
  };

  const handleQuickQty = (qty: number) => {
    setQuantity(qty);
    setQuantityInput(String(qty));
  };

  const handleQuantityBlur = () => {
    if (quantityInput === "" || Number(quantityInput) < 1) {
      setQuantity(1);
      setQuantityInput("1");
    }
  };

  const quickQty = [1, 2, 5, 10];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* LEFT SIDE - Item Browser */}
      <div className="w-1/2 flex flex-col border rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredItems.length} items found
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map((item) => {
              const stock = item.stock || 0;
              const isInCart = cart.some(c => c.code === item.code);
              const isSelected = selectedItem?.code === item.code;
              
              return (
                <div
                  key={item.code}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                    ${isInCart ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => {
                    if (stock > 0) {
                      handleItemClick(item);
                    } else {
                      toast.error(`${item.name} is OUT OF STOCK!`);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">#{item.code}</p>
                    </div>
                    {isInCart && (
                      <div className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {cart.find(c => c.code === item.code)?.qty || 0}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">{formatMoney(item.price)}</span>
                    <span className={`text-xs ${stock <= 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                      {stock <= 0 ? 'OUT OF STOCK' : `Stock: ${stock} ${getUnitLabel(item.unit)}`}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">{getUnitLabel(item.unit)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Billing */}
      <div className="w-1/2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Billing</h2>
            <p className="text-sm text-muted-foreground">Invoice: {invoiceNo}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Items: {cart.length}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Total: {formatMoney(total)}</span>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <Label className="text-xs">Customer</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Payment</Label>
            <Select value={saleType} onValueChange={(v) => setSaleType(v as SaleType)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Discount (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              placeholder="0"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <Label className="text-xs">Quick Add by Code</Label>
            <div className="flex gap-1">
              <Input
                ref={codeInputRef}
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter code"
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" onClick={handleItemLookup} className="h-8">
                Add
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs">
              Qty ({selectedItem ? getUnitLabel(selectedItem.unit) : 'unit'})
            </Label>
            <Input
              type="number"
              min="1"
              value={quantityInput}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              className="h-8 text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          <div>
            <Label className="text-xs">Quick</Label>
            <div className="flex gap-1">
              {quickQty.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className={`flex-1 h-8 text-xs ${quantity === q ? 'border-primary bg-primary/10' : ''}`}
                  onClick={() => handleQuickQty(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Cart is empty. Click items on the left to add.
                  </TableCell>
                </TableRow>
              ) : (
                cart.map((item) => (
                  <TableRow key={item.code} className="text-sm">
                    <TableCell>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">#{item.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateCart(item.code, Math.max(1, item.qty - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.qty}{getUnitLabel(item.unit)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateCart(item.code, item.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(item.price)}</TableCell>
                    <TableCell className="text-right">{formatMoney(item.price * item.qty)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFromCart(item.code)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="text-lg font-bold">{cart.reduce((sum, i) => sum + i.qty, 0)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-lg font-bold">{formatMoney(subtotal)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Discount</p>
            <p className="text-lg font-bold text-red-500">-{formatMoney(discountAmount)}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-2 text-center border-2 border-primary">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-primary">{formatMoney(total)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmitBill}
            disabled={cart.length === 0 || submitting}
            className="flex-1"
            size="default"
          >
            {submitting ? "Processing..." : "Generate Receipt"}
          </Button>
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={generateNewInvoice}>
            New
          </Button>
        </div>
      </div>

      {showReceipt && (
        <Receipt
          shop={shop}
          cart={cart}
          invoiceNo={invoiceNo}
          date={new Date()}
          customer={customerName || "Customer"}
          cashier="Admin"
          saleType={saleType}
          discount={discountAmount}
          onClose={() => setShowReceipt(false)}
          onNew={generateNewInvoice}
        />
      )}
    </div>
  );
}