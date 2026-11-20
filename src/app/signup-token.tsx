import { connection } from "next/server";
import {
  issueFormToken,
  SIGNATURE_FIELD,
  TIMESTAMP_FIELD,
} from "@/lib/signup/abuse";

// Minted per request and kept out of the static shell: a cached signature would be
// stale by the time a visitor submits and would wrongly trip the time-trap. Render
// inside a <Suspense> boundary so only this hole waits for the request.
export async function SignupToken() {
  await connection();
  const { timestamp, signature } = issueFormToken();
  return (
    <>
      <input type="hidden" name={TIMESTAMP_FIELD} value={timestamp} />
      <input type="hidden" name={SIGNATURE_FIELD} value={signature} />
    </>
  );
}
