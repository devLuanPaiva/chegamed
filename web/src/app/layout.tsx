import type { Metadata } from "next";
import { Montserrat, Bebas_Neue} from "next/font/google";
import "./globals.scss";

const bebasNueve = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
  display: "swap",
});


const montSerrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chegamed.com.br"),

  title: {
    default: "ChegaMed | Medicamentos até você",
    template: "%s | ChegaMed",
  },

  description:
    "ChegaMed é a plataforma para farmácias populares e pontos de doação de medicamentos. Controle as entregas de cada paciente e saiba exatamente quando ele pode retirar novamente, evitando que um medicamento ainda dentro do prazo de consumo seja entregue em dobro e desperdiçado.",

  keywords: [
    "sistema para farmácia popular",
    "gestão de doação de medicamentos",
    "controle de entrega de medicamentos",
    "evitar desperdício de medicamentos",
    "entrega duplicada de remédios",
    "controle de prescrições médicas",
    "gestão de pacientes farmácia",
    "redução de custos farmácia popular",
    "fila de entregas pendentes de medicamentos",
    "farmácia digital",
    "controle de prazo de consumo de medicamentos",
    "sistema para farmácia beneficente",
    "gestão de dispensação de medicamentos",
    "plataforma para farmácias populares",
    "redução de desperdício de doações",
    "gestão eficiente de farmácia",
    "app para farmácia popular",
    "sistema de prescrição médica",
  ],

  authors: [{ name: "ChegaMed" }],
  creator: "ChegaMed",
  publisher: "ChegaMed",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/favicon-16x16.png",
        sizes: "16x16",
      },
      {
        rel: "icon",
        url: "/favicon-32x32.png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
      },
    ],
  },

  alternates: {
    canonical: "https://chegamed.com.br",
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://chegamed.com.br",
    siteName: "ChegaMed",
    title: "ChegaMed | Medicamentos até você",
    description:
      "Feito para farmácias populares e pontos de doação: acompanhe as entregas de cada paciente e impeça que um medicamento ainda dentro do prazo de consumo seja retirado em dobro, reduzindo desperdício e custos.",
    images: [
      {
        url: "https://chegamed.com.br/logo-com-fundo.png",
        width: 1200,
        height: 630,
        alt: "ChegaMed - Controle de Entregas de Medicamentos para Farmácias Populares",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ChegaMed | Medicamentos até você",
    description:
      "Menos desperdício, mais controle: saiba quando cada paciente pode retirar o medicamento novamente e evite entregas duplicadas em farmácias populares.",
    images: ["https://chegamed.com.br/logo-com-fundo.png"],
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNueve.variable} ${montSerrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
