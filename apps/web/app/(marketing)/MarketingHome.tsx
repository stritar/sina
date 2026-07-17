import "./wireframe.css";
import { IndustryProvider } from "./landing/IndustryContext";
import { LandingNav } from "./landing/LandingNav";
import { Hero } from "./landing/Hero";
import { EmulatorSection } from "./landing/EmulatorSection";
import { HowItWorks } from "./landing/HowItWorks";
import { WhySina } from "./landing/WhySina";
import { Pitch } from "./landing/Pitch";
import { FinalCta } from "./landing/FinalCta";
import { Footer } from "./landing/Footer";

/**
 * The Phase 9 landing, shared by `/` (English) and `/[lang]` (the five
 * translated home routes render this same component via app/[...path], so the
 * export name and `{ locale }` signature are load-bearing). Copy is inline
 * English for the wireframe pass; the fidelity pass moves it to the catalogs.
 *
 * The `.sina-wireframe` marker scopes the black/gray/white token override
 * (wireframe.css). It lives HERE, not in the (marketing) layout, because the
 * locale home routes bypass that layout entirely.
 */
export function MarketingHome({ locale }: { locale: string }) {
  return (
    <div className="sina-wireframe">
      <IndustryProvider>
        <LandingNav locale={locale} />
        <main id="main">
          <Hero locale={locale} />
          <EmulatorSection />
          <HowItWorks />
          <WhySina />
          <Pitch />
          <FinalCta locale={locale} />
        </main>
        <Footer locale={locale} />
      </IndustryProvider>
    </div>
  );
}
