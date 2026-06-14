import { useEffect, useState } from "react";
import { getItems, createItem, updateItem, deleteItem, getSales, createSale } from "./api";

export type Unit = "pcs" | "kg" | "g" | "litre" | "ml";

export interface Item {
  code: string;
  name: string;
  category: string;
  unit: Unit;
  price: number;
  cost?: number;
  mrp?: number;
  stock?: number;
}

export interface CartLine {
  code: string;
  name: string;
  unit: Unit;
  price: number;
  qty: number;
  cost?: number;
  mrp?: number;
}

export type SaleType = "Cash" | "Card" | "UPI" | "Credit";

export interface Sale {
  invoice: string;
  date: string;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  customer?: string;
  cashier?: string;
  saleType?: SaleType;
}

export interface StockMovement {
  id: string;
  date: string;
  code: string;
  name: string;
  unit: Unit;
  qty: number;
  type: "in" | "out";
  cost?: number;
  note?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  taxPercent: number;
}

// ============ ITEMS HOOK (with API) ============
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addItem = async (item: Item) => {
    try {
      const newItem = await createItem(item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      console.error("Failed to add item:", error);
      throw error;
    }
  };

  const updateItemAPI = async (code: string, item: Item) => {
    try {
      const updated = await updateItem(code, item);
      setItems(prev => prev.map(i => i.code === code ? updated : i));
      return updated;
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    }
  };

  const removeItem = async (code: string) => {
    try {
      await deleteItem(code);
      setItems(prev => prev.filter(i => i.code !== code));
    } catch (error) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  };

  const findByCode = (code: string) => items.find(i => i.code === code);

  const adjustStock = (code: string, delta: number) => {
    setItems(prev => prev.map(i =>
      i.code === code ? { ...i, stock: (i.stock || 0) + delta } : i
    ));
  };

  return { items, loading, addItem, updateItem: updateItemAPI, removeItem, findByCode, adjustStock, refresh: loadItems };
}

// ============ SHOP HOOK (SSR Safe) ============
const SHOP_DEFAULT: ShopInfo = {
  name: "FreshMart",
  address: "12 Market Street, City",
  phone: "+91 98765 43210",
  taxPercent: 5,
};

export function useShop() {
  const [shop, setShop] = useState<ShopInfo>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("grocery.shop.v1");
      return saved ? JSON.parse(saved) : SHOP_DEFAULT;
    }
    return SHOP_DEFAULT;
  });

  const update = (newShop: ShopInfo) => {
    setShop(newShop);
    if (typeof window !== 'undefined') {
      localStorage.setItem("grocery.shop.v1", JSON.stringify(newShop));
    }
  };

  return { shop, update };
}

// ============ SALES HOOK (with API) ============
export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      const formattedSales = data.map((sale: any) => ({
        invoice: sale.invoice,
        date: sale.saleDate,
        lines: [],
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        profit: sale.profit,
        customer: sale.customerName,
        cashier: sale.cashierName,
        saleType: sale.saleType,
      }));
      setSales(formattedSales);
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const addSale = async (sale: Sale) => {
    try {
      const saleRequest = {
        invoice: sale.invoice,
        customerName: sale.customer || "Customer",
        cashierName: sale.cashier || "Admin",
        saleType: sale.saleType || "Cash",
        discount: sale.discount,
        cartLines: sale.lines.map(line => ({
          itemCode: line.code,
          quantity: line.qty,
        })),
      };
      const newSale = await createSale(saleRequest);
      await loadSales();
      return newSale;
    } catch (error) {
      console.error("Failed to create sale:", error);
      throw error;
    }
  };

  return { sales, loading, addSale, refresh: loadSales };
}

// ============ STOCK MOVEMENTS HOOK ============
export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const addMovement = (movement: StockMovement) => {
    setMovements(prev => [movement, ...prev]);
  };

  return { movements, addMovement };
}

// ============ EXPENSES HOOK (SSR Safe) ============
const EXPENSE_KEY = "grocery.expenses.v1";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EXPENSE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const addExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(updated));
    }
  };

  const removeExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(updated));
    }
  };

  return { expenses, addExpense, removeExpense };
}

// ============ UTILITIES ============
export function formatMoney(n: number) {
  return "₹" + n.toFixed(2);
}

export function unitLabel(u: Unit) {
  return u;
}

export function isWeighted(u: Unit) {
  return u === "kg" || u === "litre";
}