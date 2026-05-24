"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHubRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/transfers"); }, [router]);
  return null;
}
