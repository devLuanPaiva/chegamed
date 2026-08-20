import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { CameraView } from "expo-camera";
import { AlertCircle } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useSpeechTips } from "@/data/hooks/useSpeechTips";
import { useAutoCameraPermission } from "@/features/medicines/hooks/useAutoCameraPermission";
import { useWelcomeTip } from "@/features/medicines/hooks/useWelcomeTip";
import { useBarcodeCapture } from "@/features/medicines/hooks/useBarcodeCapture";
import { useAiConsent } from "@/data/hooks/useAiConsent";
import { CameraPermissionGate } from "@/features/medicines/components/CameraPermissionGate";
import { ScanTopBar } from "@/features/medicines/components/ScanTopBar";
import { CameraGradients } from "@/features/medicines/components/CameraGradients";
import { CameraCaptureButton } from "@/components/shared/CameraCaptureButton";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import { AiConsentGate } from "@/components/shared/AiConsentGate";

const BARCODE_TIPS = [
    "Aproxime a câmera do código de barras para facilitar a leitura.",
    "Procure um ambiente bem iluminado antes de fotografar.",
    "Mantenha o código de barras próximo ao centro da tela.",
    "Evite reflexos na embalagem ao posicionar a câmera.",
];

export default function MedicineBarcodeScan() {
    const router = useRouter();
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useAutoCameraPermission();
    const { isSpeaking, speakNextTip, stop: stopSpeech } = useSpeechTips(BARCODE_TIPS, { random: true });
    const { cameraRef, capturing, lookup, handleCapture } = useBarcodeCapture();
    const { hasConsented, grantConsent } = useAiConsent("EXTRACTION");

    useWelcomeTip(permission?.granted, speakNextTip);

    useFocusEffect(
        useCallback(() => {
            return () => {
                stopSpeech();
            };
        }, [stopSpeech]),
    );

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <CameraPermissionGate
                subtitle="Para fotografar o código de barras, o ChegaMed precisa da sua permissão de câmera."
                onRequestPermission={requestPermission}
            />
        );
    }

    if (hasConsented === null) {
        return <View style={styles.container} />;
    }

    if (!hasConsented) {
        return (
            <AiConsentGate
                title="Uso de inteligência artificial"
                description="Para identificar o medicamento automaticamente, a foto do código de barras ou da caixa é enviada a um serviço de IA de terceiros."
                bullets={[
                    "O que é enviado: a foto do código de barras ou da caixa do medicamento.",
                    "Para quem: API do Google Gemini, contratada em plano pago que não usa os dados para treinar seus modelos.",
                    "Finalidade: identificar o código de barras ou o nome do medicamento automaticamente, reduzindo a digitação manual.",
                ]}
                onAccept={grantConsent}
                onDecline={() => router.back()}
            />
        );
    }

    const isProcessing = lookup.status === "scanning" || lookup.status === "searching";

    return (
        <View style={styles.container}>
            {isFocused ? <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" /> : null}

            <CameraGradients topHeight={90} bottomHeight={150} />

            <SafeAreaView style={styles.overlay}>
                <ScanTopBar isSpeaking={isSpeaking} onSpeakPress={speakNextTip} />

                <View style={styles.centerArea}>
                    <Text style={styles.hint}>Fotografe o código de barras da caixa do medicamento</Text>
                </View>

                <View style={styles.bottomArea}>
                    {lookup.status === "error" ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.white} />
                            <Text style={styles.errorText}>{lookup.message}</Text>
                        </View>
                    ) : null}

                    <View style={styles.controlsRow}>
                        <CameraCaptureButton
                            disabled={capturing || isProcessing}
                            capturing={capturing}
                            onPress={handleCapture}
                            accessibilityLabel="Fotografar código de barras"
                        />
                    </View>
                </View>
            </SafeAreaView>

            <ProcessingOverlay
                visible={isProcessing}
                uploadLabel={null}
                title="Identificando medicamento"
                defaultUploadLabel="Lendo código de barras..."
                secondaryLabel="Buscando medicamento cadastrado..."
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
    },

    overlay: {
        flex: 1,
        justifyContent: "space-between",
    },

    centerArea: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xxl,
    },

    hint: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
        textAlign: "center",
    },

    bottomArea: {
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginHorizontal: Spacing.xl,
        backgroundColor: "rgba(220,38,38,0.92)",
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },

    controlsRow: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },
});
