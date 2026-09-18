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

  try {
    if (!process.env.RESEND_API_KEY) {
      // Kembalikan status fallback agar client otomatis membuka email client jika API Resend belum ada
      return {
        ok: true,
        useClientFallback: true,
        destination,
        message: `Membuka aplikasi email menuju ${destination}`,
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [destination],
      subject: `[Portfolio Kolaborasi] ${formData.subject}`,
      replyTo: formData.email,
      text: `Pesan Kolaborasi Baru:\n\nPengirim: ${formData.name}\nEmail Pengirim: ${formData.email}\nTarget Tujuan: ${destination}\nSubjek: ${formData.subject}\n\nIsi Pesan:\n${formData.message}`,
    });

    return { ok: true, destination, useClientFallback: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    // Jika Resend error (misal domain belum verify), fallback ke client mailto agar pesan tetap terkirim
    return {
      ok: true,
      useClientFallback: true,
      destination,
      error: message,
    };
  }
}
