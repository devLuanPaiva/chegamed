import { PatientRegistrationRequestStatus } from "@/data/models/patient.model";
import { IVisitorRegistrationRequest } from "@/data/models/visitor.model";

export interface RegistrationStatusContent {
    title: string;
    description: string;
    actionLabel: string | null;
}

const STATUS_CONTENT: Record<PatientRegistrationRequestStatus, RegistrationStatusContent> = {
    PENDING: {
        title: "Cadastro em análise",
        description:
            "Sua solicitação foi enviada e a equipe da farmácia vai analisá-la em breve. " +
            "Assim que for aprovada, seu acesso de paciente será liberado.",
        actionLabel: null,
    },
    APPROVED: {
        title: "Cadastro aprovado",
        description: "Seu cadastro foi aprovado. Entre novamente para acessar sua conta de paciente.",
        actionLabel: null,
    },
    REJECTED: {
        title: "Cadastro não aprovado",
        description:
            "A farmácia não aprovou sua solicitação. Confira seus dados e envie um novo cadastro, " +
            "ou fale com a farmácia para entender o motivo.",
        actionLabel: "Enviar novo cadastro",
    },
};

const NO_REQUEST_CONTENT: RegistrationStatusContent = {
    title: "Cadastre-se como paciente",
    description:
        "Você está navegando como visitante. Escolha a farmácia que acompanha seu tratamento e " +
        "envie seus dados para receber seus medicamentos pelo aplicativo.",
    actionLabel: "Fazer meu cadastro",
};

export function getRegistrationStatusContent(
    request: IVisitorRegistrationRequest | null,
): RegistrationStatusContent {
    return request ? STATUS_CONTENT[request.status] : NO_REQUEST_CONTENT;
}

export function canSubmitRegistration(request: IVisitorRegistrationRequest | null): boolean {
    return request === null || request.status === "REJECTED";
}
