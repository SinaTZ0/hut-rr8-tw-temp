import { db } from "../db/client.server";
import { consultationSubmissions, type ConsultationSubmissionInsert } from "../db/schema";
import { generateTrackingCode } from "./complaints.server";
import { normalizeConsultationValues, type ConsultationFormValues } from "./consultation";

export async function insertConsultationSubmission(values: ConsultationFormValues) {
  const normalizedValues = normalizeConsultationValues(values);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const submission: ConsultationSubmissionInsert = {
      ...normalizedValues,
      trackingCode: generateTrackingCode("HUT-Q"),
    };

    const inserted = await db
      .insert(consultationSubmissions)
      .values(submission)
      .onConflictDoNothing({ target: consultationSubmissions.trackingCode })
      .returning({ trackingCode: consultationSubmissions.trackingCode });

    if (inserted[0]) {
      return inserted[0].trackingCode;
    }
  }

  throw new Error("Unable to generate a unique consultation tracking code");
}
