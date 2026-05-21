"use client";

import {
  LegalLink,
  LegalPageShell,
  LegalSection,
} from "@/components/LegalPageShell";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function DataDeletionPage() {
  const { lang } = useLanguage();
  const isNorwegian = lang === "nb";

  return (
    <LegalPageShell
      title={isNorwegian ? "Sletting av data" : "Data Deletion Instructions"}
      lastUpdated={
        isNorwegian
          ? "Sist oppdatert: 29. april 2026"
          : "Last updated: April 29, 2026"
      }
    >
      {isNorwegian ? <NorwegianDataDeletion /> : <EnglishDataDeletion />}
    </LegalPageShell>
  );
}

const listClass =
  "list-disc space-y-1.5 pl-6 text-zinc-400 marker:text-zinc-600";

function NorwegianDataDeletion() {
  return (
    <>
      <div className="text-zinc-400">
        <p>
          Gjensvar, som drives av Kapstad Media AS, tar personvern på alvor.
          Du kan be om sletting av alle data knyttet til Gjensvar-kontoen din
          når som helst.
        </p>
      </div>

      <LegalSection number="01" title="Slik ber du om sletting">
        <p>
          Send en e-post til{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no?subject=Data%20deletion%20request%20%E2%80%93%20Gjensvar">
            sander@kapstadmedia.no
          </LegalLink>{" "}
          med emne «Data deletion request – Gjensvar». Oppgi e-postadressen du
          brukte til å registrere Gjensvar-kontoen, slik at vi kan finne og
          verifisere dataene dine.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Hva vi sletter">
        <p>
          Når vi mottar og verifiserer forespørselen din, sletter vi følgende
          permanent innen 30 dager:
        </p>
        <ul className={listClass}>
          <li>Brukerkontoen og påloggingsinformasjonen din i Gjensvar</li>
          <li>
            Alle tilgangstokener til sosiale medier (Instagram, TikTok,
            YouTube, Facebook, Snapchat)
          </li>
          <li>Alle mellomlagrede resultatdata knyttet til kontoen din</li>
          <li>
            Eventuelle kunde-arbeidsområder og kategorier du har opprettet
          </li>
        </ul>
        <p>
          Sikkerhetskopier slettes innen 90 dager som del av vår vanlige
          rotasjon. Vi bekrefter på e-post når slettingen er fullført.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Trekke tilbake plattformtilgang">
        <p>
          Du kan også trekke tilbake Gjensvars tilgang direkte fra hver
          plattforms innstillinger — for eksempel på Facebook gjennom{" "}
          <em className="text-zinc-300">
            Innstillinger og personvern &rarr; Innstillinger &rarr;
            Forretningsintegrasjoner
          </em>
          . Å trekke tilbake tilgang stopper videre datainnsamling, men sletter
          ikke data som allerede er lagret hos Gjensvar; for full sletting,
          send e-posten beskrevet over.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Kontakt">
        <p>
          Har du spørsmål om sletting av data, ta kontakt på{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no">
            sander@kapstadmedia.no
          </LegalLink>
          .
        </p>
      </LegalSection>
    </>
  );
}

function EnglishDataDeletion() {
  return (
    <>
      <div className="text-zinc-400">
        <p>
          Gjensvar, operated by Kapstad Media AS, takes data privacy seriously.
          You can request deletion of all data associated with your Gjensvar
          account at any time.
        </p>
      </div>

      <LegalSection number="01" title="How to request deletion">
        <p>
          Send an email to{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no?subject=Data%20deletion%20request%20%E2%80%93%20Gjensvar">
            sander@kapstadmedia.no
          </LegalLink>{" "}
          with the subject line &quot;Data deletion request – Gjensvar&quot;.
          Include the email address used to register your Gjensvar account so
          we can locate and verify your data.
        </p>
      </LegalSection>

      <LegalSection number="02" title="What we delete">
        <p>
          Once we receive and verify your request, we will permanently delete
          the following within 30 days:
        </p>
        <ul className={listClass}>
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
          Backup copies are purged within 90 days as part of our regular backup
          rotation. We will confirm by email once deletion is complete.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Revoking platform access">
        <p>
          You can also revoke Gjensvar&apos;s access at any time directly from
          each platform&apos;s settings — for example, on Facebook through{" "}
          <em className="text-zinc-300">
            Settings &amp; privacy &rarr; Settings &rarr; Business integrations
          </em>
          . Revoking access stops further data collection but does not delete
          data already stored in Gjensvar; for full deletion, send the email
          described above.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Contact">
        <p>
          For questions about data deletion, contact{" "}
          <LegalLink href="mailto:sander@kapstadmedia.no">
            sander@kapstadmedia.no
          </LegalLink>
          .
        </p>
      </LegalSection>
    </>
  );
}
