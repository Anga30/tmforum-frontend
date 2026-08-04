"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin-auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";
import type { AdminSession } from "@/types/admin-auth.types";

export const useAdminSessionGuard = (): { session?: AdminSession; accessToken?: string; isLoading: boolean } => {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession>();
  const [accessToken, setAccessToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/admin/login?reason=session");
      return;
    }

    void getCurrentAdmin(token)
      .then((activeSession) => {
        setSession(activeSession);
        setAccessToken(token);
      })
      .catch(() => {
        clearAccessToken();
        router.replace("/admin/login?reason=session");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  return { session, accessToken, isLoading };
};
