// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Store token in memory (not localStorage for security)
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

// Get current auth token (for checking)
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

// ============ EXPENSES API (to be added) ============
// These will be implemented when we add Expense API in backend

// ============ STOCK MOVEMENTS API (to be added) ============
// These will be implemented when we add Stock API in backend