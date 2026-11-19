import { type SignupStatus, SIGNUP_STATUS } from "@/lib/signup/status";

// Only the launch path renders here; the beta path 303s away to TestFlight.
const STATUS_MESSAGES: Record<
  SignupStatus,
  { tone: "success" | "error"; text: string }
> = {
  [SIGNUP_STATUS.joined]: {
    tone: "success",
    text: "You're on the list — we'll email you at launch.",
  },
  [SIGNUP_STATUS.already]: {
    tone: "success",
    text: "You're already on the list.",
  },
  [SIGNUP_STATUS.invalid]: {
    tone: "error",
    text: "That email doesn't look right. Please check it and try again.",
  },
  [SIGNUP_STATUS.error]: {
    tone: "error",
    text: "Something went wrong. Please try again.",
  },
};

export async function SignupStatus({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = (await searchParams) ?? {};
  const status = params.status;
  const message =
    typeof status === "string" && status in STATUS_MESSAGES
      ? STATUS_MESSAGES[status as SignupStatus]
      : undefined;
  if (!message) return null;

  return (
    <p role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>
  );
}
