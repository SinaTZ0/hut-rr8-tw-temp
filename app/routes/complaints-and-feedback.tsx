import { zodResolver } from "@hookform/resolvers/zod";
import type { AltchaWidgetElement } from "altcha/types/generic";
import type { Route } from "./+types/complaints-and-feedback";
import { useEffect, useRef, useState } from "react";
import { data, useFetcher, useRevalidator } from "react-router";
import type {} from "altcha/types/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FloatingLinks } from "../components/home/FloatingLinks";
import { FooterSection } from "../components/home/FooterSection";
import { Header } from "../components/home/Header";
import { cx, Icon, styles as homeStyles } from "../components/home/common";
import pageStyles from "../complaints-and-feedback.module.css";
import {
  complaintActionSchema,
  complaintFormSchema,
  departmentOptions,
  feedbackTypeOptions,
  type ComplaintActionResult,
  type ComplaintFieldErrors,
  type ComplaintFieldName,
  type ComplaintFormValues,
} from "../lib/complaints";
import {
  createComplaintChallenge,
  insertComplaintSubmission,
  verifyComplaintChallenge,
} from "../lib/complaints.server";

const defaultValues = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  studentId: "",
  department: "",
  feedbackType: "",
  message: "",
} as unknown as ComplaintFormValues;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ثبت شکایات و پیشنهادات | دانشگاه صنعتی همدان" },
    {
      name: "description",
      content: "ثبت شکایات، پیشنهادات و انتقادات در دانشگاه صنعتی همدان",
    },
  ];
}

export function headers() {
  return {
    "Cache-Control": "no-store",
  };
}

export async function loader(_: Route.LoaderArgs) {
  return { challenge: await createComplaintChallenge() };
}

function formDataToRecord(formData: FormData) {
  const record: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    record[key] = typeof value === "string" ? value : "";
  }

  return record;
}

function fieldErrorsFromZod(error: z.ZodError) {
  const errors: ComplaintFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && field !== "altcha" && field !== "website") {
      const fieldName = field as ComplaintFieldName;
      if (!errors[fieldName]) errors[fieldName] = issue.message;
    }
  }

  return errors;
}

