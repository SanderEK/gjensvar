/**
 * Bakgrunn med dot-grid pattern + subtile fargete glows.
 * Brukes på login-siden og dashbordet for å gi en konsistent premium-estetikk.
 *
 * - Dot-grid fader ut mot kantene via radial mask.
 * - To svake gradient-blobs (blå og lilla) gir liv uten å konkurrere
 *   med innholdet.
 * - Fungerer både i lys og mørk modus; intensiteten justeres via opacity.
 */
export function AmbientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Dot-grid */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "28px 28px",
          color: "rgba(255,255,255,0.9)",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 80%)",
        }}
      />
      {/* Lys variant av dot-grid (mørke prikker mot lys bakgrunn) */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.6) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 80%)",
        }}
      />
      {/* Mykt blått glow øverst */}
      <div className="absolute -top-48 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[160px] dark:bg-blue-500/20" />
      {/* Lilla glow nede til venstre */}
      <div className="absolute -bottom-48 left-0 h-[500px] w-[700px] rounded-full bg-purple-500/10 blur-[140px] dark:bg-purple-600/15" />
    </div>
  );
}
