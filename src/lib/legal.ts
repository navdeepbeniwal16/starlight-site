import type { PortableTextBlock } from "@portabletext/react";
import type { LegalDocument } from "@/sanity/lib/types";

// Static privacy/terms copy, the counterpart to siteConfig: the /privacy and /terms
// routes render this whenever Sanity is unconfigured (local, CI, pre-publish), so the
// legal pages are never blank. Authoring it as Portable Text keeps one render path
// whether the words come from here or the CMS.
//
// The copy is written to match what the signup pipeline actually does — email only (no
// name), the four processors, cookieless analytics — so it stays accurate if it ever
// ships as the live text.

// Global so keys are unique across both documents; Portable Text only requires
// uniqueness within an array, which this satisfies trivially.
let keySeq = 0;
const nextKey = () => `k${(keySeq++).toString(36)}`;

type Span = string | { text: string; bold?: boolean; href?: string };

function children(spans: Span[]) {
  const markDefs: { _type: "link"; _key: string; href: string }[] = [];
  const nodes = spans.map((span) => {
    if (typeof span === "string") {
      return { _type: "span", _key: nextKey(), text: span, marks: [] as string[] };
    }
    const marks: string[] = [];
    if (span.bold) marks.push("strong");
    if (span.href) {
      const _key = nextKey();
      markDefs.push({ _type: "link", _key, href: span.href });
      marks.push(_key);
    }
    return { _type: "span", _key: nextKey(), text: span.text, marks };
  });
  return { markDefs, nodes };
}

function block(
  style: string,
  spans: Span[],
  listItem?: "bullet" | "number",
): PortableTextBlock {
  const { markDefs, nodes } = children(spans);
  return {
    _type: "block",
    _key: nextKey(),
    style,
    markDefs,
    children: nodes,
    ...(listItem ? { listItem, level: 1 } : {}),
  } as PortableTextBlock;
}

const p = (...spans: Span[]) => block("normal", spans);
const h2 = (text: string) => block("h2", [text]);
const li = (...spans: Span[]) => block("normal", spans, "bullet");

const SUPPORT = "hello@starlight.app";

