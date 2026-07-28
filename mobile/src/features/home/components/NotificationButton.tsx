import { StyleSheet, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";

import { Colors, Radius } from "@/theme";

export function NotificationButton() {
    return (
        <TouchableOpacity
            style={styles.button}
            hitSlop={10}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Notificações"
        >
            <Bell size={20} color={Colors.text} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
