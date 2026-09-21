import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { BackButton } from "@/components/shared/BackButton";
import { useAuth } from "@/data/contexts/AuthContext";
import { VisitorRegistrationForm } from "@/features/visitor/components/VisitorRegistrationForm";
import { useVisitorCompanies } from "@/features/visitor/hooks/useVisitorCompanies";
import { useVisitorRegistrationForm } from "@/features/visitor/hooks/useVisitorRegistrationForm";
import { Colors, Spacing, Typography } from "@/theme";

export default function VisitorRegister() {
    const router = useRouter();
    const { user } = useAuth();
    const { companies, isLoading: isLoadingCompanies, error: companiesError } = useVisitorCompanies();

    const { values, setField, isSubmitting, formError, formErrorField, submit } = useVisitorRegistrationForm({
        initialName: user?.name,
        onSuccess: () => {
            Alert.alert(
                "Cadastro enviado",
                "A farmácia vai analisar seus dados e liberar seu acesso de paciente em breve.",
                [{ text: "OK", onPress: () => router.replace("/(protected)/home") }],
            );
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}>
                    <BackButton />
                    <Text style={styles.title}>Cadastro de paciente</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.intro}>
                        Escolha a farmácia que acompanha seu tratamento e confirme seus dados para solicitar
                        seu cadastro como paciente.
                    </Text>

                    <VisitorRegistrationForm
                        values={values}
                        onChangeField={setField}
                        companies={companies}
                        isLoadingCompanies={isLoadingCompanies}
                        companiesError={companiesError}
                        formError={formError}
                        formErrorField={formErrorField}
                        isSubmitting={isSubmitting}
                        onSubmit={submit}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    flex: {
        flex: 1,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    content: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxl,
        gap: Spacing.lg,
    },

    intro: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});