const privacyFallback: LegalDocument = {
  title: "Privacy",
  updatedAt: "2026-11-23",
  body: [
    p(
      "This page explains what happens to your details when you sign up for the Starlight beta or the launch waitlist. It covers this website and the signup — not the Starlight app itself, which you install through Apple's TestFlight.",
    ),
    p(
      "We're a small team, so we keep this plain: we ask for as little as we can, we tell you who else touches it, and we delete it when you ask.",
    ),

    h2("What we collect"),
    p(
      "When you sign up we ask for one thing — your email address. We don't ask for your name.",
    ),
    p("Along with your email, we store:"),
    li("which list you joined: the iOS beta or the launch waitlist;"),
    li(
      "where you came from, if you followed a link we tagged (the utm_ bits in the address bar);",
    ),
    li("the time you ticked the consent box;"),
    li(
      "the country you signed up from, which we work out from your connection. We never see or keep your IP address — only the country.",
    ),
    p(
      "While you're on the site we also record anonymous usage events: which pages loaded, which buttons you clicked, and your browser and device type. None of that is tied to you unless you tick the consent box when you sign up.",
    ),

    h2("Who else handles it"),
    p(
      "We don't run all of this ourselves. A few companies process your data for us:",
    ),
    li(
      { text: "Neon", bold: true },
      " keeps our database. Your signup — your email, your list, and the details above — lives here. This is the master copy.",
    ),
    li(
      { text: "HubSpot", bold: true },
      " is where we write to you from. We copy your email across so we can send beta invites and launch news.",
    ),
    li(
      { text: "PostHog", bold: true },
      " runs our analytics, on its EU servers. It holds the anonymous usage events, plus your email only if you consented when you signed up.",
    ),
    li(
      { text: "Vercel", bold: true },
      " hosts the site. It sees each request as it arrives, which is how we read your country, but it doesn't keep your details.",
    ),

    h2("Cookies"),
    p(
      "We don't use cookies to track you. The analytics run without them: the identifier that groups your clicks into one visit lives in memory for a single page load and is gone when you leave. That's why there's no cookie banner here.",
    ),

    h2("Why we're allowed to hold it"),
    p(
      "Your consent. You tick a box before you sign up, and that's our basis for emailing you and keeping your details. You can withdraw it whenever you like — see below.",
    ),

    h2("Getting the app: TestFlight"),
    p(
      "If you join the iOS beta, we hand you to Apple's TestFlight to install the app. From there, Apple's terms and privacy policy cover the app and what you do in it. What we describe here is only about the signup.",
    ),

    h2("Your choices"),
    li(
      { text: "Unsubscribe", bold: true },
      " — every email we send has an unsubscribe link. One click and we stop.",
    ),
    li(
      { text: "Delete everything", bold: true },
      " — email us at ",
      { text: SUPPORT, href: `mailto:${SUPPORT}` },
      " and we'll clear you from our database and the tools above, within 30 days and usually much sooner.",
    ),

    h2("Where it lives, and what we won't do with it"),
    p(
      "We don't sell your data, and we don't share it with anyone beyond the companies named above. The analytics sit on PostHog's EU cloud. A couple of our other tools are run by US companies, so your email may be processed in the US under their standard data-protection terms.",
    ),

    h2("How long we keep it"),
    p(
      "We hold your signup until Starlight leaves beta, or until you ask us to delete it — whichever comes first. The anonymous analytics events roll off after a while and aren't kept indefinitely.",
    ),

    h2("Changes"),
    p(
      "If we change how any of this works, we'll update the date at the top. If it's a big change, we'll email you before it takes effect.",
    ),

    h2("Questions"),
    p("Email us at ", { text: SUPPORT, href: `mailto:${SUPPORT}` }, ". A real person reads it."),
  ],
};

const termsFallback: LegalDocument = {
  title: "Terms",
  updatedAt: "2026-11-23",
  body: [
    p(
      "These terms cover this website and signing up for the Starlight beta or waitlist. The app itself comes with its own terms, which you agree to in Apple's TestFlight when you install it.",
    ),

    h2("The beta is a work in progress"),
    p(
      "Starlight is early software. It's free during the beta, and it will have rough edges — things may change, break, or disappear while we build it. We can't promise it'll always be up, and we may wind the beta down at any point.",
    ),

    h2("Signing up"),
    p(
      "When you give us your email, you're telling us it's yours and that you're happy to hear from us about Starlight. Please don't sign up with someone else's address, and don't try to game the signup with bots or scripts.",
    ),

    h2("Getting the app through TestFlight"),
    p(
      "Beta invites go out through Apple's TestFlight. Installing and running the app is covered by Apple's terms as well as ours — we send the invite, Apple handles the install.",
    ),

    h2("Free for testers"),
    p(
      "We plan to thank beta testers by keeping them free for six months after Starlight launches. We mean it, but a beta is a beta: take it as our intention rather than a signed contract, and we'll confirm the details nearer the time.",
    ),

    h2("Using the site fairly"),
    p(
      "Don't try to break the site, overload it, or take it apart to copy it. Ordinary use is welcome; abuse isn't.",
    ),

    h2("No guarantees"),
    p(
      "We've built this carefully, but the beta and this site come as they are. We can't promise they'll be faultless or right for every purpose, and as far as the law allows we're not liable for losses that come from using them. None of this removes rights you already have under the law where you live.",
    ),

    h2("Changes to these terms"),
    p(
      "We may update these terms as Starlight grows. When we do, we'll change the date at the top, and carrying on using the site means you accept the new version.",
    ),

    h2("Getting in touch"),
    p("Questions about any of this? Email ", {
      text: SUPPORT,
      href: `mailto:${SUPPORT}`,
    }, "."),
  ],
};

export const legalFallback = {
  privacy: privacyFallback,
  terms: termsFallback,
} as const;
