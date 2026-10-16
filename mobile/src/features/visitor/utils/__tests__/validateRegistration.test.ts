import { VisitorRegistrationFormValues } from "@/features/visitor/hooks/useVisitorRegistrationForm";
import { validateRegistration } from "@/features/visitor/utils/validateRegistration";

const VALID_VALUES: VisitorRegistrationFormValues = {
    name: "Luan Alves",
    cpf: "123.456.789-01",
    birthDate: "20/05/1990",
    contact: "",
    address: "",
};

function withValues(overrides: Partial<VisitorRegistrationFormValues>): VisitorRegistrationFormValues {
    return { ...VALID_VALUES, ...overrides };
}

describe("validateRegistration", () => {
    it("accepts a complete form", () => {
        expect(validateRegistration(VALID_VALUES)).toBeNull();
    });

    it("requires a name that is not only whitespace", () => {
        expect(validateRegistration(withValues({ name: "   " }))?.field).toBe("name");
    });

    it("requires eleven cpf digits", () => {
        expect(validateRegistration(withValues({ cpf: "123.456.789" }))?.field).toBe("cpf");
    });

    it("rejects an impossible birth date", () => {
        expect(validateRegistration(withValues({ birthDate: "31/02/1990" }))?.message).toBe(
            "Informe uma data de nascimento válida.",
        );
    });

    it("rejects a birth date in the future", () => {
        const nextYear = new Date().getFullYear() + 1;

        expect(validateRegistration(withValues({ birthDate: `20/05/${nextYear}` }))?.message).toBe(
            "A data de nascimento não pode ser futura.",
        );
    });

    it("treats contact and address as optional", () => {
        expect(validateRegistration(withValues({ contact: "", address: "" }))).toBeNull();
    });
});
