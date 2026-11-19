import { InfraiClient } from "./infrai_client.ts";
import { planNonprofitRun, socialLoginUrl } from "./nonprofit_login.ts";

const plan = planNonprofitRun({
  provider: "github",
  returnTo: "https://nonprofit.example.org/after-login",
  redirectUri: "https://nonprofit.example.org/oauth/callback",
  donorReceipts: [{ donorId: "donor-17", amount: 125, receiptId: "receipt-17" }],
  volunteerIds: ["volunteer-4"]
});

console.log(JSON.stringify(plan, null, 2));
if (process.env.INFRAI_API_KEY) {
  const url = await socialLoginUrl(new InfraiClient(), {
    provider: plan.provider,
    returnTo: "https://nonprofit.example.org/after-login",
    redirectUri: "https://nonprofit.example.org/oauth/callback"
  });
  console.log(JSON.stringify({ authorizeUrl: url }, null, 2));
}
