import type { Route } from "./+types/home";

import { AchievementsSection, EventsSection } from "../components/home/CardSections";
import { CalendarSection } from "../components/home/CalendarSection";
import { CampusStorySection } from "../components/home/CampusStorySection";
import { CallToActionSection } from "../components/home/CallToActionSection";
import { FloatingLinks } from "../components/home/FloatingLinks";
import { FooterSection } from "../components/home/FooterSection";
import { Header } from "../components/home/Header";
import { HeroSection } from "../components/home/HeroSection";
import { NewsSection } from "../components/home/NewsSection";
import { QuickAccessSection } from "../components/home/QuickAccessSection";
import { styles } from "../components/home/common";

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

export default function Home() {
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
        <CampusStorySection />
        <AchievementsSection />
        <EventsSection />
        <CallToActionSection />
      </main>

      <FloatingLinks />
      <FooterSection />
    </div>
  );
}
