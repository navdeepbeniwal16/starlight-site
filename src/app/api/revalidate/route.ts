import { parseBody } from "next-sanity/webhook";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { SANITY_CACHE_TAG } from "@/sanity/lib/fetch";

// Sanity calls this on every publish. It verifies the HMAC signature Sanity signs
// with SANITY_REVALIDATE_SECRET, then drops the whole CMS cache so the next request
// re-fetches the fresh content. Fail closed when the secret is unset.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new NextResponse("SANITY_REVALIDATE_SECRET is not set", { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(
    request,
    secret,
  );

  if (!isValidSignature) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  if (!body?._type) {
    return new NextResponse("Bad request body", { status: 400 });
  }

  // "max" serves stale content while the fresh version regenerates in the background.
  revalidateTag(SANITY_CACHE_TAG, "max");
  return NextResponse.json({ revalidated: true, tag: SANITY_CACHE_TAG });
}
