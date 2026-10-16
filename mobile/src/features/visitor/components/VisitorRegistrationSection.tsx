import { useCallback } from "react";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useVisitorRegistrationStatus } from "@/features/visitor/hooks/useVisitorRegistrationStatus";
import { VisitorRegistrationCard } from "./VisitorRegistrationCard";

const REGISTER_ROUTE = "/(protected)/visitor/register" as Href;

export function VisitorRegistrationSection() {
    const router = useRouter();
    const { request, isLoading, error, reload } = useVisitorRegistrationStatus();

    useFocusEffect(
        useCallback(() => {
            void reload();
        }, [reload]),
    );

    return (
        <VisitorRegistrationCard
            request={request}
            isLoading={isLoading}
            error={error}
            onStartRegistration={() => router.push(REGISTER_ROUTE)}
        />
    );
}
