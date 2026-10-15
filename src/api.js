const BASE_URL = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const subscribe = (email, categories, frequency) =>
  request("/subscribe", {
    method: "POST",
    body: JSON.stringify({ email, categories, frequency }),
  });

export const register = (name, email, password) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const requestPasswordReset = (email) =>
  request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (email, token, password) =>
  request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, token, password }),
  });

export const changePassword = (email, currentPassword, password) =>
  request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ email, currentPassword, password }),
  });

export const unsubscribe = (email) =>
  request("/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const getPreferences = (email) =>
  request(`/preferences/${encodeURIComponent(email)}`);

export const updatePreferences = (email, categories, frequency) =>
  request(`/preferences/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: JSON.stringify({ categories, frequency }),
  });

export const getNotifications = (email) =>
  request(`/notifications/${encodeURIComponent(email)}`);

export const getNews = (category) =>
  request(`/news?category=${encodeURIComponent(category)}`);

export const clearNotifications = (email) =>
  request(`/notifications/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
