// ClientLayout: Hydrates Redux auth state on the client after mount.
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHydrated, setTokensFromStorage } from "@/features/auth/authSlice";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Hydrate auth state from localStorage after mount
    dispatch(setTokensFromStorage());
    dispatch(setHydrated(true));
  }, [dispatch]);
  
  return <>{children}</>;
} 