// app/[locale]/about-us/page.tsx
//
// Questo file sostituisce completamente il vecchio AboutUsPage che usava
// AboutUsContainer come prop. Ora AboutUsPage è autosufficiente.

import AboutUsPage from "@/app/containers/AboutUsPage";

export default function Page() {
  return <AboutUsPage />;
}