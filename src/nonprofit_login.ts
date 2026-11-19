import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

const loginRequest = z.object({
  provider: z.enum(["google", "github", "apple", "facebook"]),
  returnTo: z.string().url(),
  redirectUri: z.string().url()
});

export type DonorReceipt = { donorId: string; amount: number; receiptId: string };
export type VolunteerReminder = { volunteerId: string; message: string };
export type OAuthProvider = "google" | "github" | "apple" | "facebook";

export function planNonprofitRun(input: {
  provider: OAuthProvider;
  returnTo: string;
  redirectUri: string;
  donorReceipts: DonorReceipt[];
  volunteerIds: string[];
}) {
  const request = loginRequest.parse(input);
  return {
    provider: request.provider,
    receiptCount: input.donorReceipts.length,
    reminders: input.volunteerIds.map((volunteerId) => ({ volunteerId, message: "Volunteer shift reminder" })),
    campaignTotal: input.donorReceipts.reduce((total, receipt) => total + receipt.amount, 0)
  };
}

export async function socialLoginUrl(client: InfraiClient, input: {
  provider: OAuthProvider;
  returnTo: string;
  redirectUri: string;
}): Promise<unknown> {
  const request = loginRequest.parse(input);
  return client.auth.oauth.authorize_url({
    provider: request.provider,
    return_to: request.returnTo,
    redirect_uri: request.redirectUri
  });
}
