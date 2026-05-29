"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressStep from "@/components/steps/AddressStep";
import type { DesignSession } from "@/lib/types";

const STEPS = ["Property"];

const defaultSession: DesignSession = {
  address: "",
  coordinates: null,
  photos: [],
  annotations: [],
  description: "",
  variations: [],
  selectedVariation: null,
};

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<DesignSession>(defaultSession);

  function update(patch: Partial<DesignSession>) {
    setSession((s) => ({ ...s, ...patch }));
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      sessionStorage.setItem("landscaping_session", JSON.stringify(session));
      router.push("/design");
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-center mb-10 gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${i <= step ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${i <= step ? "text-primary-600 font-medium" : "text-gray-400"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {step === 0 && (
          <AddressStep
            address={session.address}
            coordinates={session.coordinates}
            onChange={(address, coordinates) => update({ address, coordinates })}
            onPhotoChange={(photo) => update({ photos: photo ? [photo] : [] })}
          />
        )}

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button onClick={back} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              Back
            </button>
          ) : <div />}
          <button
            onClick={next}
            disabled={
              (step === 0 && (!session.address || session.photos.length === 0))
            }
            className="px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === STEPS.length - 1 ? "Start Designing" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
