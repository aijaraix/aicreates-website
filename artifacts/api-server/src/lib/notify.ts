import { logger } from "./logger";

const FORMSUBMIT_URL = "https://formsubmit.co/ajax/sholom@aicreates.ai";

export interface NotifyArgs {
  subject: string;
  message: string;
  payload?: Record<string, unknown>;
}

export async function notifyTeam(args: NotifyArgs): Promise<void> {
  logger.info(
    { subject: args.subject, payload: args.payload },
    "team notification",
  );
  try {
    await fetch(FORMSUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: args.subject,
        message: args.message,
        ...(args.payload ?? {}),
      }),
    });
  } catch (err) {
    logger.error(
      { err, subject: args.subject },
      "team notification email failed",
    );
  }
}
