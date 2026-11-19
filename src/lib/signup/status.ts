// The inline-feedback states the signup handler reports back to the page via the
// `?status=` query. One source of truth so the route handler (producer) and the
// status banner (consumer) can't drift.
export const SIGNUP_STATUS = {
  joined: "joined",
  already: "already",
  invalid: "invalid",
  error: "error",
} as const;

export type SignupStatus = (typeof SIGNUP_STATUS)[keyof typeof SIGNUP_STATUS];
