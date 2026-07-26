import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  ListOrdered,
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

export const CONTACT_EMAIL = "devluanpaiva@gmail.com";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.devluan.chegamed";

export const NAV_LINKS: NavLink[] = [
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Funcionalidades", href: "/#funcionalidades" },
  { label: "Disponibilidade", href: "/#disponibilidade" },
  { label: "Impacto", href: "/#impacto" },
  { label: "Contato", href: "/#contato" },
];

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: "Bloqueio por medicamento",
    description:
      "Cada item da receita tem seu próprio prazo de tratamento. O ChegaMed libera apenas o que já pode ser entregue, remédio por remédio — nunca a receita inteira.",
  },
  {
    icon: ListOrdered,
    title: "Fila de entregas pendentes",
    description:
      "Quando um medicamento em falta chega à prefeitura, o sistema aponta quem está esperando há mais tempo, priorizando a entrega por ordem de cadastro.",
  },
  {
    icon: ClipboardList,
    title: "Gestão de prescrições",
    description:
      "Cadastre receitas com dosagem, frequência e tipo de tratamento (contínuo ou por período fixo) e acompanhe cada item prescrito ao longo do tempo.",
  },
  {
    icon: Building2,
    title: "Multiempresa e multiunidade",
    description:
      "Gerencie várias farmácias e postos vinculados à mesma prefeitura, com usuários e permissões organizados por unidade.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e indicadores de entrega",
    description:
      "Painéis com status das prescrições, fila de pendências e taxa de cumprimento por período, prontos para embasar decisões da gestão.",
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
