import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PageLoading from "./PageLoading";

export default function ProtectedRoute({
  children,
}) {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();

  /*
   * Wait until AuthContext has finished checking the
   * stored JWT/session. This prevents a logged-in user
   * from being redirected to Login during app startup.
   */
  if (loading) {
    return (
      <PageLoading
        label="Restoring your Eco-Sort session…"
      />
    );
  }

  /*
   * Preserve the complete location so Login can return
   * the user to the page they originally requested.
   */
  if (!isAuthenticated) {
    const returnLocation = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: returnLocation,
        }}
      />
    );
  }

  /*
   * Authenticated users can access the protected page.
   */
  return children;
}