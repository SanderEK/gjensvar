"use client";

export function ConnectTikTokButton() {
  return (
    <a
      href="/api/auth/tiktok"
      className="inline-flex w-full items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.51 6.27 6.27 0 0 0 6.26-6.26V8.55a8.16 8.16 0 0 0 3.84.96V6.09a4.84 4.84 0 0 1 0 .6Z" />
      </svg>
      Koble til TikTok
    </a>
  );
}
