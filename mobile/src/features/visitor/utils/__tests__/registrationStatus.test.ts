import { IVisitorRegistrationRequest } from "@/data/models/visitor.model";
import {
    canSubmitRegistration,
    getRegistrationStatusContent,
} from "@/features/visitor/utils/registrationStatus";
import { PatientRegistrationRequestStatus } from "@/data/models/patient.model";

function buildRequest(status: PatientRegistrationRequestStatus): IVisitorRegistrationRequest {
    return {
        id: "request-1",
        companyId: "company-1",
        companyName: "Farmácia Central",
        name: "Luan Alves",
        maskedCpf: "123.***.***-**",
        status,
        createdAt: new Date("2026-09-21T12:00:00"),
    };
}

describe("getRegistrationStatusContent", () => {
    it("invites the visitor to register when there is no request yet", () => {
        const content = getRegistrationStatusContent(null);

        expect(content.title).toBe("Cadastre-se como paciente");
        expect(content.actionLabel).toBe("Fazer meu cadastro");
    });

    it("offers no action while the request is being reviewed", () => {
        const content = getRegistrationStatusContent(buildRequest("PENDING"));

        expect(content.title).toBe("Cadastro em análise");
        expect(content.actionLabel).toBeNull();
    });

    it("offers a new attempt when the request was rejected", () => {
        const content = getRegistrationStatusContent(buildRequest("REJECTED"));

        expect(content.title).toBe("Cadastro não aprovado");
        expect(content.actionLabel).toBe("Enviar novo cadastro");
    });

    it("tells the visitor to sign in again once the request is approved", () => {
        const content = getRegistrationStatusContent(buildRequest("APPROVED"));

        expect(content.title).toBe("Cadastro aprovado");
        expect(content.actionLabel).toBeNull();
    });
});

describe("canSubmitRegistration", () => {
    it.each([
        [null, true],
        [buildRequest("REJECTED"), true],
        [buildRequest("PENDING"), false],
        [buildRequest("APPROVED"), false],
    ])("resolves whether a new request can be sent", (request, expected) => {
        expect(canSubmitRegistration(request)).toBe(expected);
    });
});
