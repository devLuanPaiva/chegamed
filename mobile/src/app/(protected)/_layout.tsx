import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrescriptionScanProvider } from "@/data/contexts/PrescriptionScanContext";
import { Colors, Typography } from "@/theme";

const TAB_BAR_CONTENT_HEIGHT = 46;
const TAB_BAR_VERTICAL_PADDING = 18;

function renderHomeIcon({ color, size }: { color: string; size: number }) {
    return <Home color={color} size={size} />;
}

function renderProfileIcon({ color, size }: { color: string; size: number }) {
    return <User color={color} size={size} />;
}

export default function ProtectedLayout() {
    const insets = useSafeAreaInsets();

    return (
        <PrescriptionScanProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: Colors.surface,
                        borderTopColor: Colors.border,
                        height: TAB_BAR_CONTENT_HEIGHT + TAB_BAR_VERTICAL_PADDING + insets.bottom,
                        paddingTop: 8,
                        paddingBottom: 10 + insets.bottom,
                    },
                    tabBarLabelStyle: {
                        fontFamily: Typography.fonts.bodyMedium,
                        fontSize: Typography.sizes.xs,
                    },
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Início",
                        tabBarIcon: renderHomeIcon,
                        tabBarAccessibilityLabel: "Início",
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Perfil",
                        tabBarIcon: renderProfileIcon,
                        tabBarAccessibilityLabel: "Perfil",
                    }}
                />
                <Tabs.Screen name="prescriptions" options={{ href: null }} />
                <Tabs.Screen name="patients" options={{ href: null }} />
                <Tabs.Screen name="medicines" options={{ href: null }} />
                <Tabs.Screen name="deliveries" options={{ href: null }} />
                <Tabs.Screen name="assistant" options={{ href: null }} />
                <Tabs.Screen name="change-password" options={{ href: null }} />
            </Tabs>
        </PrescriptionScanProvider>
    );
}
