import type { Route } from "./+types/privacy-and-data-protection";

import { FloatingLinks } from "../components/home/FloatingLinks";
import { FooterSection } from "../components/home/FooterSection";
import { Header } from "../components/home/Header";
import { cx, styles as homeStyles } from "../components/home/common";
import pageStyles from "../privacy-and-data-protection.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "حریم خصوصی و حفاظت از داده‌ها | دانشگاه صنعتی همدان" },
    {
      name: "description",
      content: "بیانیه صیانت از داده‌ها و حفاظت از حریم خصوصی کاربران دانشگاه صنعتی همدان",
    },
  ];
}

export default function PrivacyAndDataProtection() {
  return (
    <div className={cx(homeStyles["hut-modern"], pageStyles.page)} id="hutModernPage">
      <a className={homeStyles["hut-skip-link"]} href="#hut-privacy-main">
        پرش به محتوای اصلی
      </a>

      <Header />

      <main id="hut-privacy-main">
        <section className={pageStyles.hero} aria-labelledby="privacyPageTitle">
          <div className={cx(homeStyles["hut-container"], pageStyles.heroInner)}>
            <div className={pageStyles.heroCopy}>
              <span className={homeStyles["hut-eyebrow"]}>حقوق کاربران</span>
              <h1 id="privacyPageTitle">بیانیه صیانت از داده‌ها و حفاظت از حریم خصوصی کاربران</h1>
              <p>
                چارچوب و خط‌مشی دانشگاه صنعتی همدان در زمینه گردآوری، بهره‌برداری و صیانت از اطلاعات کاربران.
              </p>
            </div>
            <div className={pageStyles.heroSeal} aria-hidden="true">
              <span>HUT</span>
              <strong>حریم خصوصی</strong>
            </div>
          </div>
        </section>

        <section className={pageStyles.main} aria-labelledby="privacyContentTitle">
          <div className={homeStyles["hut-container"]}>
            <article className={pageStyles.article}>
              <header className={pageStyles.articleHeader}>
                <span className={homeStyles["hut-eyebrow"]}>بیانیه رسمی دانشگاه</span>
                <h2 id="privacyContentTitle">صیانت از اطلاعات کاربران</h2>
              </header>

              <div className={pageStyles.intro}>
                <p>
                  دانشگاه صنعتی همدان در راستای شفاف‌سازی و ارج نهادن به حقوق مراجعان، چارچوب و خط‌مشی‌های حاکم بر
                  نحوه گردآوری، بهره‌برداری و صیانت از اطلاعات کاربران تارگاه (وبگاه) رسمی خود را به شرح این بیانیه
                  اعلام می‌دارد.
                </p>
                <p>
                  این دانشگاه متعهد به حفظ محرمانگی و حریم شخصی مراجعان است. چنانچه در طول فرآیند استفاده از خدمات
                  این سامانه، اطلاعاتی هویتی به‌منظور ارائه خدمات مطلوب‌تر، تسهیل فرآیندها یا سنجش میزان رضایت کاربران
                  اخذ گردد، اطمینان داده می‌شود که این اطلاعات صرفاً منطبق با اصول و تعهدات مصرح در این سند مورد
                  بهره‌برداری قرار خواهد گرفت. همچنین دانشگاه صنعتی همدان با اتکا به استانداردهای امنیتی، زیرساخت‌های
                  فنی پیشرفته و پروتکل‌های حفاظتی، تدابیر لازم را جهت مقابله با هرگونه اقدام مجرمانه، دسترسی غیرمجاز
                  یا رویدادهای غیرمترقبه خارج از حیطه اختیارات سازمان، اتخاذ نموده است.
                </p>
              </div>

              <div className={pageStyles.rule} />

              <div className={pageStyles.sections}>
                <section className={pageStyles.policySection} aria-labelledby="legalBasisTitle">
                  <div className={pageStyles.sectionHeading}>
                    <span className={pageStyles.sectionNumber} aria-hidden="true">
                      ۱
                    </span>
                    <h2 id="legalBasisTitle">استناد قانونی</h2>
                  </div>
                  <p>
                    به استناد ماده ۷ مصوبه شماره ۱۱۲۷۱۲۸ شورای عالی اداری مورخ ۱۳۹۵/۱۲/۲۸، دانشگاه صنعتی همدان خود
                    را متعهد و ملزم به رعایت کامل حریم خصوصی کلیه مراجعان و کاربران دانسته و فرآیند جمع‌آوری اطلاعات
                    را صرفاً به میزان مورد نیاز برای ارائه خدمات مورد نظر محدود ساخته است؛ لذا هرگونه انتشار یا واگذاری
                    این داده‌ها به اشخاص غیرمرتبط اکیداً منع می‌گردد.
                  </p>
                </section>

                <section className={pageStyles.policySection} aria-labelledby="dataMinimizationTitle">
                  <div className={pageStyles.sectionHeading}>
                    <span className={pageStyles.sectionNumber} aria-hidden="true">
                      ۲
                    </span>
                    <h2 id="dataMinimizationTitle">اصل کمینه‌سازی داده‌ها (جمع‌آوری حداقل اطلاعات)</h2>
                  </div>
                  <p>
                    تارگاه رسمی دانشگاه صنعتی همدان صرفاً اطلاعات پایه‌ای و ضروری را که جهت ارائه خدمات الکترونیکی،
                    آموزشی، پژوهشی و اداری کاربران لازم است، گردآوری می‌نماید و از دریافت اطلاعات غیرضروری اجتناب
                    می‌ورزد.
                  </p>
                </section>

                <section className={pageStyles.policySection} aria-labelledby="securityTitle">
                  <div className={pageStyles.sectionHeading}>
                    <span className={pageStyles.sectionNumber} aria-hidden="true">
                      ۳
                    </span>
                    <h2 id="securityTitle">امنیت و محرمانگی داده‌ها</h2>
                  </div>
                  <p>
                    دانشگاه صنعتی همدان بر تعهد سازمانی خود مبنی بر حفظ و صیانت از اطلاعات کاربران تأکید می‌ورزد.
                    داده‌های شخصی کاربران تحت هیچ شرایطی در اختیار اشخاص ثالث (اعم از حقیقی یا حقوقی) قرار نخواهد گرفت،
                    مگر در مواردی که به‌موجب احکام صادره از سوی مراجع ذی‌صلاح قضایی و قانونی، الزام رسمی وجود داشته
                    باشد. علاوه بر این، تمهیدات امنیتی و لایه‌های حفاظتی استاندارد به‌منظور پیشگیری از دسترسی غیرمجاز،
                    تخریب، افشا، تغییر و بهره‌برداری ناروا از داده‌ها اعمال شده است.
                  </p>
                </section>

                <section className={pageStyles.policySection} aria-labelledby="updatesTitle">
                  <div className={pageStyles.sectionHeading}>
                    <span className={pageStyles.sectionNumber} aria-hidden="true">
                      ۴
                    </span>
                    <h2 id="updatesTitle">به‌روزرسانی بیانیه</h2>
                  </div>
                  <p>
                    دانشگاه صنعتی همدان حق بازنگری، اصلاح یا به‌روزرسانی این بیانیه را بر اساس تغییرات سازمانی، ارتقای
                    سامانه‌ها یا قوانین مصوب، برای خود محفوظ می‌دارد. از مراجعان و مخاطبان گرامی تقاضا می‌شود به‌منظور
                    آگاهی از آخرین تغییرات در خط‌مشی‌های حفاظتی این مرکز، مفاد این صفحه را به‌صورت دوره‌ای مطالعه
                    فرمایند.
                  </p>
                </section>

                <section className={pageStyles.policySection} aria-labelledby="externalLinksTitle">
                  <div className={pageStyles.sectionHeading}>
                    <span className={pageStyles.sectionNumber} aria-hidden="true">
                      ۵
                    </span>
                    <h2 id="externalLinksTitle">پیوند به سایر پایگاه‌های اینترنتی</h2>
                  </div>
                  <p>
                    این وبگاه ممکن است شامل پیوندهایی (لینک‌هایی) به سایر درگاه‌های الکترونیکی باشد. با خروج کاربر از
                    وبگاه دانشگاه صنعتی همدان، کنترل فنی و حقوقی این دانشگاه بر تارنماهای مقصد سلب می‌گردد؛ بنابراین،
                    دانشگاه هیچ‌گونه مسئولیتی در قبال سیاست‌های حریم خصوصی و محتوای این قبیل سامانه‌ها نداشته و پیشنهاد
                    می‌شود کاربران پیش از استفاده، بیانیه حریم خصوصی پایگاه‌های مذکور را مطالعه نمایند.
                  </p>
                </section>

                <section className={pageStyles.policySection} aria-labelledby="contactTitle">
                  <div className={pageStyles.sectionHeading}>
                    <span className={pageStyles.sectionNumber} aria-hidden="true">
                      ۶
                    </span>
                    <h2 id="contactTitle">ارتباط با دانشگاه</h2>
                  </div>
                  <p>
                    در صورت وجود هرگونه پرسش، ابهام، نظر یا گزارش پیرامون مفاد این بیانیه، کاربران محترم می‌توانند از
                    طریق مجاری ارتباطی مندرج در بخش «تماس با ما» در پورتال دانشگاه صنعتی همدان، با مسئولین مربوطه در
                    ارتباط باشند.
                  </p>
                </section>
              </div>
            </article>
          </div>
        </section>
      </main>

      <FloatingLinks />
      <FooterSection />
    </div>
  );
}
