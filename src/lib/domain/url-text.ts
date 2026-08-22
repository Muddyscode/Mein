const MAX_BYTES = 1_000_000;
const TIMEOUT_MS = 8_000;

export function extractTextFromHtml(html: string): {
  title: string | null;
  text: string;
} {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const titleMatch = withoutNoise.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]
    ? decodeEntities(titleMatch[1].replace(/\s+/g, " ").trim())
    : null;
  const text = decodeEntities(
    withoutNoise
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  return { title, text };
}

export async function fetchUrlText(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ title: string; text: string; originUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "text/html,text/plain;q=0.9,*/*;q=0.1" },
    });
    if (!res.ok) {
      throw new Error(`URL returned HTTP ${res.status}.`);
    }
    const length = Number(res.headers.get("content-length") ?? "0");
    if (length > MAX_BYTES) {
      throw new Error("URL response is larger than 1 MB.");
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      throw new Error("URL response is larger than 1 MB.");
    }
    const raw = buf.toString("utf8");
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("html") || /<html/i.test(raw)) {
      const extracted = extractTextFromHtml(raw);
      const host = safeHost(url);
      return {
        title: extracted.title || host || "Untitled URL",
        text: extracted.text,
        originUrl: res.url || url,
      };
    }
    return {
      title: safeHost(url) || "Untitled URL",
      text: raw.trim(),
      originUrl: res.url || url,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("URL fetch timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
