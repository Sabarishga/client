import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { authApi } from "../api";
import { onUnauthorized, tokenStore } from "../api/client";

/**
 * Holds the logged-in user (including their saved alert preferences) for the
 * whole app. Pages read it with useAuth() instead of passing props around.
 *
 * status: "loading" while the saved token is checked on startup,
 *         "authenticated" or "guest" after that.
 */

const AuthContext = createContext(null);

const initialState = {
  status: tokenStore.get() ? "loading" : "guest",
  user: null,
  sessionMessage: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "signedIn":
      return { status: "authenticated", user: action.user, sessionMessage: "" };
    case "signedOut":
      return { status: "guest", user: null, sessionMessage: action.message || "" };
    case "preferencesUpdated":
      return state.user
        ? { ...state, user: { ...state.user, preferences: action.preferences } }
        : state;
    case "clearSessionMessage":
      return state.sessionMessage ? { ...state, sessionMessage: "" } : state;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startSession = useCallback(({ token, user }) => {
    tokenStore.set(token);
    dispatch({ type: "signedIn", user });
    return user;
  }, []);

  const endSession = useCallback((message) => {
    tokenStore.clear();
    dispatch({ type: "signedOut", message });
  }, []);

  // On startup, turn a saved token back into a user (or drop it if expired).
  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    let active = true;
    authApi
      .me()
      .then(({ user }) => active && dispatch({ type: "signedIn", user }))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) endSession("Your session has expired. Please log in again.");
        else endSession(err.message);
      });
    return () => {
      active = false;
    };
  }, [endSession]);

  // Any API call that comes back 401 signs the user out.
  useEffect(() => {
    onUnauthorized((err) => endSession(err.message));
    return () => onUnauthorized(null);
  }, [endSession]);

  const login = useCallback(
    async (email, password) => startSession(await authApi.login(email, password)),
    [startSession],
  );

  const register = useCallback(
    async (name, email, password) =>
      startSession(await authApi.register(name, email, password)),
    [startSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* the token is discarded either way */
    }
    endSession();
  }, [endSession]);

  const setPreferences = useCallback(
    (preferences) => dispatch({ type: "preferencesUpdated", preferences }),
    [],
  );
  const clearSessionMessage = useCallback(
    () => dispatch({ type: "clearSessionMessage" }),
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      login,
      register,
      logout,
      startSession,
      setPreferences,
      clearSessionMessage,
    }),
    [state, login, register, logout, startSession, setPreferences, clearSessionMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
