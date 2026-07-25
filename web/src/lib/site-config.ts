import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ImpactStat {
  value: number;
  suffix?: string;
  label: string;
}

/**
 * Placeholder de WhatsApp — substituir pelo número real antes de publicar.
 */
export const WHATSAPP_DISPLAY = "+55 (00) 0000-0000";
export const WHATSAPP_LINK = "https://wa.me/5500000000000";

export const CONTACT_EMAIL = "contato@chegamed.com.br";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.devluan.chegamed";

export const NAV_LINKS: NavLink[] = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Disponibilidade", href: "#disponibilidade" },
  { label: "Impacto", href: "#impacto" },
  { label: "Contato", href: "#contato" },
];

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: "Bloqueio de retirada duplicada",
    description:
      "O sistema calcula automaticamente a próxima data disponível para cada medicamento e alerta a equipe antes de liberar uma retirada antecipada, evitando desperdício.",
  },
  {
    icon: ClipboardList,
    title: "Gestão de prescrições",
    description:
      "Cadastre receitas com dosagem, frequência e tipo de tratamento (contínuo ou por período fixo) e acompanhe cada item prescrito ao longo do tempo.",
  },
  {
    icon: Boxes,
    title: "Controle de estoque em tempo real",
    description:
      "Toda entrada e saída de medicamento é registrada automaticamente, mantendo o estoque da farmácia sempre atualizado e confiável.",
  },
  {
    icon: Building2,
    title: "Multiempresa e multiunidade",
    description:
      "Gerencie várias farmácias e postos vinculados à mesma prefeitura, com usuários, permissões e estoques organizados por unidade.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de movimentação",
    description:
      "Acompanhe entregas, estoque e histórico de cada paciente com relatórios claros, prontos para embasar decisões da gestão.",
  },
  {
    icon: Users,
    title: "Cadastro de pacientes",
    description:
      "Centralize os dados dos pacientes atendidos e o histórico de entregas de cada um, com controle de acesso por cargo do usuário.",
  },
];

export const IMPACT_STATS: ImpactStat[] = [
  { value: 40, suffix: "%", label: "menos desperdício de medicamentos" },
  { value: 12000, suffix: "+", label: "pacientes cadastrados" },
  { value: 50, suffix: "+", label: "farmácias e unidades atendidas" },
  { value: 98, suffix: "%", label: "satisfação dos gestores" },
];
