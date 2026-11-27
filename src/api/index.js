import { http } from "./client";

/** Every backend endpoint the app uses, in one place. */

export const authApi = {
  register: (name, email, password) =>
    http.post("/auth/register", { name, email, password }),
  login: (email, password) => http.post("/auth/login", { email, password }),
  me: () => http.get("/auth/me"),
  logout: () => http.post("/auth/logout", {}),
  changePassword: (currentPassword, password) =>
    http.post("/auth/change-password", { currentPassword, password }),
  forgotPassword: (email) => http.post("/auth/forgot-password", { email }),
  resetPassword: (email, token, password) =>
    http.post("/auth/reset-password", { email, token, password }),
};

export const preferencesApi = {
  get: () => http.get("/preferences"),
  save: ({ categories, frequency, channels }) =>
    http.put("/preferences", { categories, frequency, channels }),
  unsubscribe: () => http.post("/preferences/unsubscribe", {}),
};

export const notificationsApi = {
  list: ({ categories = [], sort = "newest", page = 1, limit = 10, since } = {}, signal) =>
    http.get("/notifications", {
      signal,
      params: {
        sort,
        page,
        limit,
        ...(categories.length ? { category: categories.join(",") } : {}),
        ...(since ? { since } : {}),
      },
    }),
  summary: (signal) => http.get("/notifications/summary", { signal }),
  clear: () => http.delete("/notifications"),
  sendTest: () => http.post("/notifications/test", {}),
};

export const newsApi = {
  feed: (categories, signal) =>
    http.get("/news", { signal, params: { category: categories.join(",") } }),
  headlines: (signal) => http.get("/news/headlines", { signal }),
};
