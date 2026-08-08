import { Href } from "expo-router";
import { History, PillBottle, ScanLine, Truck, Users } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { UserRole } from "@/data/models/user.model";

export interface ModuleDefinition {
    id: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    route: Href;
    allowedRoles: UserRole[];
}

export const HOME_MODULES: ModuleDefinition[] = [
    {
        id: "prescriptions",
        title: "Receituário",
        subtitle: "Escanear receitas com IA",
        icon: ScanLine,
        route: "/(protected)/prescriptions" as Href,
        allowedRoles: [UserRole.MANAGER, UserRole.ASSISTANT],
    },
    {
        id: "patients",
        title: "Pacientes",
        subtitle: "Consultar e cadastrar pacientes",
        icon: Users,
        route: "/(protected)/patients" as Href,
        allowedRoles: [UserRole.MANAGER, UserRole.ASSISTANT],
    },
    {
        id: "medicines",
        title: "Medicamentos",
        subtitle: "Cadastrar medicamento com IA",
        icon: PillBottle,
        route: "/(protected)/medicines" as Href,
        allowedRoles: [UserRole.MANAGER, UserRole.ASSISTANT],
    },
    {
        id: "deliveries",
        title: "Entregas",
        subtitle: "Registrar e acompanhar entregas",
        icon: Truck,
        route: "/(protected)/deliveries" as Href,
        allowedRoles: [UserRole.MANAGER, UserRole.ASSISTANT],
    },
    {
        id: "my-deliveries",
        title: "Minhas entregas",
        subtitle: "Entregar medicamentos nos endereços",
        icon: Truck,
        route: "/(protected)/my-deliveries" as Href,
        allowedRoles: [UserRole.DELIVERER],
    },
    {
        id: "history",
        title: "Histórico de receitas",
        subtitle: "Acompanhe seus medicamentos",
        icon: History,
        route: "/(protected)/history" as Href,
        allowedRoles: [UserRole.PATIENT],
    },
];
