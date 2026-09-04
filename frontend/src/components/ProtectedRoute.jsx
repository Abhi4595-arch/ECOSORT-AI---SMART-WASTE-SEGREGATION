import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PageLoading from "./PageLoading";

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  /*
   * Wait for AuthContext to restore the stored session.
   * This prevents authenticated users from being
   * incorrectly redirected during application startup.
   */
  if (loading) {
    return (
      <PageLoading
        label="Restoring your Eco-Sort session…"
      />
    );
  }

  /*
   * Preserve the complete requested location so the
   * user can return to the exact page after login.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  /*
   * Authenticated users can access the protected page.
   */
  return children;
}