import { createChallenge, randomInt, verifySolution, type Challenge, type Solution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";

import { env } from "~/config/env";

import { db } from "../db/client.server";
import { complaintSubmissions, type ComplaintSubmissionInsert } from "../db/schema";
import { normalizeComplaintValues, type ComplaintFormValues } from "./complaints";

const challengeLifetimeMs = 5 * 60 * 1000;
const trackingAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function createComplaintChallenge() {
  return createChallenge({
    algorithm: "PBKDF2/SHA-256",
    cost: 5_000,
    counter: randomInt(5_000, 10_000),
    deriveKey,
    expiresAt: new Date(Date.now() + challengeLifetimeMs),
    hmacSignatureSecret: env.altchaHmacSecret,
  });
}

function decodeAltchaPayload(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as unknown;

  if (!isAltchaPayload(decoded)) {
    throw new Error("Invalid ALTCHA payload");
  }

  return decoded;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAltchaPayload(value: unknown): value is { challenge: Challenge; solution: Solution } {
  if (!isRecord(value)) return false;
  return isRecord(value.challenge) && isRecord(value.solution);
}

export async function verifyComplaintChallenge(value: string) {
  try {
    const payload = decodeAltchaPayload(value);
    const result = await verifySolution({
      challenge: payload.challenge,
      solution: payload.solution,
      deriveKey,
      hmacSignatureSecret: env.altchaHmacSecret,
    });

    return result.verified;
  } catch {
    return false;
  }
}

function solarHijriDateCode(date: Date) {
  const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tehran",
    year: "2-digit",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));

  return `${parts.year}${parts.month}${parts.day}`;
}

function randomTrackingSuffix() {
  return Array.from({ length: 12 }, () => trackingAlphabet[randomInt(0, trackingAlphabet.length)]).join("");
}

export function generateTrackingCode(date = new Date()) {
  return `HUT-${solarHijriDateCode(date)}-${randomTrackingSuffix()}`;
}

export async function insertComplaintSubmission(values: ComplaintFormValues) {
  const normalizedValues = normalizeComplaintValues(values);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const trackingCode = generateTrackingCode();
    const submission: ComplaintSubmissionInsert = {
      ...normalizedValues,
      trackingCode,
    };

    const inserted = await db
      .insert(complaintSubmissions)
      .values(submission)
      .onConflictDoNothing({ target: complaintSubmissions.trackingCode })
      .returning({ trackingCode: complaintSubmissions.trackingCode });

    if (inserted[0]) {
      return inserted[0].trackingCode;
    }
  }

  throw new Error("Unable to generate a unique tracking code");
}
