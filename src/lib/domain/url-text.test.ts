import { describe, expect, it } from "vitest";
import { extractTextFromHtml } from "./url-text";

describe("extractTextFromHtml", () => {
  it("reads title and strips scripts", () => {
    const html = `
      <html><head><title>  Hello &amp; Co </title>
      <script>alert(1)</script></head>
      <body><p>Keep this.</p><style>p{}</style></body></html>
    `;
    const result = extractTextFromHtml(html);
    expect(result.title).toBe("Hello & Co");
    expect(result.text).toContain("Keep this.");
    expect(result.text).not.toContain("alert");
  });
});
