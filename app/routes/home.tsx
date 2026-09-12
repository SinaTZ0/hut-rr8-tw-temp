import type { Route } from "./+types/home";

import { AchievementsSection, EventsSection } from "../components/home/CardSections";
import { CalendarSection } from "../components/home/CalendarSection";
import { CampusStorySection } from "../components/home/CampusStorySection";
import { CallToActionSection } from "../components/home/CallToActionSection";
import { ContactServicesSection } from "../components/home/ContactServicesSection";
import { FloatingLinks } from "../components/home/FloatingLinks";
import { FooterSection } from "../components/home/FooterSection";
import { Header } from "../components/home/Header";
import { HeroSection } from "../components/home/HeroSection";
import { NewsSection } from "../components/home/NewsSection";
import { QuickAccessSection } from "../components/home/QuickAccessSection";
import { WebsiteStatsSection } from "../components/home/WebsiteStatsSection";
import { styles } from "../components/home/common";
import { recordHomepageVisit } from "../lib/website-stats.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "دانشگاه صنعتی همدان" },
    {
      name: "description",
      content: "وب‌سایت دانشگاه صنعتی همدان؛ اخبار، اطلاعیه‌ها، آموزش، پژوهش و خدمات دانشجویی",
    },
    { name: "theme-color", content: "#073b4c" },
  ];
}

export function headers() {
  return {
    "Cache-Control": "no-store",
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    return { stats: await recordHomepageVisit(request) };
  } catch (error) {
    console.error("Website statistics update failed", error);
    return { stats: null };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className={styles["hut-modern"]} id="hutModernPage">
      <a className={styles["hut-skip-link"]} href="#hut-main">
        پرش به محتوای اصلی
      </a>

      <Header />

      <main id="hut-main">
        <HeroSection />
        <QuickAccessSection />
        <NewsSection />
        <CalendarSection />
        <ContactServicesSection />
        <CampusStorySection />
        <AchievementsSection />
        <EventsSection />
        <CallToActionSection />
        <WebsiteStatsSection stats={loaderData.stats} />
      </main>

      <FloatingLinks />
      <FooterSection />
    </div>
  );
}
