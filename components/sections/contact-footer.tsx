"use client";

import Link from "next/link";
import { contactSocials, personal } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Linkedin, Github, Gitlab, ArrowUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendContactMessage } from "@/app/actions";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  subject: z.string().min(3, "Subjek minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

type FormValues = z.infer<typeof schema>;

function ContactFooter() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const result = await sendContactMessage(data);
    if (result.ok) {
      toast.success("Pesan terkirim! Saya akan segera merespons.");
      reset();
    } else {
      toast.error(result.error || "Gagal mengirim pesan. Silakan gunakan email langsung.");
    }
    setSubmitting(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Mail,
    MessageCircle,
    Linkedin,
    Github,
    Gitlab,
  };

  return (
    <footer id="contact" className="border-t border-border bg-surface">
      <div className="container-section py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink mb-4">
              Hubungi Saya
            </h2>
            <p className="text-muted mb-6 max-w-md">
              Punya proyek atau pertanyaan seputar infrastruktur jaringan? Saya terbuka untuk
              diskusi teknis dan peluang kolaborasi.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {contactSocials.map((social) => {
                const Icon = iconMap[social.icon] || Mail;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-canvas text-muted hover:text-signal hover:border-signal transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-status-critical mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-xs text-status-critical mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subjek</Label>
                <Input id="subject" {...register("subject")} />
                {errors.subject && (
                  <p className="text-xs text-status-critical mt-1">{errors.subject.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="message">Pesan</Label>
                <Textarea id="message" rows={4} {...register("message")} />
                {errors.message && (
                  <p className="text-xs text-status-critical mt-1">{errors.message.message}</p>
                )}
              </div>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? "Mengirim..." : "Kirim Pesan"}
              </Button>
            </form>
          </div>

          <div className="flex flex-col justify-end">
            <div className="rounded-xl border border-border bg-canvas p-6">
              <h3 className="font-mono text-sm text-muted mb-4">Quick Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Lokasi</dt>
                  <dd className="font-medium text-ink">{personal.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Pengalaman</dt>
                  <dd className="font-medium text-ink">{personal.experience}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Email</dt>
                  <dd className="font-medium text-ink">{personal.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">WhatsApp</dt>
                  <dd className="font-medium text-ink">{personal.whatsapp}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {personal.name}. All rights reserved.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className="gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Kembali ke atas
          </Button>
        </div>
      </div>
    </footer>
  );
}

export { ContactFooter as Footer };
