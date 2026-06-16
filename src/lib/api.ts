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
  const response = await fetch(`${API_BASE_URL}/items`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
};

export const getItemByCode = async (code: string) => {
  const response = await fetch(`${API_BASE_URL}/items/${code}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Item not found');
  return response.json();
};

export const createItem = async (item: any) => {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to create item');
  return response.json();
};

export const updateItem = async (code: string, item: any) => {
  const response = await fetch(`${API_BASE_URL}/items/${code}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to update item');
  return response.json();
};

export const deleteItem = async (code: string) => {
  const response = await fetch(`${API_BASE_URL}/items/${code}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete item');
  return true;
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
  const response = await fetch(`${API_BASE_URL}/sales`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(saleData),
  });
  if (!response.ok) throw new Error('Failed to create sale');
  return response.json();
};

// ============ EXPENSES API (FIXED) ============
export const getExpenses = async () => {
  try {
    console.log('📡 Fetching expenses from:', `${API_BASE_URL}/expenses`);
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      headers: getHeaders(),
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📡 Raw expenses data:', data);
    return data;
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
    console.log('📤 Creating expense:', expenseData);
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });
    
    console.log('📤 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create expense: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📤 Created expense response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    console.log('🗑️ Deleting expense:', id);
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    console.log('🗑️ Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete expense: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    throw error;
  }
};