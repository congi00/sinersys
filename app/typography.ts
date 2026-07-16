/**
 * typography.ts — Sistema tipografico condiviso Sinersys
 *
 * Fonte di verità per tutti i breakpoint e le scale di testo del sito.
 * Importare da ogni componente che usa testi hero, titoli, sottotitoli o link.
 *
 * Breakpoints Tailwind v4 (default):
 *   xs  → < 480px   (piccoli telefoni: iPhone SE, Galaxy A03)
 *   sm  → ≥ 640px   (telefoni grandi, paesaggio)
 *   md  → ≥ 768px   (tablet portrait)
 *   lg  → ≥ 1024px  (tablet landscape, laptop piccolo)
 *   xl  → ≥ 1280px  (desktop medio)
 *   2xl → ≥ 1536px  (desktop grande)
 *
 * Convenzione classi Tailwind usate nel progetto:
 *   - Tailwind v4 con @tailwindcss/postcss
 *   - Nessun tailwind.config.js — le classi usate devono essere presenti nel DOM
 */

// ─── SUPTITLE (etichette uppercase sopra ai titoli) ───────────────────────────
// Esempio: "TECNOLOGIA APWEC", "CHI SIAMO", "FAQ", "Laboratorio di Ricerca"
// Stile corrente in HomeClient: text-m sm:text-2xl tracking-widest uppercase
// Problema: "text-m" non è una classe Tailwind standard. Rimpiazzare con text-xs.
export const SUPTITLE_CLASS = "text-xs sm:text-sm xl:text-xl tracking-widest uppercase";

// ─── HERO TITLE H1 ────────────────────────────────────────────────────────────
// Slide 0 e Slide 2 della home, hero delle pagine interne.
// Stile corrente: text-3xl sm:text-6xl tracking-wide font-bold
// Problema: su telefoni piccoli (360px) "text-3xl" = 1.875rem è già stretto
// per titoli multi-riga. Si aggiunge un clamp xs intermedio.
export const HERO_TITLE_CLASS = "text-2xl xs:text-3xl sm:text-5xl lg:text-6xl tracking-wide font-bold";

export const PRODUCT_TITLE_CARD= "text-lg xs:text-xl sm:text-2xl lg:text-3xl tracking-wide font-bold uppercase";

// ─── HERO SUBTITLE ────────────────────────────────────────────────────────────
// Sottotitolo sotto ai titoli hero (corpo descrittivo, font-light)
// Stile corrente: text-lg sm:text-xl font-light
// Nessun problema critico, ma uniformiamo il line-height
export const HERO_SUBTITLE_CLASS = "text-base sm:text-lg lg:text-xl font-light leading-relaxed";

// ─── BODY TEXT ────────────────────────────────────────────────────────────────
// Testo corpo nelle sezioni scrollabili (ApwecPage, SixPhasePage, AboutUsPage)
export const BODY_TEXT_CLASS = "text-sm sm:text-base lg:text-lg font-light leading-relaxed";

// ─── CARD TITLE H3 ────────────────────────────────────────────────────────────
// Titoli nelle card prodotto, FAQ, ScatteredCards
// Stile corrente: text-2xl sm:text-4xl font-bold
export const CARD_TITLE_CLASS = "text-3xl sm:text-4xl lg:text-5xl font-bold font-stretch-extra-expanded uppercase";

// ─── CARD SUBTITLE H3 ────────────────────────────────────────────────────────────
// Titoli nelle card prodotto, FAQ, ScatteredCards
// Stile corrente: text-2xl sm:text-4xl font-bold
export const CARD_SUBTITLE_CLASS = "text-xl sm:text-2xl lg:text-2xl font-bold font-stretch-extra-expanded";

// ─── FAQ QUESTION ─────────────────────────────────────────────────────────────
// Domanda accordion FAQ
// Stile corrente: text-lg sm:text-2xl — su mobile è già grande, ok da scalare
export const FAQ_QUESTION_CLASS = "text-lg sm:text-xl lg:text-2xl font-regular leading-snug";


export const CONTACT_TITLE_CLASS = "text-2xl xs:text-2xl sm:text-3xl lg:text-4xl tracking-wide font-bold";


export const PRODUCT_CONTENT_CLASS = "text-base xs:text-lg sm:text-lg lg:text-xl tracking-wide font-bold font-light";






// ─── SECTION TITLE H2 ─────────────────────────────────────────────────────────
// Titoli di sezione all'interno delle pagine (HowItWorks, SixPhase, AboutUs…)
// Stile corrente: text-3xl sm:text-6xl tracking-wide font-bold
export const SECTION_TITLE_CLASS = "text-2xl xs:text-3xl sm:text-5xl lg:text-6xl tracking-wide font-bold";



// ─── FAQ ANSWER ───────────────────────────────────────────────────────────────
// Risposta accordion FAQ
// Stile corrente: text-base sm:text-xl
export const FAQ_ANSWER_CLASS = "text-sm sm:text-base lg:text-lg font-light leading-relaxed";

// ─── LINK BUTTON TEXT ─────────────────────────────────────────────────────────
// Testo dentro LinkButton (il pill animato)
// Problema principale: su mobile con testi lunghi (es. FR "Comment ça fonctionne"
// = 21 chars) il testo va a capo dentro l'h-16 pill.
// Soluzione: ridurre la size su mobile, aggiungere whitespace-nowrap,
// permettere al pill di crescere in larghezza.
export const LINK_BUTTON_TEXT_CLASS = "text-base sm:text-lg lg:text-xl font-medium whitespace-nowrap";

// ─── FOOTER HEADING ───────────────────────────────────────────────────────────
// Intestazioni colonne footer
export const FOOTER_HEADING_CLASS = "text-base sm:text-lg font-bold";

// ─── FOOTER LINK ──────────────────────────────────────────────────────────────
// Link nel footer
export const FOOTER_LINK_CLASS = "text-sm sm:text-sm font-normal";

// ─── LINE-HEIGHT UTILITIES ────────────────────────────────────────────────────
// Valori standard da usare negli style={{ }} dove Tailwind non copre
export const LINE_HEIGHT = {
  tight:   "1.05",
  snug:    "1.15",
  normal:  "1.4",
  relaxed: "1.65",
} as const;

// ─── SECTION PADDING ─────────────────────────────────────────────────────────
// Padding orizzontale standard per le sezioni scrollabili
// (non cambia il layout — solo uniforma i margini laterali)
export const SECTION_PADDING_X = "px-5 sm:px-8 lg:px-16 xl:px-24";

// ─── NOTE PER GLI SVILUPPATORI ───────────────────────────────────────────────
//
// 2. "sm:whitespace-pre-line" nei titoli hero: rimuovere o mantenere
//    SOLO se il testo di traduzione contiene \n intenzionali.
//    Non usare mai whitespace-pre-line senza controllare tutte e 4 le lingue.
//
// 3. Per il LinkButton il fix principale è nel componente stesso:
//    - rimuovere "h-16" fisso → sostituire con min-h-[4rem] py-4
//    - aggiungere whitespace-nowrap al testo
//    - lasciare che il padding-right si adatti al contenuto
//
// 4. clamp() inline rimane valido per i componenti fixed/animated
//    (SixPhaseEngine, LegalPage) dove Tailwind non raggiunge.
//    Usare i valori di riferimento:
//      suptitle:  clamp(0.65rem, 1.2vw, 0.75rem)
//      title:     clamp(1.6rem, 4.5vw, 4rem)
//      subtitle:  clamp(0.9rem, 1.4vw, 1.1rem)
