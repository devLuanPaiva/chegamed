import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

import { BirthDateField } from "@/features/patients/components/BirthDateField";
import { VisitorRegistrationFormValues } from "@/features/visitor/hooks/useVisitorRegistrationForm";
import { IVisitorCompany } from "@/data/models/visitor.model";
import { formatCpf } from "@/lib/cpf";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { CompanySelector } from "./CompanySelector";

interface VisitorRegistrationFormProps {
    values: VisitorRegistrationFormValues;
    onChangeField: <K extends keyof VisitorRegistrationFormValues>(
        field: K,
        value: VisitorRegistrationFormValues[K],
    ) => void;
    companies: IVisitorCompany[];
    isLoadingCompanies: boolean;
    companiesError: string | null;
    formError: string | null;
    formErrorField?: string;
    isSubmitting: boolean;
    onSubmit: () => void;
}

export function VisitorRegistrationForm({
    values,
    onChangeField,
    companies,
    isLoadingCompanies,
    companiesError,
    formError,
    formErrorField,
    isSubmitting,
    onSubmit,
}: Readonly<VisitorRegistrationFormProps>) {
    return (
        <View style={styles.container}>
            {formError ? (
                <View style={styles.errorBox}>
                    <AlertCircle size={16} color={Colors.danger} />
                    <Text style={styles.errorText}>{formError}</Text>
                </View>
            ) : null}

            <CompanySelector
                companies={companies}
                selectedCompanyId={values.companyId}
                isLoading={isLoadingCompanies}
                error={companiesError}
                hasError={formErrorField === "companyId"}
                onSelect={(companyId) => onChangeField("companyId", companyId)}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                    style={[styles.input, formErrorField === "name" && styles.inputError]}
                    value={values.name}
                    onChangeText={(text) => onChangeField("name", text)}
                    placeholder="Seu nome completo"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="words"
                    maxLength={120}
                    accessibilityLabel="Nome completo"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                    style={[styles.input, formErrorField === "cpf" && styles.inputError]}
                    value={values.cpf}
                    onChangeText={(text) => onChangeField("cpf", formatCpf(text))}
                    placeholder="000.000.000-00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={14}
                    accessibilityLabel="CPF"
                />
            </View>

            <BirthDateField
                value={values.birthDate}
                onChange={(text) => onChangeField("birthDate", text)}
                error={formErrorField === "birthDate" ? formError : null}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Telefone (opcional)</Text>
                <TextInput
                    style={[styles.input, formErrorField === "contact" && styles.inputError]}
                    value={values.contact}
                    onChangeText={(text) => onChangeField("contact", text)}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="phone-pad"
                    maxLength={20}
                    accessibilityLabel="Telefone"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Endereço (opcional)</Text>
                <TextInput
                    style={[styles.input, formErrorField === "address" && styles.inputError]}
                    value={values.address}
                    onChangeText={(text) => onChangeField("address", text)}
                    placeholder="Rua, número, bairro, cidade"
                    placeholderTextColor={Colors.textSecondary}
                    maxLength={255}
                    accessibilityLabel="Endereço"
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={onSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Enviar cadastro"
            >
                {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.submitButtonText}>Enviar cadastro</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
                Seus dados são enviados para a farmácia escolhida e o acesso de paciente é liberado depois
                que a equipe aprovar o cadastro. Você continua entrando com a mesma conta Google ou Apple.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.lg,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    inputError: {
        borderColor: Colors.danger,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: `${Colors.danger}1A`,
        borderWidth: 1,
        borderColor: `${Colors.danger}40`,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.md,
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },

    disclaimer: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
});
