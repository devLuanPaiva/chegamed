import { StatusBar } from "expo-status-bar";
import { useRouter, type Href } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/data/contexts/AuthContext";
import { UserRole } from "@/data/models/user.model";
import { AssistantFeatureCard } from "@/features/home/components/AssistantFeatureCard";
import { HeroCard } from "@/features/home/components/HeroCard";
import { ModulesSection } from "@/features/home/components/ModulesSection";
import { NotificationButton } from "@/features/home/components/NotificationButton";
import { Colors, Spacing } from "@/theme";

const ASSISTANT_ROLES: UserRole[] = [UserRole.MANAGER, UserRole.ASSISTANT];

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();

    const canUseAssistant = Boolean(user?.role && ASSISTANT_ROLES.includes(user.role));
    const isPatient = user?.role === UserRole.PATIENT;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {isPatient ? (
                    <View style={styles.header}>
                        <NotificationButton />
                    </View>
                ) : null}

                <HeroCard name={user?.name ?? "Usuário"} imageUrl={user?.imageUrl} />

                {canUseAssistant ? (
                    <AssistantFeatureCard
                        onPress={() => router.push("/(protected)/assistant" as Href)}
                    />
                ) : null}

                <ModulesSection />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },

    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: Spacing.md,
    },
});
