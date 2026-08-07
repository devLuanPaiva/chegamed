import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

export interface SegmentedTabOption<TValue extends string> {
    value: TValue;
    label: string;
}

interface SegmentedTabsProps<TValue extends string> {
    options: SegmentedTabOption<TValue>[];
    value: TValue;
    onChange: (value: TValue) => void;
}

export function SegmentedTabs<TValue extends string>({
    options,
    value,
    onChange,
}: Readonly<SegmentedTabsProps<TValue>>) {
    return (
        <View style={styles.container}>
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[styles.tab, selected && styles.tabSelected]}
                        onPress={() => onChange(option.value)}
                        activeOpacity={0.85}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        accessibilityLabel={option.label}
                    >
                        <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{option.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: Spacing.xs,
        backgroundColor: Colors.background,
        borderRadius: Radius.full,
        padding: 4,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
    },

    tabSelected: {
        backgroundColor: Colors.primary,
    },

    tabText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },

    tabTextSelected: {
        fontFamily: Typography.fonts.bodySemiBold,
        color: Colors.white,
    },
});
