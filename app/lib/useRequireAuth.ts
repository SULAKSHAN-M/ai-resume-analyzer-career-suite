import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "./useAuthStore";

/**
 * Sends signed-out visitors to /auth, then back to `next` after they sign in.
 * `ready` is true once the session check is done and the user is signed in.
 */
export function useRequireAuth(next: string) {
  const navigate = useNavigate();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.user !== null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`/auth?next=${encodeURIComponent(next)}`, { replace: true });
    }
  }, [isLoading, isAuthenticated, next, navigate]);

  return { ready: !isLoading && isAuthenticated };
}
