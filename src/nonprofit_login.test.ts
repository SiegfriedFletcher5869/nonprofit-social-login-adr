import assert from "node:assert/strict";
import { planNonprofitRun } from "./nonprofit_login.ts";

const result = planNonprofitRun({
  provider: "google",
  returnTo: "https://nonprofit.example.org/after-login",
  redirectUri: "https://nonprofit.example.org/oauth/callback",
  donorReceipts: [
    { donorId: "d-1", amount: 80, receiptId: "r-1" },
    { donorId: "d-2", amount: 20, receiptId: "r-2" }
  ],
  volunteerIds: ["v-9", "v-10"]
});

assert.deepEqual(result, {
  provider: "google",
  receiptCount: 2,
  reminders: [
    { volunteerId: "v-9", message: "Volunteer shift reminder" },
    { volunteerId: "v-10", message: "Volunteer shift reminder" }
  ],
  campaignTotal: 100
});
console.log("nonprofit decision test passed");
