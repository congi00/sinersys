import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = redisConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
    })
  : null;


export async function POST(req: NextRequest) {
  if (ratelimit) {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) return NextResponse.json(
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
    });

    await transporter.sendMail({
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
    });

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