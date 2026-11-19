// Shared between the route handler, which sets `?status=`, and the status banner
// that renders it.
export const SIGNUP_STATUS = {
  joined: "joined",
  already: "already",
  invalid: "invalid",
  error: "error",
} as const;

export type SignupStatus = (typeof SIGNUP_STATUS)[keyof typeof SIGNUP_STATUS];
