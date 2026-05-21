"use client";

import {
  LegalLink,
  LegalPageShell,
  LegalSection,
} from "@/components/LegalPageShell";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function PrivacyPolicy() {
  const { lang } = useLanguage();
  const isNorwegian = lang === "nb";

  return (
    <LegalPageShell
      title={isNorwegian ? "Personvernerklæring" : "Privacy Policy"}
      lastUpdated={
        isNorwegian
          ? "Sist oppdatert: 11. februar 2026"
          : "Last updated: February 11, 2026"
      }
    >
      {isNorwegian ? <NorwegianPrivacy /> : <EnglishPrivacy />}
    </LegalPageShell>
  );
}

const listClass =
  "list-disc space-y-2 pl-6 text-zinc-400 marker:text-zinc-600";
const listClassTight =
  "list-disc space-y-1.5 pl-6 text-zinc-400 marker:text-zinc-600";

function NorwegianPrivacy() {
  return (
    <>
      <LegalSection number="01" title="Innledning">
        <p>
          Denne personvernerklæringen forklarer hvordan Gjensvar, som drives av
          Kapstad Media AS, samler inn, bruker og beskytter informasjonen din
          når du bruker analyseverktøyet vårt for sosiale medier.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Hvilken informasjon vi samler inn">
        <p>Vi samler inn følgende typer informasjon:</p>
        <ul className={listClass}>
          <li>
            <strong className="font-medium text-zinc-200">
              Kontoinformasjon:
            </strong>{" "}
            E-postadresse og passord som brukes til å logge inn på Gjensvar.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">
              Data fra sosiale medier:
            </strong>{" "}
            Resultatdata for video (visninger, likes, kommentarer, delinger)
            fra tilkoblede kontoer på Instagram, TikTok, YouTube, Facebook og
            Snapchat.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">
              Tilgangstokener:
            </strong>{" "}
            OAuth-tokener som brukes for å kommunisere med tredjeparts-API-er
            på dine vegne.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="Hvordan vi bruker informasjonen">
        <p>Vi bruker den innsamlede informasjonen til å:</p>
        <ul className={listClassTight}>
          <li>Vise analyser og rapporter for sosiale medier i dashbordet ditt</li>
          <li>Spore historiske resultater over tid</li>
          <li>Generere samlede rapporter på tvers av flere plattformer</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Lagring og sikkerhet">
        <p>
          Dataene dine lagres sikkert hos Supabase (driftet på AWS).
          Tilgangstokener lagres kun på serversiden og eksponeres aldri til
          klienten. Vi bruker Row Level Security (RLS) for å sikre
          dataisolasjon mellom brukere.
        </p>
        <p>
          Passord lagres aldri i klartekst. Alle passord hashes med
          industristandarden bcrypt før de lagres. Verken Kapstad Media AS
          eller noen administrator kan se passordet ditt. Glemmer du passordet
          ditt, må det tilbakestilles — det kan ikke hentes ut.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Deling av data">
        <p>
          Vi selger, bytter eller deler ikke personlige data eller analysedata
          fra sosiale medier med tredjeparter. Data er kun tilgjengelig for
          autoriserte brukere innenfor din egen organisasjon.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Lagringstid">
        <p>
          Vi lagrer resultatdata fra sosiale medier så lenge kontoen din er
          aktiv. Du kan be om at dataene dine slettes når som helst ved å
          kontakte oss.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Tredjepartstjenester">
        <p>
          Gjensvar integreres mot tredjepartsplattformer. Når du kobler til
          kontoer på sosiale medier, gir du oss tillatelse til å hente
          offentlig innhold og resultatdata via API-ene deres. Les gjerne
          personvernerklæringene til disse plattformene for mer informasjon.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Dine rettigheter">
        <p>Du har rett til å:</p>
        <ul className={listClassTight}>
          <li>Få innsyn i hvilke data vi har lagret om deg</li>
          <li>Be om retting av unøyaktige data</li>
          <li>Be om at dataene dine slettes</li>
          <li>
            Trekke tilbake tilgang til tilkoblede kontoer på sosiale medier
            når som helst
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="09" title="Sletting av data" id="data-deletion">
        <p>
          Du kan be om sletting av alle data knyttet til Gjensvar-kontoen din
          når som helst. For å be om sletting, send en e-post til{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no?subject=Data%20deletion%20request%20%E2%80%93%20Gjensvar">
            sander@kapstadmedia.no
          </LegalLink>{" "}
          med emne «Data deletion request – Gjensvar», og oppgi
          e-postadressen du brukte til å registrere kontoen.
        </p>
        <p>Når vi mottar forespørselen, sletter vi følgende innen 30 dager:</p>
        <ul className={listClassTight}>
          <li>Brukerkontoen og påloggingsinformasjonen din i Gjensvar</li>
          <li>
            Alle tilgangstokener til sosiale medier (Instagram, TikTok,
            YouTube, Facebook, Snapchat)
          </li>
          <li>Alle mellomlagrede resultatdata knyttet til kontoen din</li>
          <li>Eventuelle kunde-arbeidsområder og kategorier du har opprettet</li>
        </ul>
        <p>
          Du kan også trekke tilbake Gjensvars tilgang direkte fra hver
          plattforms innstillinger (for eksempel Facebook &rarr; Innstillinger
          og personvern &rarr; Innstillinger &rarr; Forretningsintegrasjoner).
          Dette stopper videre datainnsamling, men sletter ikke data som
          allerede er lagret hos Gjensvar — for full sletting, send e-posten
          over.
        </p>
        <p>
          Vi bekrefter på e-post når slettingen er fullført. Sikkerhetskopier
          slettes innen 90 dager som del av vår vanlige rotasjon.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Endringer i denne erklæringen">
        <p>
          Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vi
          varsler deg om vesentlige endringer gjennom tjenesten.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Kontakt">
        <p>
          Har du spørsmål om personvernerklæringen, ta kontakt på{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no">
            sander@kapstadmedia.no
          </LegalLink>
          .
        </p>
      </LegalSection>
    </>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <LegalSection number="01" title="Introduction">
        <p>
          This Privacy Policy explains how Gjensvar, operated by Kapstad Media
          AS, collects, uses, and protects your information when you use our
          social media analytics dashboard.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Information We Collect">
        <p>We collect the following types of information:</p>
        <ul className={listClass}>
          <li>
            <strong className="font-medium text-zinc-200">
              Account information:
            </strong>{" "}
            Email address and password used to log in to Gjensvar.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">
              Social media data:
            </strong>{" "}
            Video performance metrics (views, likes, comments, shares) from
            connected social media accounts including Instagram, TikTok,
            YouTube, Facebook, and Snapchat.
          </li>
          <li>
            <strong className="font-medium text-zinc-200">
              Access tokens:
            </strong>{" "}
            OAuth tokens used to communicate with third-party social media APIs
            on your behalf.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="How We Use Your Information">
        <p>We use the collected information to:</p>
        <ul className={listClassTight}>
          <li>Display social media analytics and reports in your dashboard</li>
          <li>Track historical performance data over time</li>
          <li>Generate aggregated reports across multiple platforms</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Data Storage and Security">
        <p>
          Your data is stored securely using Supabase (hosted on AWS). Access
          tokens are stored server-side and are never exposed to the client. We
          use Row Level Security (RLS) to ensure data isolation between users.
        </p>
        <p>
          Passwords are never stored in plain text. All passwords are hashed
          using industry-standard bcrypt encryption before being stored.
          Neither Kapstad Media AS nor any administrator can view your
          password. If you forget your password, it must be reset — it cannot
          be retrieved.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Data Sharing">
        <p>
          We do not sell, trade, or share your personal data or social media
          analytics data with third parties. Data is only accessible to
          authorized users within your organization.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Data Retention">
        <p>
          We retain social media performance data for as long as your account
          is active. You may request deletion of your data at any time by
          contacting us.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Third-Party Services">
        <p>
          Gjensvar integrates with third-party platforms. When you connect your
          social media accounts, you authorize us to access your public content
          and performance metrics through their APIs. Please review the privacy
          policies of these platforms for more information.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Your Rights">
        <p>You have the right to:</p>
        <ul className={listClassTight}>
          <li>Access the data we store about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Revoke access to connected social media accounts at any time</li>
        </ul>
      </LegalSection>

      <LegalSection number="09" title="Data Deletion" id="data-deletion">
        <p>
          You can request deletion of all data associated with your Gjensvar
          account at any time. To request deletion, send an email to{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no?subject=Data%20deletion%20request%20%E2%80%93%20Gjensvar">
            sander@kapstadmedia.no
          </LegalLink>{" "}
          with the subject line &quot;Data deletion request – Gjensvar&quot;
          and include the email address used to register your account.
        </p>
        <p>
          Once we receive your request, we will delete the following within 30
          days:
        </p>
        <ul className={listClassTight}>
          <li>Your Gjensvar user account and login credentials</li>
          <li>
            All connected social media access tokens (Instagram, TikTok,
            YouTube, Facebook, Snapchat)
          </li>
          <li>
            All cached social media performance data linked to your account
          </li>
          <li>Any client workspaces and categories you have created</li>
        </ul>
        <p>
          You can also revoke Gjensvar&apos;s access at any time directly from
          each platform&apos;s settings (for example, Facebook &rarr; Settings
          &amp; privacy &rarr; Settings &rarr; Business integrations). Revoking
          access stops further data collection but does not delete data already
          stored in Gjensvar — for full deletion, send the email above.
        </p>
        <p>
          We will confirm by email once deletion is complete. Backup copies are
          purged within 90 days as part of our regular backup rotation.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any significant changes through the service.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Contact">
        <p>
          For questions about this Privacy Policy, please contact us at{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no">
            sander@kapstadmedia.no
          </LegalLink>
          .
        </p>
      </LegalSection>
    </>
  );
}
