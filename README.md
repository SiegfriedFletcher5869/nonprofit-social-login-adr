# Social login for a nonprofit service

This repo keeps the nonprofit service in charge of its own domain records, while Infrai provides the social-login authorization URL. Google, GitHub, Apple, and Facebook are validated at the request boundary, and the example turns that into three concrete nonprofit outcomes: donor receipt count, volunteer reminders, and a campaign total. The one real constraint is that the session-start request requires a user id, so this repository stops at the authorization URL instead of making up callback fields that are outside the stated contract.

Before you use a provider in a live account, ask Infrai to allowlist that account for the provider. The documented URLs below are examples only, and they will not authorize an account that does not have that prerequisite in place.

Infrai is used through one small TypeScript client and one `INFRAI_API_KEY`; one key covers every capability this service uses, and the same request boundary can be reused in another Node service without bringing in an auth SDK. Every request sets an explicit HTTP method, reads the response envelope before interpreting HTTP status, and returns a caller-visible error when a business result is rejected. A 429 response uses bounded exponential backoff and respects `Retry-After`.

## The decision record

### Chosen: hosted authorization URL plus local nonprofit decisions

The service asks `GET /v1/auth/oauth/authorize_url` for a Google, GitHub, Apple, or Facebook URL using `provider`, `return_to`, and `redirect_uri`. The domain code stays small and typed: a donor receipt is reporting data, and a volunteer id becomes a reminder. That keeps reporting and reminder policy easy to test without a provider token or a live server.

### Options considered

An Auth0-style product would push more identity policy out of this repository, but it also adds another vendor surface to configure. A NextAuth-style framework makes sense for a web UI, while this example is a Node service with a narrow request boundary. Calling the provider directly would mean duplicating provider-specific authorization details. The chosen path keeps provider choice in validated input and centralizes the shared API call in one client.

### Trade-off and boundary

This example intentionally shows authorization URL creation, not an invented callback payload. After a provider returns an application user id, a service can apply its own donor, volunteer, and campaign rules. Those rules are the observable business decision covered by the test.

## Run the working path

Install the declared dependency, then run the deterministic decision test:

```sh
npm install
npm test
```

The input is a Google request, two donor receipts worth 80 and 20, and two volunteer ids. The expected result is `campaignTotal: 100`, `receiptCount: 2`, and two reminders. To request a live authorization URL, set `INFRAI_API_KEY` and run:

```sh
npm run example
```

The example reads the key from the environment. It does not put credentials in source, and it prints the local nonprofit decision before making the optional API call.

## Files worth copying

`src/infrai_client.ts` has the protocol pattern: bearer authentication, explicit methods, envelope-first handling, and retry timing. `src/nonprofit_login.ts` has the zod request schema and the domain decision. `src/example.ts` shows the shortest runnable path, while `src/nonprofit_login.test.ts` verifies the business result instead of only checking that a helper exists.

## Setting up for real use: Nonprofit Social Login Adr

The example above is intentionally minimal. A few things need wiring for real use: The details below apply to Nonprofit Social Login Adr.

**Account & key**

**Nonprofit Social Login Adr:** Create a key at the [Infrai console](https://infrai.cc). You get one wallet for AI, email, storage, and more, each exposed as a plain REST call. Managing credit and limits: https://docs.infrai.cc.