import { Suspense } from "react";
import {
  SignupFormClient,
  type SignupAction,
  type SignupFormProps,
} from "./signup-form-client";
import { SignupToken } from "./signup-token";

export type { SignupAction };

// SignupToken is an async server component, so it can't be imported into the client half; the
// server renders it here and passes it down as children.
export function SignupForm(props: SignupFormProps) {
  return (
    <SignupFormClient {...props}>
      <Suspense fallback={null}>
        <SignupToken />
      </Suspense>
    </SignupFormClient>
  );
}
