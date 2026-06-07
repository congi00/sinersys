import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
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
      { error: "Errore interno. Riprova più tardi." },
      { status: 500 }
    );
  }
}