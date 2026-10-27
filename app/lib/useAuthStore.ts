import { create } from "zustand";
import { api } from "./api";
import { errorMessage } from "./utils";

interface User {
  id: string;
  email: string;
}

interface AuthStore {
  /** True until the first "am I signed in?" check finishes. Route guards wait for this. */
  isLoading: boolean;
  user: User | null;
  error: string | null;

  init: () => void;
  register: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

let initStarted = false;

export const useAuthStore = create<AuthStore>((set) => ({
  isLoading: true,
  user: null,
  error: null,

  init: () => {
    if (initStarted) return;
    initStarted = true;
    api
      .get<{ user: User | null }>("/api/auth/me")
      .then(({ user }) => set({ user }))
      .catch(() => set({ error: "Couldn't reach the server. Check your connection." }))
      .finally(() => set({ isLoading: false }));
  },

  register: async (email, password) => {
    set({ error: null });
    try {
      const { user } = await api.post<{ user: User }>("/api/auth/register", { email, password });
      set({ user });
      return true;
    } catch (err) {
      set({ error: errorMessage(err, "Couldn't create your account. Try again.") });
      return false;
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { user } = await api.post<{ user: User }>("/api/auth/login", { email, password });
      set({ user });
      return true;
    } catch (err) {
      set({ error: errorMessage(err, "Couldn't sign you in. Try again.") });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // The cookie may already be gone server-side; clear local state regardless.
    }
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
