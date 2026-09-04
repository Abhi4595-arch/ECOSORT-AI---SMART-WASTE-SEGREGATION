import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiJson } from "../utils/api";

const TOKEN_KEY = "eco_sort_access_token";
const USER_KEY = "eco_sort_user";

const AuthContext = createContext(null);

/* =========================================================
   STORAGE HELPERS
========================================================= */

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);

    if (
      !parsedUser ||
      typeof parsedUser !== "object"
    ) {
      localStorage.removeItem(USER_KEY);
      return null;
    }

    return parsedUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function saveSession(accessToken, nextUser) {
  try {
    if (accessToken) {
      localStorage.setItem(
        TOKEN_KEY,
        accessToken
      );
    }

    if (nextUser) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(nextUser)
      );
    }
  } catch (error) {
    console.error(
      "Unable to save Eco-Sort session:",
      error
    );
  }
}

function saveUser(nextUser) {
  if (!nextUser) {
    return;
  }

  try {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(nextUser)
    );
  } catch (error) {
    console.error(
      "Unable to save Eco-Sort user:",
      error
    );
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error(
      "Unable to clear Eco-Sort session:",
      error
    );
  }
}

/* =========================================================
   AUTH PROVIDER
========================================================= */

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    getStoredToken()
  );

  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  const [loading, setLoading] = useState(true);

  /*
   * Used to prevent an older /auth/me request from
   * overwriting a newer login/register session.
   */
  const sessionRequestId = useRef(0);

  /* =======================================================
     CLEAR SESSION
  ======================================================= */

  const clearSession = useCallback(() => {
    sessionRequestId.current += 1;

    clearStoredSession();

    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  /* =======================================================
     REFRESH CURRENT USER
  ======================================================= */

  const refreshUser = useCallback(async () => {
    const activeToken = getStoredToken();

    if (!activeToken) {
      setUser(null);
      setToken(null);
      return null;
    }

    const requestId =
      ++sessionRequestId.current;

    try {
      const data = await apiJson("/auth/me");

      /*
       * Ignore the response if another session action
       * happened while this request was running.
       */
      if (
        requestId !==
        sessionRequestId.current
      ) {
        return null;
      }

      const nextUser =
        data?.user || data;

      if (
        !nextUser ||
        typeof nextUser !== "object"
      ) {
        throw new Error(
          "Unable to restore your account."
        );
      }

      setToken(activeToken);
      setUser(nextUser);
      saveUser(nextUser);

      return nextUser;
    } catch (error) {
      /*
       * Do not clear a newer session because of an
       * older request failure.
       */
      if (
        requestId !==
        sessionRequestId.current
      ) {
        return null;
      }

      clearSession();

      throw error;
    }
  }, [clearSession]);

  /* =======================================================
     AUTH EXPIRED EVENT
  ======================================================= */

  useEffect(() => {
    const handleAuthExpired = () => {
      clearSession();
    };

    window.addEventListener(
      "eco-sort-auth-expired",
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        "eco-sort-auth-expired",
        handleAuthExpired
      );
    };
  }, [clearSession]);

  /* =======================================================
     RESTORE SESSION ON APP START
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }

        return;
      }

      /*
       * Make sure React state reflects the stored token
       * before restoring the user.
       */
      setToken(storedToken);
      setLoading(true);

      try {
        const data = await apiJson("/auth/me");

        if (cancelled) {
          return;
        }

        const nextUser =
          data?.user || data;

        if (
          !nextUser ||
          typeof nextUser !== "object"
        ) {
          throw new Error(
            "Unable to restore your account."
          );
        }

        setUser(nextUser);
        saveUser(nextUser);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Session restore failed:",
          error
        );

        clearSession();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = useCallback(
    async (email, password) => {
      const cleanEmail =
        String(email || "").trim();

      if (!cleanEmail) {
        throw new Error(
          "Please enter your email address."
        );
      }

      if (!password) {
        throw new Error(
          "Please enter your password."
        );
      }

      /*
       * Invalidate any older session-restore request.
       */
      sessionRequestId.current += 1;

      const data = await apiJson(
        "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      if (
        !data?.access_token ||
        !data?.user
      ) {
        throw new Error(
          "Login succeeded, but the server returned an incomplete session."
        );
      }

      saveSession(
        data.access_token,
        data.user
      );

      setToken(data.access_token);
      setUser(data.user);
      setLoading(false);

      return data.user;
    },
    []
  );

  /* =======================================================
     REGISTER
  ======================================================= */

  const register = useCallback(
    async (name, email, password) => {
      const cleanName =
        String(name || "").trim();

      const cleanEmail =
        String(email || "").trim();

      if (!cleanName) {
        throw new Error(
          "Please enter your name."
        );
      }

      if (!cleanEmail) {
        throw new Error(
          "Please enter your email address."
        );
      }

      if (!password) {
        throw new Error(
          "Please enter a password."
        );
      }

      /*
       * Invalidate any older session-restore request.
       */
      sessionRequestId.current += 1;

      const data = await apiJson(
        "/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      if (
        !data?.access_token ||
        !data?.user
      ) {
        throw new Error(
          "Registration succeeded, but the server returned an incomplete session."
        );
      }

      saveSession(
        data.access_token,
        data.user
      );

      setToken(data.access_token);
      setUser(data.user);
      setLoading(false);

      return data.user;
    },
    []
  );

  /* =======================================================
     UPDATE USER LOCALLY
  ======================================================= */

  const updateUser = useCallback(
    (nextUser) => {
      if (
        !nextUser ||
        typeof nextUser !== "object"
      ) {
        return;
      }

      setUser(nextUser);
      saveUser(nextUser);
    },
    []
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /* =======================================================
     AUTH CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      token,
      user,
      loading,

      isAuthenticated: Boolean(
        token && user
      ),

      login,
      register,
      updateUser,
      refreshUser,
      logout,
    }),
    [
      token,
      user,
      loading,
      login,
      register,
      updateUser,
      refreshUser,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   AUTH HOOK
========================================================= */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export { TOKEN_KEY };