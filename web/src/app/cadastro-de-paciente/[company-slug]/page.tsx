import type { Metadata } from "next";

import { BusinessHoursNotice } from "@/components/patient-registration/BusinessHoursNotice";
import { CompanyNotFoundCard } from "@/components/patient-registration/CompanyNotFoundCard";
import { PatientRegistrationForm } from "@/components/patient-registration/PatientRegistrationForm";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { ApiClientError, apiFetch } from "@/lib/api-client";
import { isWithinBusinessHours } from "@/lib/business-hours";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cadastro de paciente | ChegaMed",
  description: "Solicite seu cadastro como paciente para acompanhar suas entregas de medicamentos.",
};

interface PublicCompanySummary {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface PatientRegistrationPageProps {
  params: Promise<{ "company-slug": string }>;
}

export default async function PatientRegistrationPage({ params }: Readonly<PatientRegistrationPageProps>) {
  const { "company-slug": companySlug } = await params;
  const company = await getPublicCompany(companySlug);

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-neutral-50 px-6 py-16 sm:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-primary-50 blur-3xl" />

        <div className="relative w-full">
          {renderRegistrationContent(company, companySlug)}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function renderRegistrationContent(company: PublicCompanySummary | null, companySlug: string) {
  if (!company) {
    return <CompanyNotFoundCard />;
  }

  if (!isWithinBusinessHours()) {
    return <BusinessHoursNotice />;
  }

  return <PatientRegistrationForm companySlug={companySlug} companyName={company.name} />;
}

async function getPublicCompany(slug: string): Promise<PublicCompanySummary | null> {
  try {
    return await apiFetch<PublicCompanySummary>(`/public/companies/${slug}`);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
