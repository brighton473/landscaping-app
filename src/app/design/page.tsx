"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import DesignStep from "@/components/steps/DesignStep";
import type { DesignSession } from "@/lib/types";

function DesignPageContent() {
  const params = useSearchParams();
  const rawSession = params.get("session");

  const [session, setSession] = useState<DesignSession>(() => {
    if (!rawSession) return {} as DesignSession;
    return JSON.parse(decodeURIComponent(rawSession));
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <DesignStep session={session} onUpdate={setSession} />
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-gray-400">Loading...</div>}>
      <DesignPageContent />
    </Suspense>
  );
}
