import { Stack } from "expo-router";

import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/data/models/user.model";

export default function VisitorLayout() {
    return (
        <RoleGuard allow={[UserRole.VISITOR]}>
            <Stack screenOptions={{ headerShown: false, animation: "none" }}>
                <Stack.Screen name="register" />
            </Stack>
        </RoleGuard>
    );
}
