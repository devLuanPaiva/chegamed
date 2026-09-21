import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Building2, Check } from "lucide-react-native";
import { Image } from "expo-image";

import { IVisitorCompany } from "@/data/models/visitor.model";
import { Colors, Radius, Spacing, Typography } from "@/theme";

interface CompanySelectorProps {
    companies: IVisitorCompany[];
    selectedCompanyId: string;
    isLoading: boolean;
    error: string | null;
    hasError?: boolean;
    onSelect: (companyId: string) => void;
}

interface CompanyOptionProps {
    company: IVisitorCompany;
    isSelected: boolean;
    onSelect: (companyId: string) => void;
}

function CompanyOption({ company, isSelected, onSelect }: Readonly<CompanyOptionProps>) {
    return (
        <TouchableOpacity
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(company.id)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={company.name}
        >
            <View style={styles.logoWrapper}>
                {company.imageUrl ? (
                    <Image source={{ uri: company.imageUrl }} style={styles.logo} contentFit="contain" />
                ) : (
                    <Building2 size={20} color={Colors.textSecondary} />
                )}
            </View>

            <Text style={styles.optionName} numberOfLines={2}>
                {company.name}
            </Text>

            {isSelected ? <Check size={18} color={Colors.primary} /> : null}
        </TouchableOpacity>
    );
}

export function CompanySelector({
    companies,
    selectedCompanyId,
    isLoading,
    error,
    hasError,
    onSelect,
}: Readonly<CompanySelectorProps>) {
    function renderContent() {
        if (isLoading) {
            return <ActivityIndicator color={Colors.primary} style={styles.loader} />;
        }

        if (error) {
            return <Text style={styles.helperError}>{error}</Text>;
        }

        if (companies.length === 0) {
            return <Text style={styles.helper}>Nenhuma farmácia disponível para cadastro no momento.</Text>;
        }

        return companies.map((company) => (
            <CompanyOption
                key={company.id}
                company={company}
                isSelected={company.id === selectedCompanyId}
                onSelect={onSelect}
            />
        ));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Farmácia</Text>

            <View style={[styles.list, hasError && styles.listError]}>{renderContent()}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    list: {
        gap: Spacing.sm,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: "transparent",
    },

    listError: {
        borderColor: Colors.danger,
        padding: Spacing.sm,
    },

    loader: {
        paddingVertical: Spacing.lg,
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    optionSelected: {
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}0D`,
    },

    logoWrapper: {
        width: 40,
        height: 40,
        borderRadius: Radius.md,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    logo: {
        width: 32,
        height: 32,
    },

    optionName: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    helper: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        paddingVertical: Spacing.md,
    },

    helperError: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
        paddingVertical: Spacing.md,
    },
});
