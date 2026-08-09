"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, PillBottle } from "lucide-react";

import { APP_STORE_URL, DEEP_LINK_SCHEME, PLAY_STORE_URL } from "@/lib/site-config";

const FALLBACK_DELAY_MS = 1500;

function isApplePlatform(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function LinkRedirect() {
  const searchParams = useSearchParams();
  const to = searchParams.get("to") ?? "";

  const [fallbackStoreUrl, setFallbackStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    const currentStoreUrl = isApplePlatform() ? APP_STORE_URL : PLAY_STORE_URL;
    let hasFallenBack = false;

    function fallbackToStore() {
      if (hasFallenBack || document.visibilityState === "hidden") {
        return;
      }

      hasFallenBack = true;
      setFallbackStoreUrl(currentStoreUrl);
      window.location.href = currentStoreUrl;
    }

    const timer = window.setTimeout(fallbackToStore, FALLBACK_DELAY_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hasFallenBack = true;
        window.clearTimeout(timer);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.location.href = `${DEEP_LINK_SCHEME}://${to}`;

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [to]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-10 shadow-2xl shadow-primary-900/20">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          <PillBottle size={28} />
        </span>

        <h1 className="font-heading text-2xl tracking-wide text-neutral-900">Abrindo o ChegaMed</h1>

        <p className="text-sm font-semibold text-neutral-600">
          Estamos tentando abrir o aplicativo. Se nada acontecer em alguns segundos, você será
          redirecionado para a loja.
        </p>

        <Loader2 size={22} className="animate-spin text-primary-500" aria-hidden="true" />

        {fallbackStoreUrl && (
          <a
            href={fallbackStoreUrl}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-600"
          >
            Baixar o aplicativo
          </a>
        )}
      </div>
    </main>
  );
}

export default function LinkPage() {
  return (
    <Suspense fallback={null}>
      <LinkRedirect />
    </Suspense>
  );
}
