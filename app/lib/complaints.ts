import { z } from "zod";

export const departmentOptions = [
  "رسیدگی به شکایات",
  "ریاست دانشگاه",
  "مدیر گروه نظارت و ارزیابی",
  "معاونت اداری و مالی",
  "رئیس نهاد دانشگاه",
  "معاون آموزشی و پژوهشی",
  "مدیر حراست",
  "مدیر آموزش",
  "مدیر گروه ریاضی",
  "مدیر گروه مهندسی برق- مخابرات و الکترونیک",
  "مدیر گروه مهندسی برق - کنترل و قدرت",
  "مدیر گروه عمران",
  "مدیر گروه معارف",
  "مدیر گروه صنایع",
  "مدیر گروه مهندسی کامپیوتر",
  "مدیر گروه شیمی",
] as const;

export const feedbackTypeOptions = [
  { value: "complaint", label: "شکایات" },
  { value: "suggestion", label: "پیشنهادات و انتقادات" },
] as const;

export const feedbackTypeValues = feedbackTypeOptions.map(({ value }) => value) as [
  (typeof feedbackTypeOptions)[number]["value"],
  ...(typeof feedbackTypeOptions)[number]["value"][],
];

const mobilePattern = /^(?:09\d{9}|\+989\d{9})$/;
const studentIdPattern = /^\d{3,30}$/;

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function normalizeMobileForValidation(value: string) {
  return normalizeDigits(value).replace(/[\s-]/g, "");
}

export const complaintFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "وارد کردن نام الزامی است.")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ نویسه باشد."),
  lastName: z
    .string()
    .trim()
    .max(100, "نام خانوادگی نمی‌تواند بیشتر از ۱۰۰ نویسه باشد.")
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
  email: z
    .string()
    .trim()
    .max(320, "ایمیل نمی‌تواند بیشتر از ۳۲۰ نویسه باشد.")
    .email("نشانی ایمیل معتبر نیست.")
    .optional()
    .or(z.literal("")),
  studentId: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || studentIdPattern.test(normalizeDigits(value)),
      "شماره دانشجویی معتبر نیست.",
    )
    .optional()
    .or(z.literal("")),
  department: z.enum(departmentOptions, { message: "واحد مورد نظر را انتخاب کنید." }),
  feedbackType: z.enum(feedbackTypeValues, { message: "نوع پیام را انتخاب کنید." }),
  message: z
    .string()
    .trim()
    .min(10, "شرح پیام باید حداقل ۱۰ نویسه باشد.")
    .max(5000, "شرح پیام نمی‌تواند بیشتر از ۵۰۰۰ نویسه باشد."),
});

export const complaintActionSchema = complaintFormSchema.extend({
  altcha: z.string().trim().min(1, "تأیید امنیتی الزامی است."),
  website: z.string().max(0, "مقدار نامعتبر است.").optional(),
});

export type ComplaintFormValues = z.infer<typeof complaintFormSchema>;
export type ComplaintFieldName = keyof ComplaintFormValues;
export type ComplaintFieldErrors = Partial<Record<ComplaintFieldName, string>>;

export type ComplaintActionResult =
  | { ok: true; trackingCode: string }
  | { ok: false; errors?: ComplaintFieldErrors; formError?: string };

function cleanOptional(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? undefined : trimmed;
}

export function normalizeComplaintValues(values: ComplaintFormValues) {
  const mobile = cleanOptional(values.mobile);
  const studentId = cleanOptional(values.studentId);

  return {
    firstName: values.firstName.trim(),
    lastName: cleanOptional(values.lastName),
    mobile: mobile ? normalizeMobileForValidation(mobile) : undefined,
    email: cleanOptional(values.email),
    studentId: studentId ? normalizeDigits(studentId) : undefined,
    department: values.department,
    feedbackType: values.feedbackType,
    message: values.message.trim(),
  };
}
