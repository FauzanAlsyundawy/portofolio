"use server";

import { Resend } from "resend";

export async function sendContactMessage(formData: {
  name: string;
  email: string;
  targetEmail: string;
  subject: string;
  message: string;
}) {
  const destination =
    formData.targetEmail === "falsyundawy@mail.indocyber.my.id"
      ? "falsyundawy@mail.indocyber.my.id"
      : "falsyundawy@gmail.com";

  // 1. Coba kirim via Resend jika API key tersedia di Dokploy/environment
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [destination],
        subject: `[Portfolio Kolaborasi] ${formData.subject}`,
        replyTo: formData.email,
        text: `Pesan Kolaborasi Baru:\n\nPengirim: ${formData.name}\nEmail Pengirim: ${formData.email}\nTarget Tujuan: ${destination}\nSubjek: ${formData.subject}\n\nIsi Pesan:\n${formData.message}`,
      });
      return { ok: true, destination, method: "resend" };
    } catch (resendErr) {
      console.warn("Resend API error, beralih ke relay server:", resendErr);
    }
  }

  // 2. Full-Stack Relay Otomatis (Zero Config - langsung mengirim email ke inbox Anda)
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${destination}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "https://falsyundawy.my.id",
        Referer: "https://falsyundawy.my.id/",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        _subject: `[Portfolio Kolaborasi] ${formData.subject}`,
        message: formData.message,
        _template: "table",
      }),
    });

    const data = await response.json();

    if (data.success === "true" || data.success === true) {
      return { ok: true, destination, method: "relay" };
    } else if (data.message && data.message.includes("Activation")) {
      // Email konfirmasi aktivasi pertama kali dari FormSubmit
      return {
        ok: true,
        destination,
        method: "activation",
        message: "Email aktivasi telah dikirim ke inbox Anda. Cukup klik 'Activate Form' sekali saja di inbox untuk menerima pesan selanjutnya secara instan.",
      };
    }

    throw new Error(data.message || "Gagal memproses pengiriman");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    return {
      ok: false,
      useClientFallback: true,
      destination,
      error: message,
    };
  }
}
