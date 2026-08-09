import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";

import { Colors, Spacing, Typography } from "@/theme";
import { useCompanies } from "@/data/contexts/CompanyContext";
import { useDebouncedValue } from "@/data/hooks/useDebouncedValue";
import { IPatientRegistrationRequest, PatientFilterParams } from "@/data/models/patient.model";
import { getErrorMessage } from "@/lib/errorMessage";
import { usePatientList } from "@/features/patients/hooks/usePatientList";
import { usePatientForm } from "@/features/patients/hooks/usePatientForm";
import { usePendingPatientRequests } from "@/features/patients/hooks/usePendingPatientRequests";
import { PatientTab, PatientTabSwitcher } from "@/features/patients/components/PatientTabSwitcher";
import { PatientFilterBar } from "@/features/patients/components/PatientFilterBar";
import { PatientCard } from "@/features/patients/components/PatientCard";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { PendingPatientRequestCard } from "@/features/patients/components/PendingPatientRequestCard";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackButton } from "@/components/shared/BackButton";

interface ConfirmTarget {
    request: IPatientRegistrationRequest;
    kind: "approve" | "reject";
}

const FILTER_DEBOUNCE_MS = 400;

export default function PatientsScreen() {
    const router = useRouter();
    const { selectedCompany } = useCompanies();

    const [activeTab, setActiveTab] = useState<PatientTab>("list");
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");

    const debouncedName = useDebouncedValue(name, FILTER_DEBOUNCE_MS);
    const debouncedCpf = useDebouncedValue(cpf, FILTER_DEBOUNCE_MS);

    const filter = useMemo<PatientFilterParams>(
        () => ({ name: debouncedName, cpf: debouncedCpf }),
        [debouncedName, debouncedCpf],
    );

    const patients = usePatientList(selectedCompany?.id, filter);
    const pendingRequests = usePendingPatientRequests();
    const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);

    const { values, setField, isSubmitting, formError, formErrorField, submit } = usePatientForm({
        companyId: selectedCompany?.id,
        onSuccess: () => {
            patients.refresh();
            setActiveTab("list");
            Alert.alert("Sucesso", "Paciente cadastrado com sucesso.");
        },
    });

    async function handleConfirmAction() {
        if (!confirmTarget) {
            return;
        }

        const { request, kind } = confirmTarget;

        try {
            if (kind === "approve") {
                await pendingRequests.approve(request.id);
                Alert.alert("Cadastro aprovado", `${request.name} foi aprovado e receberá um e-mail de confirmação.`);
            } else {
                await pendingRequests.reject(request.id);
                Alert.alert("Cadastro recusado", `A solicitação de ${request.name} foi recusada.`);
            }

            setConfirmTarget(null);
        } catch (error) {
            Alert.alert("Erro", getErrorMessage(error, "Não foi possível concluir a operação."));
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Pacientes</Text>
            </View>

            <View style={styles.controls}>
                <PatientTabSwitcher value={activeTab} onChange={setActiveTab} />

                {activeTab === "list" ? (
                    <PatientFilterBar name={name} cpf={cpf} onChangeName={setName} onChangeCpf={setCpf} />
                ) : null}
            </View>

            {activeTab === "list" ? (
                <PaginatedList
                    data={patients.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PatientCard
                            patient={item}
                            onPress={() => router.push(`/(protected)/patients/${item.id}` as Href)}
                        />
                    )}
                    isLoading={patients.isLoading}
                    isLoadingMore={patients.isLoadingMore}
                    error={patients.error}
                    emptyMessage="Nenhum paciente encontrado."
                    onLoadMore={patients.loadMore}
                    onRefresh={patients.refresh}
                />
            ) : activeTab === "pending" ? (
                <PaginatedList
                    data={pendingRequests.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PendingPatientRequestCard
                            request={item}
                            isBusy={pendingRequests.reviewingId === item.id}
                            onApprove={() => setConfirmTarget({ request: item, kind: "approve" })}
                            onReject={() => setConfirmTarget({ request: item, kind: "reject" })}
                        />
                    )}
                    isLoading={pendingRequests.isLoading}
                    isLoadingMore={pendingRequests.isLoadingMore}
                    error={pendingRequests.error}
                    emptyMessage="Nenhuma solicitação de cadastro pendente."
                    onLoadMore={pendingRequests.loadMore}
                    onRefresh={pendingRequests.refresh}
                />
            ) : (
                <KeyboardAvoidingView
                    style={styles.formContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={styles.formContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                    >
                        <PatientForm
                            values={values}
                            onChangeField={setField}
                            formError={formError}
                            formErrorField={formErrorField}
                            isSubmitting={isSubmitting}
                            submitLabel="Cadastrar paciente"
                            onSubmit={submit}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            <ConfirmDialog
                visible={Boolean(confirmTarget)}
                title={confirmTarget?.kind === "approve" ? "Aprovar cadastro" : "Recusar cadastro"}
                message={
                    confirmTarget
                        ? confirmTarget.kind === "approve"
                            ? `${confirmTarget.request.name} terá uma conta de acesso criada ou vinculada e receberá um e-mail de confirmação.`
                            : `A solicitação de ${confirmTarget.request.name} será recusada. Esta ação não pode ser desfeita.`
                        : ""
                }
                confirmLabel={confirmTarget?.kind === "approve" ? "Aprovar" : "Recusar"}
                cancelLabel="Voltar"
                destructive={confirmTarget?.kind === "reject"}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmTarget(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    controls: {
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },

    formContainer: {
        flex: 1,
    },

    formContent: {
        flexGrow: 1,
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
});
