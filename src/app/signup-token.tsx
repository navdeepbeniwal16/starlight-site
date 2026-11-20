import { connection } from "next/server";
import {
  issueFormToken,
  SIGNATURE_FIELD,
  TIMESTAMP_FIELD,
} from "@/lib/signup/abuse";

export async function SignupToken() {
  // Keeps the signature out of the static shell: a prerendered token would be stale on
  // submit and wrongly trip the trap. Needs a <Suspense> ancestor (Cache Components).
  await connection();
  const { timestamp, signature } = issueFormToken();
  return (
    <>
      <input type="hidden" name={TIMESTAMP_FIELD} value={timestamp} />
      <input type="hidden" name={SIGNATURE_FIELD} value={signature} />
    </>
  );
}
