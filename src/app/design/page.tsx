"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AnnotateStep from "@/components/steps/AnnotateStep";
import DesignStep from "@/components/steps/DesignStep";
import type { DesignSession } from "@/lib/types";

type Phase = "annotate" | "design";

export default function DesignPage() {
  const router = useRouter();

  const [session, setSession] = useState<DesignSession>(() => {
    const raw = sessionStorage.getItem("landscaping_session");
    if (!raw) return {} as DesignSession;
    const parsed = JSON.parse(raw);
    return { annotations: [], ...parsed };
  });
  const [phase, setPhase] = useState<Phase>("annotate");

  if (!session.photos?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500">No session found. Please start from the beginning.</p>
        <button onClick={() => router.push("/")} className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {phase === "annotate" && (
        <AnnotateStep
          photo={session.photos[0]}
          annotations={session.annotations}
          onChange={(annotations) => setSession(s => ({ ...s, annotations }))}
          onNext={() => setPhase("design")}
          onBack={() => router.push("/")}
        />
      )}
      {phase === "design" && (
        <DesignStep session={session} onUpdate={setSession} />
      )}
    </div>
  );
}
