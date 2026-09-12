import { isIP } from "node:net";
import { eq } from "drizzle-orm";

import { db } from "../db/client.server";
import { websiteDailyUsers, websiteStats } from "../db/schema";
import type { WebsiteStats } from "./website-stats";

const websiteStatsId = 1;
const websiteTimeZone = "Asia/Tehran";

function getDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: websiteTimeZone,
    year: "numeric",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));

  return parts as { day: string; month: string; year: string };
}

export function getWebsiteDate(date = new Date()) {
  const parts = getDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function parseIp(value: string | null) {
  const candidate = value?.trim();
  return candidate && isIP(candidate) ? candidate : undefined;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",", 1)[0] ?? null;
  return parseIp(forwardedFor) ?? parseIp(request.headers.get("x-real-ip"));
}

export async function recordHomepageVisit(request: Request, now = new Date()): Promise<WebsiteStats> {
  const today = getWebsiteDate(now);
  const ipAddress = getClientIp(request);

  return db.transaction(async (tx) => {
    await tx
      .insert(websiteStats)
      .values({
        id: websiteStatsId,
        statsDate: today,
      })
      .onConflictDoNothing({ target: websiteStats.id });

    const [storedStats] = await tx
      .select()
      .from(websiteStats)
      .where(eq(websiteStats.id, websiteStatsId))
      .for("update");

    if (!storedStats) {
      throw new Error("Website statistics summary row was not created");
    }

    let todayVisitCount = storedStats.todayVisitCount;
    let todayUserCount = storedStats.todayUserCount;

    if (storedStats.statsDate !== today) {
      await tx.delete(websiteDailyUsers);
      todayVisitCount = 0;
      todayUserCount = 0;
    }

    if (ipAddress) {
      const insertedUser = await tx
        .insert(websiteDailyUsers)
        .values({ ipAddress, createdAt: now })
        .onConflictDoNothing({ target: websiteDailyUsers.ipAddress })
        .returning({ ipAddress: websiteDailyUsers.ipAddress });

      if (insertedUser.length > 0) todayUserCount += 1;
    }

    todayVisitCount += 1;
    const totalVisitCount = storedStats.totalVisitCount + 1;

    const [updatedStats] = await tx
      .update(websiteStats)
      .set({
        statsDate: today,
        todayVisitCount,
        todayUserCount,
        totalVisitCount,
        updatedAt: now,
      })
      .where(eq(websiteStats.id, websiteStatsId))
      .returning({
        todayUsers: websiteStats.todayUserCount,
        todayVisits: websiteStats.todayVisitCount,
        totalVisits: websiteStats.totalVisitCount,
      });

    if (!updatedStats) {
      throw new Error("Website statistics summary row was not updated");
    }

    return updatedStats;
  });
}
