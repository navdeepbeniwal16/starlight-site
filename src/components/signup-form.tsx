import { Suspense } from "react";
import {
  SignupFormClient,
  type SignupAction,
  type SignupFormProps,
} from "./signup-form-client";
import { SignupToken } from "./signup-token";

export type { SignupAction };

// Server entry for the signup form: it owns the per-request bot-trap token (an async server
// component that can't live inside the client half) and hands it to SignupFormClient as
// children, which renders the actual <form> and the analytics handlers.
export function SignupForm(props: SignupFormProps) {
  return (
    <SignupFormClient {...props}>
      <Suspense fallback={null}>
        <SignupToken />
      </Suspense>
    </SignupFormClient>
  );
}
