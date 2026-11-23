import { type SignupStatus, SIGNUP_STATUS } from "@/lib/signup/status";

type Tone = "success" | "error";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-gold/10 text-gold-ink",
  error: "bg-danger/10 text-danger",
};

// Only the launch path renders here; the beta path 303s away to TestFlight.
const STATUS_MESSAGES: Record<
  SignupStatus,
  { tone: Tone; text: string }
> = {
  [SIGNUP_STATUS.joined]: {
    tone: "success",
    text: "You're in! We'll email you as soon as it's on the App Store and Google Play.",
  },
  [SIGNUP_STATUS.already]: {
    tone: "success",
    text: "You're already in. We'll email you as soon as it's on the App Store and Google Play.",
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
    <p
      role={message.tone === "error" ? "alert" : "status"}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${TONE_STYLES[message.tone]}`}
    >
      <StatusIcon tone={message.tone} />
      {message.text}
    </p>
  );
}

function StatusIcon({ tone }: { tone: Tone }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {tone === "error" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </>
      ) : (
        <path d="M20 6 9 17l-5-5" />
      )}
    </svg>
  );
}
