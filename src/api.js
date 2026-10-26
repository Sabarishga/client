const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const BASE_URL = configuredBaseUrl || (import.meta.env.DEV ? "/api" : "");

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error(
      "API URL is not configured. Set VITE_API_URL to your deployed backend URL (including /api) in the hosting environment.",
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error(
      `API returned a non-JSON response (HTTP ${res.status}). Check that the backend is running and the API URL is correct.`,
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`API returned invalid JSON (HTTP ${res.status}).`);
    }
    throw err;
  }

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

export const logout = (email) =>
  request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ email }),
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

export const getDashboardNotifications = (
  email,
  { categories = [], sort = "newest", page = 1, limit = 10 } = {},
) => {
  const params = new URLSearchParams({
    email,
    sort,
    page: String(page),
    limit: String(limit),
  });
  if (categories.length > 0) params.set("category", categories.join(","));
  return request(`/dashboard/notifications?${params.toString()}`);
};

export const getDashboardSummary = (email) =>
  request(`/dashboard/summary?email=${encodeURIComponent(email)}`);
