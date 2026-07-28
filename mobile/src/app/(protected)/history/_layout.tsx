import { Stack } from "expo-router";

import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/data/models/user.model";

export default function HistoryLayout() {
    return (
        <RoleGuard allow={[UserRole.PATIENT]}>
            <Stack screenOptions={{ headerShown: false, animation: "none" }}>
                <Stack.Screen name="index" />
            </Stack>
        </RoleGuard>
    );
}
