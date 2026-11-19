// Inline feedback for the Post/Redirect/Get flow: the route handler redirects
// back to `/?status=...` for the launch path, and the beta path leaves via 303 to
// TestFlight so it never lands here.
const STATUS_MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  joined: {
    tone: "success",
    text: "You're on the list — we'll email you at launch.",
  },
  already: { tone: "success", text: "You're already on the list." },
  invalid: {
    tone: "error",
    text: "That email doesn't look right. Please check it and try again.",
  },
  error: { tone: "error", text: "Something went wrong. Please try again." },
};

export async function SignupStatus({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = (await searchParams) ?? {};
  const status = typeof params.status === "string" ? params.status : undefined;
  const message = status ? STATUS_MESSAGES[status] : undefined;
  if (!message) return null;

  return (
    <p role={message.tone === "error" ? "alert" : "status"}>{message.text}</p>
  );
}
