import axios from "axios";

const TOKEN_KEY = "rtn_token";

export const tokenStore = {
  get() {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {

    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("newsAlertEmail");
    } catch {

    }
  },
};

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

const configuredUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const BASE_URL = configuredUrl || (import.meta.env.DEV ? "/api" : "");

export const http = axios.create({
  baseURL: BASE_URL,
  // Render's free plan can take ~50 seconds to wake up.
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

let unauthorizedHandler = null;
export const onUnauthorized = (handler) => {
  unauthorizedHandler = handler;
};

http.interceptors.request.use((config) => {
  if (!BASE_URL) {
    throw new ApiError(
      "The app is not connected to a server. Set VITE_API_URL to the backend URL (including /api) and rebuild.",
    );
  }
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toApiError = (error) => {
  if (error instanceof ApiError) return error;
  if (axios.isCancel(error)) return error;

  if (error.code === "ECONNABORTED") {
    return new ApiError(
      "The server is taking too long to respond. It may be starting up, so please try again in a moment.",
    );
  }

  const { response } = error;
  if (!response) {
    return new ApiError(
      "Could not reach the server. Check your internet connection and try again.",
    );
  }

  const { status, data } = response;
  if (!data || typeof data !== "object") {
    return new ApiError(
      `The server sent an unexpected response (HTTP ${status}). Please try again later.`,
      { status },
    );
  }

  const fallback =
    status >= 500
      ? "Something went wrong on the server. Please try again."
      : `Request failed (HTTP ${status}).`;
  return new ApiError(data.message || fallback, {
    status,
    errors: data.errors || null,
    data,
  });
};

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = toApiError(error);
    const sentToken = Boolean(error.config?.headers?.Authorization);
    if (apiError.status === 401 && sentToken && unauthorizedHandler) {
      unauthorizedHandler(apiError);
    }
    return Promise.reject(apiError);
  },
);

export const isAbort = (error) => axios.isCancel(error);
