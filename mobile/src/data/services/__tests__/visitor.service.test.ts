import {
    createVisitorRegistrationRequest,
    getCompaniesOpenForRegistration,
    getMyRegistrationRequest,
} from "@/data/services/visitor.service";

jest.mock("@/lib/env", () => ({
    BASE_URL: "https://api.example.com",
}));

function mockEnvelope<T>(data: T) {
    (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
            success: true,
            message: "ok",
            count: null,
            currentPage: null,
            totalPages: null,
            next: null,
            previous: null,
            data,
        }),
    });
}

const companyDto = {
    id: "company-1",
    name: "Farmácia Central",
    imageUrl: null,
};

const requestDto = {
    id: "request-1",
    companyId: "company-1",
    companyName: "Farmácia Central",
    name: "Luan Alves",
    maskedCpf: "123.***.***-**",
    status: "PENDING" as const,
    createdAt: "2026-09-21T12:00:00",
};

describe("visitor.service", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    describe("getCompaniesOpenForRegistration", () => {
        it("maps the companies a visitor can choose from", async () => {
            mockEnvelope([companyDto, { ...companyDto, id: "company-2", imageUrl: "https://example.com/logo.png" }]);

            const result = await getCompaniesOpenForRegistration();

            expect(global.fetch).toHaveBeenCalledWith(
                "https://api.example.com/visitor/companies",
                expect.anything(),
            );
            expect(result).toEqual([
                { id: "company-1", name: "Farmácia Central", imageUrl: undefined },
                { id: "company-2", name: "Farmácia Central", imageUrl: "https://example.com/logo.png" },
            ]);
        });
    });

    describe("createVisitorRegistrationRequest", () => {
        it("posts the payload and maps the created request", async () => {
            mockEnvelope(requestDto);

            const result = await createVisitorRegistrationRequest({
                companyId: "company-1",
                name: "Luan Alves",
                cpf: "12345678901",
                birthDate: "1990-05-20",
                contact: "85999999999",
            });

            const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
            expect(url).toBe("https://api.example.com/visitor/patient-registration-requests");
            expect(options.method).toBe("POST");
            expect(JSON.parse(options.body)).toEqual({
                companyId: "company-1",
                name: "Luan Alves",
                cpf: "12345678901",
                birthDate: "1990-05-20",
                contact: "85999999999",
            });
            expect(result.status).toBe("PENDING");
            expect(result.companyName).toBe("Farmácia Central");
            expect(result.createdAt).toBeInstanceOf(Date);
        });
    });

    describe("getMyRegistrationRequest", () => {
        it("returns the mapped request when the visitor already asked to be registered", async () => {
            mockEnvelope({ ...requestDto, status: "APPROVED" });

            const result = await getMyRegistrationRequest();

            expect(result?.status).toBe("APPROVED");
            expect(result?.maskedCpf).toBe("123.***.***-**");
        });

        it("returns null when the visitor never asked to be registered", async () => {
            mockEnvelope(null);

            await expect(getMyRegistrationRequest()).resolves.toBeNull();
        });
    });
});
