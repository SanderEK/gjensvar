"use client";

import {
  LegalLink,
  LegalPageShell,
  LegalSection,
} from "@/components/LegalPageShell";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function TermsOfService() {
  const { lang } = useLanguage();
  const isNorwegian = lang === "nb";

  return (
    <LegalPageShell
      title={isNorwegian ? "Vilkår for bruk" : "Terms of Service"}
      lastUpdated={
        isNorwegian
          ? "Sist oppdatert: 11. februar 2026"
          : "Last updated: February 11, 2026"
      }
    >
      {isNorwegian ? <NorwegianTerms /> : <EnglishTerms />}
    </LegalPageShell>
  );
}

function NorwegianTerms() {
  return (
    <>
      <LegalSection number="01" title="Innledning">
        <p>
          Velkommen til Gjensvar («vi», «vår» eller «oss»). Gjensvar er et
          analyseverktøy for sosiale medier som drives av Kapstad Media AS. Ved
          å bruke tjenesten godtar du å være bundet av disse vilkårene.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Beskrivelse av tjenesten">
        <p>
          Gjensvar tilbyr verktøy for analyse og rapportering av sosiale
          medier. Tjenesten samler offentlig tilgjengelige resultatdata fra
          tilkoblede kontoer på sosiale medier, og bruker disse til å generere
          rapporter og visualiseringer.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Brukerkontoer">
        <p>
          Tilgang til Gjensvar gis kun etter manuell godkjenning. Du er
          ansvarlig for å holde påloggingsinformasjonen din konfidensiell og
          for all aktivitet som skjer på kontoen din.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Tredjepartstjenester">
        <p>
          Gjensvar integreres mot tredjepartsplattformer, inkludert men ikke
          begrenset til Instagram, TikTok, YouTube, Facebook og Snapchat. Bruk
          av disse integrasjonene er underlagt den respektive plattformens
          egne vilkår. Vi er ikke ansvarlige for eventuelle endringer i
          tredjeparts-API-er eller -tjenester.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Bruk av data">
        <p>
          Vi samler inn og lagrer resultatdata fra sosiale medier (som
          visninger, likes og engasjementsdata) utelukkende for å generere
          analyserapporter. Vi selger ikke og deler ikke disse dataene med
          tredjeparter utover det formålet rapporteringen er ment for.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Ansvarsbegrensning">
        <p>
          Gjensvar leveres «som det er», uten noen form for garantier. Vi er
          ikke ansvarlige for unøyaktigheter i data fra tredjepartsplattformer
          eller for skader som måtte oppstå som følge av bruk av tjenesten.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Endringer i vilkårene">
        <p>
          Vi forbeholder oss retten til å endre disse vilkårene når som helst.
          Fortsatt bruk av tjenesten etter endringer innebærer at du godtar de
          oppdaterte vilkårene.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Kontakt">
        <p>
          Har du spørsmål om vilkårene, ta kontakt på{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no">
            sander@kapstadmedia.no
          </LegalLink>
          .
        </p>
      </LegalSection>
    </>
  );
}

function EnglishTerms() {
  return (
    <>
      <LegalSection number="01" title="Introduction">
        <p>
          Welcome to Gjensvar (&quot;we&quot;, &quot;our&quot;, or
          &quot;us&quot;). Gjensvar is a social media analytics dashboard
          operated by Kapstad Media AS. By accessing or using our service, you
          agree to be bound by these Terms of Service.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Description of Service">
        <p>
          Gjensvar provides social media analytics and reporting tools. The
          service aggregates publicly available performance data from connected
          social media accounts to generate reports and visualizations.
        </p>
      </LegalSection>

      <LegalSection number="03" title="User Accounts">
        <p>
          Access to Gjensvar is provided by invitation only. You are
          responsible for maintaining the confidentiality of your account
          credentials and for all activities that occur under your account.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Third-Party Services">
        <p>
          Gjensvar integrates with third-party platforms including but not
          limited to Instagram, TikTok, YouTube, Facebook, and Snapchat. Your
          use of these integrations is subject to the respective platform&apos;s
          terms of service. We are not responsible for any changes to
          third-party APIs or services.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Data Usage">
        <p>
          We collect and store social media performance data (such as video
          views, likes, and engagement metrics) solely for the purpose of
          generating analytics reports. We do not sell or share this data with
          third parties outside of the intended reporting purpose.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Limitation of Liability">
        <p>
          Gjensvar is provided &quot;as is&quot; without warranties of any
          kind. We are not liable for any inaccuracies in the data provided by
          third-party platforms or for any damages resulting from the use of
          our service.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Changes to Terms">
        <p>
          We reserve the right to modify these terms at any time. Continued use
          of the service after changes constitutes acceptance of the updated
          terms.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Contact">
        <p>
          For questions about these terms, please contact us at{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no">
            sander@kapstadmedia.no
          </LegalLink>
          .
        </p>
      </LegalSection>
    </>
  );
}
