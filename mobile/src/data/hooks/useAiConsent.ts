import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { AI_CONSENT_STORAGE_KEYS, AiConsentFeature } from "@/lib/storageKeys";

interface UseAiConsentResult {
    hasConsented: boolean | null;
    grantConsent: () => Promise<void>;
}

export function useAiConsent(feature: AiConsentFeature): UseAiConsentResult {
    const [hasConsented, setHasConsented] = useState<boolean | null>(null);
    const storageKey = AI_CONSENT_STORAGE_KEYS[feature];

    useEffect(() => {
        let isMounted = true;

        AsyncStorage.getItem(storageKey).then((value) => {
            if (isMounted) {
                setHasConsented(value === "true");
            }
        });

        return () => {
            isMounted = false;
        };
    }, [storageKey]);

    const grantConsent = useCallback(async () => {
        await AsyncStorage.setItem(storageKey, "true");
        setHasConsented(true);
    }, [storageKey]);

    return { hasConsented, grantConsent };
}