export async function action({ request }: Route.ActionArgs) {
  const values = formDataToRecord(await request.formData());
  const parsed = complaintActionSchema.safeParse(values);

  if (!parsed.success) {
    return data<ComplaintActionResult>(
      { ok: false, errors: fieldErrorsFromZod(parsed.error), formError: "لطفاً اطلاعات فرم را بررسی کنید." },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return data<ComplaintActionResult>({ ok: false, formError: "ارسال درخواست امکان‌پذیر نیست." }, { status: 400 });
  }

  if (!(await verifyComplaintChallenge(parsed.data.altcha))) {
    return data<ComplaintActionResult>(
      { ok: false, formError: "تأیید امنیتی ناموفق بود. دوباره تلاش کنید." },
      { status: 400 },
    );
  }

  try {
    const trackingCode = await insertComplaintSubmission(parsed.data);
    return data<ComplaintActionResult>({ ok: true, trackingCode }, { status: 201 });
  } catch (error) {
    console.error("Complaint submission failed", error);
    return data<ComplaintActionResult>(
      { ok: false, formError: "ثبت درخواست انجام نشد. لطفاً چند لحظه بعد دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span className={pageStyles.fieldError} id={`${id}-error`} role="alert">
      {message}
    </span>
  ) : null;
}

function OptionalLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <>
      {children}{" "}
      {required ? (
        <span className={pageStyles.required}>*</span>
      ) : (
        <span className={pageStyles.optional}>(اختیاری)</span>
      )}
    </>
  );
}

function SuccessCard({ trackingCode, onNewSubmission }: { trackingCode: string; onNewSubmission: () => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyTrackingCode() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(trackingCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = trackingCode;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section className={pageStyles.successCard} aria-labelledby="feedbackSuccessTitle">
      <div className={pageStyles.successContent}>
        <span className={pageStyles.successMark} aria-hidden="true">
          ✓
        </span>
        <h2 id="feedbackSuccessTitle">درخواست شما با موفقیت ثبت شد</h2>
        <p>از همراهی شما سپاسگزاریم. کد پیگیری درخواست خود را برای پیگیری‌های بعدی نگه دارید.</p>
        <span className={pageStyles.trackingLabel}>کد پیگیری</span>
        <div className={pageStyles.trackingRow}>
          <code className={pageStyles.trackingCode} dir="ltr">
            {trackingCode}
          </code>
          <button className={pageStyles.copyButton} type="button" onClick={copyTrackingCode}>
            {copyState === "copied" ? "کپی شد" : copyState === "failed" ? "کپی نشد" : "کپی کد"}
          </button>
        </div>
        <div className={pageStyles.successActions}>
          <a className={cx(homeStyles["hut-button"], homeStyles["hut-button--light"])} href="/">
            بازگشت به صفحه اصلی
          </a>
          <button
            className={cx(homeStyles["hut-button"], homeStyles["hut-button--teal"])}
            type="button"
            onClick={onNewSubmission}
          >
            ثبت درخواست جدید
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ComplaintsAndFeedback({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<ComplaintActionResult>();
  const revalidator = useRevalidator();
  const formRef = useRef<HTMLFormElement>(null);
  const altchaRef = useRef<AltchaWidgetElement | null>(null);
  const verifiedCaptchaPayloadRef = useRef<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [captchaBusy, setCaptchaBusy] = useState(false);
  const [captchaStatus, setCaptchaStatus] = useState<"idle" | "verifying" | "verified">("idle");
  const [captchaError, setCaptchaError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    let cancelled = false;
    let widget: AltchaWidgetElement | null = null;

    const handleCaptchaStateChange = (event: Event) => {
      const detail = (event as CustomEvent<{ payload?: string; state?: string }>).detail;

      if (detail.state === "verifying") {
        setCaptchaStatus("verifying");
        setCaptchaError(undefined);
        return;
      }

      if (detail.state === "verified") {
        if (detail.payload) verifiedCaptchaPayloadRef.current = detail.payload;
        setCaptchaStatus("verified");
        setCaptchaError(undefined);
        return;
      }

      if (detail.state === "unverified" || detail.state === "expired" || detail.state === "error") {
        verifiedCaptchaPayloadRef.current = null;
        setCaptchaStatus("idle");
      }
    };

    void import("altcha/i18n/fa")
      .then(() => import("altcha"))
      .then(() => {
        if (cancelled) return;
        widget = altchaRef.current;
        widget?.addEventListener("statechange", handleCaptchaStateChange);
      });

    return () => {
      cancelled = true;
      widget?.removeEventListener("statechange", handleCaptchaStateChange);
    };
  }, []);

  useEffect(() => {
    const result = fetcher.data;
    if (!result) return;

    if (result.ok) {
      setConfirmed(true);
      verifiedCaptchaPayloadRef.current = null;
      setCaptchaStatus("idle");
      setCaptchaError(undefined);
      setFormError(undefined);
      reset(defaultValues);
      return;
    }

    setFormError(result.formError);
    for (const [field, message] of Object.entries(result.errors ?? {})) {
      setError(field as ComplaintFieldName, { message });
    }
    verifiedCaptchaPayloadRef.current = null;
    setCaptchaStatus("idle");
    altchaRef.current?.reset();
    revalidator.revalidate();
  }, [fetcher.data, revalidator, reset, setError]);

  const onSubmit = handleSubmit(async () => {
    const form = formRef.current;
    const widget = altchaRef.current;

    setCaptchaError(undefined);
    setFormError(undefined);

    if (!form || !widget) {
      setCaptchaError("تأیید امنیتی در دسترس نیست. صفحه را دوباره بارگذاری کنید.");
      return;
    }

    const widgetState = widget.getState();

    if (widgetState === "verifying") {
      setCaptchaStatus("verifying");
      setCaptchaError("تأیید امنیتی در حال انجام است؛ لطفاً صبر کنید.");
      return;
    }

    let captchaPayload = verifiedCaptchaPayloadRef.current;

    if (widgetState !== "verified") {
      captchaPayload = null;
      verifiedCaptchaPayloadRef.current = null;
    }

    if (!captchaPayload && widgetState === "verified") {
      const existingPayload = new FormData(form).get("altcha");
      if (typeof existingPayload === "string" && existingPayload) {
        captchaPayload = existingPayload;
        verifiedCaptchaPayloadRef.current = existingPayload;
      }
    }

    if (!captchaPayload) {
      setCaptchaBusy(true);
      setCaptchaStatus("verifying");

      try {
        const result = await widget.verify();
        if (!result?.payload) {
          setCaptchaStatus("idle");
          setCaptchaError("لطفاً تأیید امنیتی را کامل کنید.");
          return;
        }

        captchaPayload = result.payload;
        verifiedCaptchaPayloadRef.current = result.payload;
        setCaptchaStatus("verified");
      } catch {
        setCaptchaStatus("idle");
        setCaptchaError("تأیید امنیتی انجام نشد. دوباره تلاش کنید.");
      } finally {
        setCaptchaBusy(false);
      }
    }

    if (!captchaPayload) return;

    const formData = new FormData(form);
    formData.set("altcha", captchaPayload);
    fetcher.submit(formData, { method: "post" });
  });

  function startNewSubmission() {
    fetcher.reset();
    reset(defaultValues);
    verifiedCaptchaPayloadRef.current = null;
    setConfirmed(false);
    setCaptchaStatus("idle");
    setCaptchaError(undefined);
    setFormError(undefined);
    revalidator.revalidate();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isCaptchaVerifying = captchaBusy || captchaStatus === "verifying";
  const isSubmitting = isCaptchaVerifying || fetcher.state !== "idle";
  const submitLabel = isCaptchaVerifying
    ? "در حال بررسی امنیتی…"
    : fetcher.state !== "idle"
      ? "در حال ثبت درخواست…"
      : "ثبت و ارسال پیام";
  const challenge = JSON.stringify(loaderData.challenge);

  return (
    <div className={cx(homeStyles["hut-modern"], pageStyles.page)} id="hutModernPage">
      <a className={homeStyles["hut-skip-link"]} href="#hut-feedback-main">
        پرش به محتوای اصلی
      </a>

      <Header />

      <main id="hut-feedback-main">
        <section className={pageStyles.hero} aria-labelledby="feedbackPageTitle">
          <div className={cx(homeStyles["hut-container"], pageStyles.heroInner)}>
            <div className={pageStyles.heroCopy}>
              <span className={homeStyles["hut-eyebrow"]}>سامانه ارتباط با دانشگاه</span>
              <h1 id="feedbackPageTitle">ثبت شکایات و پیشنهادات</h1>
              <p className={pageStyles.heroLead}>
                دیدگاه‌ها و تجربه‌های خود را با ما در میان بگذارید تا برای بهبود خدمات دانشگاه بررسی و پیگیری شود.
              </p>
            </div>
          </div>
        </section>

        <section className={pageStyles.main} aria-labelledby="feedbackFormSectionTitle">
          <div className={homeStyles["hut-container"]}>
            <div className={pageStyles.sectionHeading}>
              <div>
                <span className={homeStyles["hut-eyebrow"]}>فرم ارتباط</span>
                <h2 id="feedbackFormSectionTitle">پیام خود را ثبت کنید</h2>
                <p>لطفاً اطلاعات زیر را با دقت وارد کنید. موارد ستاره‌دار الزامی هستند.</p>
              </div>
            </div>

            <div className={pageStyles.layout}>
              {confirmed && fetcher.data?.ok ? (
                <SuccessCard trackingCode={fetcher.data.trackingCode} onNewSubmission={startNewSubmission} />
              ) : (
                <div className={pageStyles.formCard}>
                  <div className={pageStyles.formHeader}>
                    <h2>مشخصات درخواست</h2>
                    <p>اطلاعات تماس اختیاری است، اما در صورت درج می‌تواند به پیگیری بهتر کمک کند.</p>
                  </div>

                  <form ref={formRef} method="post" noValidate onSubmit={onSubmit}>
                    <input
                      className={pageStyles.honeypot}
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <div className={pageStyles.formGrid}>
                      <div className={pageStyles.field}>
                        <label htmlFor="firstName">
                          <OptionalLabel required>نام</OptionalLabel>
                        </label>
                        <input
                          className={pageStyles.control}
                          id="firstName"
                          autoComplete="given-name"
                          aria-invalid={Boolean(errors.firstName)}
                          aria-describedby={errors.firstName ? "firstName-error" : undefined}
                          {...register("firstName")}
                        />
                        <FieldError id="firstName" message={errors.firstName?.message} />
                      </div>

                      <div className={pageStyles.field}>
                        <label htmlFor="lastName">
                          <OptionalLabel>نام خانوادگی</OptionalLabel>
                        </label>
                        <input
                          className={pageStyles.control}
                          id="lastName"
                          autoComplete="family-name"
                          {...register("lastName")}
                        />
                        <FieldError id="lastName" message={errors.lastName?.message} />
                      </div>

                      <div className={pageStyles.field}>
                        <label htmlFor="mobile">
                          <OptionalLabel>شماره همراه</OptionalLabel>
                        </label>
                        <input
                          className={cx(pageStyles.control, pageStyles.ltrControl)}
                          id="mobile"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          dir="ltr"
                          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                          aria-invalid={Boolean(errors.mobile)}
                          aria-describedby={errors.mobile ? "mobile-error" : undefined}
                          {...register("mobile")}
                        />
                        <FieldError id="mobile" message={errors.mobile?.message} />
                      </div>

                      <div className={pageStyles.field}>
                        <label htmlFor="email">
                          <OptionalLabel>ایمیل</OptionalLabel>
                        </label>
                        <input
                          className={cx(pageStyles.control, pageStyles.ltrControl)}
                          id="email"
                          type="email"
                          autoComplete="email"
                          dir="ltr"
                          placeholder="example@hut.ac.ir"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          {...register("email")}
                        />
                        <FieldError id="email" message={errors.email?.message} />
                      </div>

                      <div className={pageStyles.field}>
                        <label htmlFor="studentId">
                          <OptionalLabel>شماره دانشجویی</OptionalLabel>
                        </label>
                        <input
                          className={cx(pageStyles.control, pageStyles.ltrControl)}
                          id="studentId"
                          inputMode="numeric"
                          autoComplete="off"
                          dir="ltr"
                          aria-invalid={Boolean(errors.studentId)}
                          aria-describedby={errors.studentId ? "studentId-error" : undefined}
                          {...register("studentId")}
                        />
                        <FieldError id="studentId" message={errors.studentId?.message} />
                      </div>

                      <div className={pageStyles.field}>
                        <label htmlFor="department">
                          <OptionalLabel required>واحد یا مسئول مرتبط</OptionalLabel>
                        </label>
                        <div className={pageStyles.selectWrap}>
                          <select
                            className={cx(pageStyles.control, pageStyles.selectControl)}
                            id="department"
                            aria-invalid={Boolean(errors.department)}
                            aria-describedby={errors.department ? "department-error" : undefined}
                            {...register("department")}
                          >
                            <option value="">انتخاب کنید</option>
                            {departmentOptions.map((department) => (
                              <option key={department} value={department}>
                                {department}
                              </option>
                            ))}
                          </select>
                          <Icon name="chevron" className={pageStyles.selectChevron} />
                        </div>
                        <FieldError id="department" message={errors.department?.message} />
                      </div>

                      <div className={pageStyles.field}>
                        <label htmlFor="feedbackType">
                          <OptionalLabel required>نوع پیام</OptionalLabel>
                        </label>
                        <div className={pageStyles.selectWrap}>
                          <select
                            className={cx(pageStyles.control, pageStyles.selectControl)}
                            id="feedbackType"
                            aria-invalid={Boolean(errors.feedbackType)}
                            aria-describedby={errors.feedbackType ? "feedbackType-error" : undefined}
                            {...register("feedbackType")}
                          >
                            <option value="">انتخاب کنید</option>
                            {feedbackTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <Icon name="chevron" className={pageStyles.selectChevron} />
                        </div>
                        <FieldError id="feedbackType" message={errors.feedbackType?.message} />
                      </div>
                    </div>

                    <div className={pageStyles.fullField}>
                      <label htmlFor="message">
                        <OptionalLabel required>شرح پیام</OptionalLabel>
                      </label>
                      <textarea
                        className={cx(pageStyles.control, pageStyles.textarea)}
                        id="message"
                        placeholder="شکایت، پیشنهاد یا انتقاد خود را بنویسید…"
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        {...register("message")}
                      />
                      <FieldError id="message" message={errors.message?.message} />
                    </div>

                    <div className={pageStyles.captchaSection}>
                      <div>
                        <span className={pageStyles.captchaTitle}>تأیید امنیتی</span>
                        <p className={pageStyles.captchaDescription}>
                          برای جلوگیری از ارسال خودکار، تأیید امنیتی را کامل کنید.
                        </p>
                      </div>
                      <div>
                        <altcha-widget
                          ref={altchaRef}
                          className={pageStyles.captchaWidget}
                          challenge={challenge}
                          auto="off"
                          display="standard"
                          language="fa"
                          name="altcha"
                          type="switch"
                        />
                        <div className={pageStyles.captchaStatus} aria-live="polite">
                          <span
                            className={pageStyles.captchaStatusIndicator}
                            data-state={captchaStatus}
                            aria-hidden="true"
                          />
                          <span>
                            {captchaStatus === "verifying"
                              ? "در حال بررسی امنیتی… لطفاً صبر کنید."
                              : captchaStatus === "verified"
                                ? "تأیید امنیتی انجام شد."
                                : "برای ادامه، تأیید امنیتی را کامل کنید."}
                          </span>
                        </div>
                        {captchaError ? (
                          <span className={pageStyles.captchaError} role="alert">
                            {captchaError}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {formError ? (
                      <div className={pageStyles.formError} role="alert">
                        {formError}
                      </div>
                    ) : null}

                    <div className={pageStyles.formFooter}>
                      <p className={pageStyles.requiredNote}>* تکمیل این موارد الزامی است.</p>
                      <button
                        className={cx(
                          homeStyles["hut-button"],
                          homeStyles["hut-button--gold"],
                          pageStyles.submitButton,
                        )}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {submitLabel}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <aside className={pageStyles.infoCard} aria-labelledby="feedbackGuideTitle">
                <span className={homeStyles["hut-eyebrow"]}>راهنمای ثبت درخواست</span>
                <h2 id="feedbackGuideTitle">درخواست شما چگونه پیگیری می‌شود؟</h2>
                <p className={pageStyles.infoIntro}>پس از ارسال موفق، کد پیگیری یکتای خود را مشاهده و ذخیره کنید.</p>
                <ol className={pageStyles.steps}>
                  <li>
                    <div>
                      <strong>فرم را کامل کنید</strong>
                      <span>موضوع و واحد مرتبط را انتخاب کنید و شرح روشنی از پیام خود بنویسید.</span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <strong>پیام ارسال می‌شود</strong>
                      <span>درخواست شما در سامانه دانشگاه ثبت و برای بررسی آماده می‌شود.</span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <strong>کد پیگیری را نگه دارید</strong>
                      <span>کد نمایش‌داده‌شده را برای مراجعات بعدی کپی کنید.</span>
                    </div>
                  </li>
                </ol>
                <p className={pageStyles.privacyNote}>
                  اطلاعات شما فقط برای بررسی و پیگیری درخواست ثبت‌شده استفاده می‌شود.
                </p>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <FloatingLinks />
      <FooterSection />
    </div>
  );
}
