"use server";

import { Resend } from "resend";

export async function sendContactMessage(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      // API key belum dikonfigurasi - kembalikan pesan informatif
      return { ok: false, error: "Email service belum dikonfigurasi. Silakan isi form kontak melalui email langsung." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL || "you@example.com"],
      subject: `[Portfolio] ${formData.subject}`,
      replyTo: formData.email,
      text: `From: ${formData.name} <${formData.email}>\n\n${formData.message}`,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengirim pesan. Coba lagi nanti." };
  }
}

