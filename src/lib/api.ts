// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Store token in memory only
let authToken: string | null = null;

// Helper to get headers with auth token
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// Set auth token after login
export const setAuthToken = (token: string) => {
  authToken = token;
};

// Clear auth token on logout
export const clearAuthToken = () => {
  authToken = null;
};

// Get current auth token
export const getAuthToken = () => authToken;

// ============ AUTH API ============
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Login failed');
  }
  
  const data = await response.json();
  setAuthToken(data.token);
  return data;
};

export const logout = async () => {
  clearAuthToken();
};

// ============ ITEMS API ============
export const getItems = async () => {
  try {
    console.log('🔄 Fetching items from API...');
    const response = await fetch(`${API_BASE_URL}/items?t=${Date.now()}`, {
      headers: getHeaders(),
      cache: 'no-cache',
    });
    if (!response.ok) throw new Error('Failed to fetch items');
    const data = await response.json();
    console.log('✅ Items fetched:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error fetching items:', error);
    throw error;
  }
};

export const getItemByCode = async (code: string) => {
  const response = await fetch(`${API_BASE_URL}/items/${code}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Item not found');
  return response.json();
};

export const createItem = async (item: any) => {
  try {
    console.log('📤 Creating item:', item);
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to create item');
    const data = await response.json();
    console.log('✅ Item created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (code: string, item: any) => {
  try {
    console.log('📤 Updating item:', code);
    const response = await fetch(`${API_BASE_URL}/items/${code}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to update item');
    const data = await response.json();
    console.log('✅ Item updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (code: string) => {
  try {
    console.log(`🗑️ Deleting item: ${code}`);
    const response = await fetch(`${API_BASE_URL}/items/${code}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete item: ${response.status} - ${errorText}`);
    }
    console.log(`✅ Item deleted: ${code}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting item:', error);
    throw error;
  }
};

// ============ SALES API ============
export const getSales = async () => {
  const response = await fetch(`${API_BASE_URL}/sales`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch sales');
  return response.json();
};

export const getSaleByInvoice = async (invoice: string) => {
  const response = await fetch(`${API_BASE_URL}/sales/${invoice}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Sale not found');
  return response.json();
};

export const createSale = async (saleData: any) => {
  try {
    console.log('📤 Creating sale:', saleData);
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(saleData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create sale: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Sale created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating sale:', error);
    throw error;
  }
};

// ============ EXPENSES API ============
export const getExpenses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  } catch (error) {
    console.error('❌ Error fetching expenses:', error);
    throw error;
  }
};

export const getExpensesByDate = async (date: string) => {
  const response = await fetch(`${API_BASE_URL}/expenses/date/${date}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch expenses by date');
  return response.json();
};

export const getExpensesByCategory = async (category: string) => {
  const response = await fetch(`${API_BASE_URL}/expenses/category/${category}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch expenses by category');
  return response.json();
};

export const createExpense = async (expenseData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return response.json();
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete expense');
    return true;
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    throw error;
  }
};