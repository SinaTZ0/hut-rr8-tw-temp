import { z } from "zod";

export const genderOptions = [
  { value: "unknown", label: "نامعین" },
  { value: "male", label: "مرد" },
  { value: "female", label: "زن" },
] as const;

export const maritalStatusOptions = [
  { value: "unknown", label: "نامعین" },
  { value: "single", label: "مجرد" },
  { value: "married", label: "متأهل" },
] as const;

export const facultyOptions = [
  { value: "unknown", label: "نامعین" },
  { value: "electrical-computer", label: "برق و کامپیوتر" },
  { value: "technical-engineering", label: "فنی و مهندسی" },
  { value: "basic-sciences", label: "علوم پایه" },
] as const;

export const majorOptions = [
  { value: "unknown", label: "نامعین" },
  { value: "computer", label: "کامپیوتر" },
  { value: "electrical", label: "برق" },
  { value: "industrial", label: "صنایع" },
  { value: "polymer", label: "پلیمر" },
  { value: "civil", label: "عمران" },
  { value: "mechanical", label: "مکانیک" },
  { value: "engineering-physics", label: "فیزیک مهندسی" },
  { value: "organic-chemistry", label: "شیمی آلی" },
] as const;

const genderValues = genderOptions.map(({ value }) => value) as [
  (typeof genderOptions)[number]["value"],
  ...(typeof genderOptions)[number]["value"][],
];

const maritalStatusValues = maritalStatusOptions.map(({ value }) => value) as [
  (typeof maritalStatusOptions)[number]["value"],
  ...(typeof maritalStatusOptions)[number]["value"][],
];

const facultyValues = facultyOptions.map(({ value }) => value) as [
  (typeof facultyOptions)[number]["value"],
  ...(typeof facultyOptions)[number]["value"][],
];

const majorValues = majorOptions.map(({ value }) => value) as [
  (typeof majorOptions)[number]["value"],
  ...(typeof majorOptions)[number]["value"][],
];

const mobilePattern = /^(?:09\d{9}|\+989\d{9})$/;
const agePattern = /^(?:[1-9]|[1-9]\d|1[01]\d|120)$/;

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function normalizeMobileForValidation(value: string) {
  return normalizeDigits(value).replace(/[\s-]/g, "");
}

export const consultationFormSchema = z.object({
  gender: z.enum(genderValues, { message: "جنسیت را انتخاب کنید." }),
  age: z
    .string()
    .trim()
    .refine((value) => agePattern.test(normalizeDigits(value)), "سن باید بین ۱ تا ۱۲۰ سال باشد."),
  maritalStatus: z.enum(maritalStatusValues, { message: "وضعیت تأهل را انتخاب کنید." }),
  email: z
    .string()
    .trim()
    .max(320, "ایمیل نمی‌تواند بیشتر از ۳۲۰ نویسه باشد.")
    .email("نشانی ایمیل معتبر نیست.")
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || mobilePattern.test(normalizeMobileForValidation(value)),
      "شماره همراه معتبر نیست.",
    )
    .optional()
    .or(z.literal("")),
  faculty: z.enum(facultyValues, { message: "نام دانشکده را انتخاب کنید." }),
  major: z.enum(majorValues, { message: "نام رشته تحصیلی را انتخاب کنید." }),
  question: z
    .string()
    .trim()
    .min(10, "متن پرسش باید حداقل ۱۰ نویسه باشد.")
    .max(5000, "متن پرسش نمی‌تواند بیشتر از ۵۰۰۰ نویسه باشد."),
});

export const consultationActionSchema = consultationFormSchema.extend({
  altcha: z.string().trim().min(1, "تأیید امنیتی الزامی است."),
  website: z.string().max(0, "مقدار نامعتبر است.").optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationFormSchema>;
export type ConsultationFieldName = keyof ConsultationFormValues;
export type ConsultationFieldErrors = Partial<Record<ConsultationFieldName, string>>;

export type ConsultationActionResult =
  | { ok: true; trackingCode: string }
  | { ok: false; errors?: ConsultationFieldErrors; formError?: string };

function cleanOptional(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? undefined : trimmed;
}

export function normalizeConsultationValues(values: ConsultationFormValues) {
  const mobile = cleanOptional(values.mobile);

  return {
    gender: values.gender,
    age: Number.parseInt(normalizeDigits(values.age), 10),
    maritalStatus: values.maritalStatus,
    email: cleanOptional(values.email),
    mobile: mobile ? normalizeMobileForValidation(mobile) : undefined,
    faculty: values.faculty,
    major: values.major,
    question: values.question.trim(),
  };
}
