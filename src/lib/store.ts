import { useEffect, useState } from "react";
import { 
  getItems, createItem, updateItem, deleteItem, 
  getSales, createSale,
  getExpenses, createExpense, deleteExpense
} from "./api";
import { toast } from "sonner";

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

// ============ ITEMS HOOK ============
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

  const refresh = async () => {
    await loadItems();
  };

  return { items, loading, addItem, updateItem: updateItemAPI, removeItem, findByCode, adjustStock, refresh };
}

// ============ SHOP HOOK ============
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

// ============ SALES HOOK ============
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
      await createSale(saleRequest);
      await loadSales();
    } catch (error) {
      console.error("Failed to create sale:", error);
      throw error;
    }
  };

  const refresh = async () => {
    await loadSales();
  };

  return { sales, loading, addSale, refresh };
}

// ============ STOCK MOVEMENTS HOOK ============
const STOCK_KEY = "grocery.stock.v1";

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/stock/movements');
      if (!response.ok) {
        throw new Error('Failed to fetch stock movements');
      }
      const data = await response.json();
      
      const formatted = data.map((m: any) => ({
        id: m.id,
        date: m.movementDate,
        code: m.item.code,
        name: m.itemName,
        unit: m.unit.toLowerCase(),
        qty: m.quantity,
        type: m.type.toLowerCase() === 'in' ? 'in' : 'out',
        cost: m.cost,
        note: m.note,
      }));
      
      setMovements(formatted);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STOCK_KEY, JSON.stringify(formatted));
      }
      
      return formatted;
    } catch (error) {
      console.error("Failed to load movements from API:", error);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STOCK_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setMovements(parsed);
          return parsed;
        }
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const addMovement = async (movement: StockMovement) => {
    setMovements(prev => {
      const updated = [movement, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STOCK_KEY, JSON.stringify(updated));
      }
      return updated;
    });
    
    try {
      const response = await fetch('http://localhost:8080/api/stock/in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemCode: movement.code,
          quantity: movement.qty,
          cost: movement.cost || 0,
          note: movement.note || 'Manual entry',
          reference: 'Manual',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save to backend');
      }
      
      const data = await response.json();
      console.log('✅ Stock saved to backend:', data);
      await loadMovements();
      
    } catch (error) {
      console.error('Failed to save stock to backend:', error);
      toast.error('Stock saved locally but failed to sync to database');
    }
  };

  return { movements, loading, addMovement, loadMovements };
}

// ============ EXPENSES HOOK (FIXED - Full CRUD) ============
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      console.log('📊 Raw expenses from API:', data);
      
      // ✅ Map API response to frontend format
      const formattedExpenses = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || item.expenseId,
        date: item.expenseDate || item.date || new Date().toISOString(),
        category: item.category || 'Uncategorized',
        description: item.description || '',
        amount: item.amount || 0,
      })) : [];
      
      console.log('📊 Formatted expenses:', formattedExpenses);
      setExpenses(formattedExpenses);
      
      // Save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem("grocery.expenses.v1", JSON.stringify(formattedExpenses));
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
      // ✅ Try to load from localStorage as fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem("grocery.expenses.v1");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setExpenses(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setExpenses([]);
          }
        } else {
          setExpenses([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const addExpense = async (expense: Expense) => {
    try {
      console.log('📤 Adding expense:', expense);
      
      const newExpense = await createExpense({
        id: expense.id || "EXP-" + Date.now(),
        expenseDate: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        category: expense.category,
        description: expense.description || '',
        amount: expense.amount,
      });
      
      console.log('📥 Response from createExpense:', newExpense);
      
      // ✅ Format the response
      const formattedExpense: Expense = {
        id: newExpense.id || expense.id,
        date: newExpense.expenseDate || expense.date || new Date().toISOString(),
        category: newExpense.category || expense.category,
        description: newExpense.description || expense.description || '',
        amount: newExpense.amount || expense.amount,
      };
      
      setExpenses(prev => [formattedExpense, ...prev]);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        const updated = [formattedExpense, ...expenses];
        localStorage.setItem("grocery.expenses.v1", JSON.stringify(updated));
      }
      
      toast.success('Expense added successfully!');
      return formattedExpense;
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast.error('Failed to add expense');
      throw error;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        const updated = expenses.filter(e => e.id !== id);
        localStorage.setItem("grocery.expenses.v1", JSON.stringify(updated));
      }
      
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  const refresh = async () => {
    await loadExpenses();
  };

  return { expenses, loading, addExpense, removeExpense, refresh };
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