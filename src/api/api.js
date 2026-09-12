const API_BASE = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/** Fetch all menu items, optionally filtered by category. */
export function fetchMenu(category = null) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return request(`/menu${query}`);
}

/** Fetch a single menu item by ID. */
export function fetchMenuItem(id) {
  return request(`/menu/${id}`);
}

/** Create a new order. */
export function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

/** Fetch orders, optionally filtered by status. */
export function fetchOrders(status = null, limit = 50) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (limit) params.append('limit', limit.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/orders${query}`);
}

/** Fetch a single order by ID. */
export function fetchOrder(id) {
  return request(`/orders/${id}`);
}

/** Update an order's status. */
export function updateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** Fetch dashboard stats for today. */
export function fetchDashboardStats() {
  return request('/orders/stats/today');
}

/** Fetch hourly stats for today. */
export function fetchHourlyStats() {
  return request('/orders/stats/hourly');
}

/** Fetch all menu items including unavailable ones. */
export function fetchAllMenuItems() {
  return request('/menu?all=true');
}

/** Create a new menu item. */
export function createMenuItem(itemData) {
  return request('/menu', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

/** Update a menu item. */
export function updateMenuItem(id, itemData) {
  return request(`/menu/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
}

/** Delete a menu item. */
export function deleteMenuItem(id) {
  return request(`/menu/${id}`, {
    method: 'DELETE',
  });
}
