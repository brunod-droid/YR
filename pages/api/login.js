import crypto from "crypto";

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a || ""));
  const bBuffer = Buffer.from(String(b || ""));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const expectedPassword = String(
    process.env.YR_PASSWORD || process.env.NEXT_PUBLIC_YR_PASSWORD || ""
  ).trim();
  const providedPassword = String(req.body?.password || "").trim();

  if (!expectedPassword) {
    return res.status(500).json({
      ok: false,
      error: "Password environment variable is missing"
    });
  }

  if (!safeEqual(providedPassword, expectedPassword)) {
    return res.status(401).json({ ok: false, error: "Wrong password" });
  }

  return res.status(200).json({ ok: true });
}
