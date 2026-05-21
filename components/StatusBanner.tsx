"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const ERROR_KEYS: Record<string, TranslationKey> = {
  meta_auth_failed: "dashboard.bannerErrorMetaAuthFailed",
  config_error: "dashboard.bannerErrorConfig",
  not_authenticated: "dashboard.bannerErrorNotAuthenticated",
  no_client_selected: "dashboard.bannerErrorNoClientSelected",
  state_mismatch: "dashboard.bannerErrorStateMismatch",
  token_exchange_failed: "dashboard.bannerErrorTokenExchangeFailed",
  long_lived_token_failed: "dashboard.bannerErrorLongLivedTokenFailed",
  no_pages_found: "dashboard.bannerErrorNoPagesFound",
  no_ig_business_account: "dashboard.bannerErrorNoIgBusinessAccount",
  db_error: "dashboard.bannerErrorDb",
  unexpected_error: "dashboard.bannerErrorUnexpected",
  no_client: "dashboard.bannerErrorNoClient",
};

const SUCCESS_KEYS: Record<string, TranslationKey> = {
  instagram_connected: "dashboard.bannerSuccessInstagram",
  facebook_connected: "dashboard.bannerSuccessFacebook",
  tiktok_connected: "dashboard.bannerSuccessTiktok",
  youtube_connected: "dashboard.bannerSuccessYoutube",
};

export function StatusBanner() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);

  const errorKey = searchParams.get("error");
  const successKey = searchParams.get("success");

  const errorText = errorKey
    ? ERROR_KEYS[errorKey]
      ? t(ERROR_KEYS[errorKey])
      : t("dashboard.bannerErrorPrefix", { key: errorKey })
    : null;
  const successText = successKey && SUCCESS_KEYS[successKey] ? t(SUCCESS_KEYS[successKey]) : null;

  useEffect(() => {
    setVisible(true);
  }, [errorKey, successKey]);

  if (!errorText && !successText) return null;
  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    params.delete("success");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const isError = !!errorText;

  return (
    <div
      className={`mx-auto mt-4 flex max-w-[1600px] items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      }`}
      role={isError ? "alert" : "status"}
    >
      <span className="leading-snug">{errorText || successText}</span>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-md border border-current/30 px-2 py-0.5 text-xs uppercase tracking-wide transition-colors hover:bg-current/10"
      >
        {t("dashboard.close")}
      </button>
    </div>
  );
}
