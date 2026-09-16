import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// -----------------------------------------------------------------------
// Rate limiting in-memory (nessuna dipendenza esterna).
// Limite: 5 richieste per IP ogni 1 ora.
// NB: essendo in memoria del processo, si resetta ad ogni cold start /
// nuovo deploy, e non è condiviso tra istanze serverless multiple.
// È un limite "best effort", non robusto quanto un rate limiter distribuito,
// ma evita completamente dipendenze esterne come Upstash.
// -----------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 ora
const RATE_LIMIT_MAX_REQUESTS = 5;

type Hit = { count: number; windowStart: number };
const rateLimitStore = new Map<string, Hit>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Timeout massimo per l'intero invio SMTP
const SMTP_TIMEOUT_MS = 15_000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too much requests. Try again later.' }, { status: 429 }
    );
  }


  try {
    const formData = await req.formData();

    const email     = formData.get("email")     as string;
    const firstName = formData.get("firstName") as string;
    const lastName  = formData.get("lastName")  as string;
    const interests = formData.getAll("interests") as string[];
    const message   = formData.get("message")   as string;

    // Validazione server-side
    if (!email || !firstName || !lastName || interests.length === 0 || !message) {
      return NextResponse.json(
        { error: "Compila tutti i campi obbligatori." },
        { status: 400 }
      );
    }

    // Allegati
    const attachments: nodemailer.SendMailOptions["attachments"] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "attachments" && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        attachments.push({
          filename: value.name,
          content: buffer,
          contentType: value.type || "application/octet-stream",
        });
      }
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      throw new Error("SMTP configuration missing");
    }

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT ?? 465),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Timeout nativi di nodemailer/nodemailer transport (in ms)
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout:   SMTP_TIMEOUT_MS,
      socketTimeout:     SMTP_TIMEOUT_MS,
    });

    // AbortController per limitare il tempo massimo dell'intera operazione
    // di invio, così una connessione SMTP che resta appesa non blocca
    // la function serverless indefinitamente.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SMTP_TIMEOUT_MS);

    try {
      await Promise.race([
        transporter.sendMail({
          from:    `"Sinersys Contact Form" <${process.env.SMTP_USER}>`,
          to:      process.env.MAIL_TO ?? "info@sinersys.it",
          replyTo: email,
          subject: `Nuovo contatto da ${firstName} ${lastName}`,
          html: `
            <h2>Nuovo messaggio dal sito Sinersys</h2>
            <p><strong>Nome:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Interessi strategici:</strong> ${interests.join(", ")}</p>
            <hr/>
            <p><strong>Messaggio:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
          attachments,
        }),
        new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () =>
            reject(new Error(`Invio email interrotto: timeout dopo ${SMTP_TIMEOUT_MS / 1000}s (server SMTP non raggiungibile o troppo lento)`))
          );
        }),
      ]);
    } finally {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact route]", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack:
          process.env.NODE_ENV === "development"
            ? err instanceof Error
              ? err.stack
              : null
            : undefined,
      },
      { status: 500 }
    );
  }
}