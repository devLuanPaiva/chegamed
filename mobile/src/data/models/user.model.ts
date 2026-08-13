export enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    ASSISTANT = "ASSISTANT",
    PATIENT = "PATIENT",
    DELIVERER = "DELIVERER",
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrador",
    [UserRole.MANAGER]: "Gerente",
    [UserRole.ASSISTANT]: "Assistente",
    [UserRole.PATIENT]: "Paciente",
    [UserRole.DELIVERER]: "Entregador",
};

export const PHARMACY_STAFF_ROLES: UserRole[] = [UserRole.MANAGER, UserRole.ASSISTANT];

export function normalizeUserRole(rawRole: unknown): UserRole | null {
    if (typeof rawRole === "string" && rawRole in UserRole) {
        return UserRole[rawRole as keyof typeof UserRole];
    }

    return null;
}

export interface IUser {
    id: string;
    name: string;
    email: string;
    password?: string;
    imageUrl?: string;
    cpf: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
