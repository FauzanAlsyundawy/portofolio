"use client";

import { contactSocials, personal } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Linkedin, Github, Gitlab, ArrowUp, Server, User, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendContactMessage } from "@/app/actions";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  targetEmail: z.enum(["falsyundawy@gmail.com", "falsyundawy@mail.indocyber.my.id"]),
  subject: z.string().min(3, "Subjek minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

type FormValues = z.infer<typeof schema>;

function ContactFooter() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetEmail: "falsyundawy@gmail.com",
    },
  });

  const selectedTarget = watch("targetEmail");

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const result = await sendContactMessage(data);
    if (result.ok) {
      if (result.useClientFallback) {
        toast.success(`Membuka email client untuk mengirim pesan ke ${data.targetEmail}...`);
        const mailtoUrl = `mailto:${data.targetEmail}?subject=${encodeURIComponent(
          `[Kolaborasi] ${data.subject}`
        )}&body=${encodeURIComponent(
          `Halo Fauzan,\n\nNama Pengirim: ${data.name}\nEmail Pengirim: ${data.email}\n\nIsi Pesan:\n${data.message}`
        )}`;
        window.open(mailtoUrl, "_blank");
      } else {
        toast.success(`Pesan kolaborasi berhasil dikirimkan ke ${data.targetEmail}!`);
      }
      reset({
        name: "",
        email: "",
        targetEmail: data.targetEmail,
        subject: "",
        message: "",
      });
    } else {
      toast.error(result.error || "Gagal mengirim pesan. Silakan hubungi langsung via WhatsApp atau email.");
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
    <footer id="contact" className="border-t border-border bg-surface relative">
      <div className="container-section py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink mb-2 uppercase">
              Hubungi Saya &amp; Kolaborasi
            </h2>
            <p className="text-muted mb-6 max-w-md text-sm leading-relaxed">
              Tertarik untuk kolaborasi proyek jaringan, konsultasi infrastruktur, atau peluang kerja sama? Silakan kirimkan pesan langsung melalui form di bawah ini.
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
                    title={social.name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-canvas text-muted hover:text-signal hover:border-signal transition-colors shadow-2xs"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Pilihan Email Tujuan (Pribadi vs Server) */}
              <div>
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Pilih Tujuan Email
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                      selectedTarget === "falsyundawy@gmail.com"
                        ? "border-signal bg-signal/5 ring-2 ring-signal/30 text-ink shadow-xs"
                        : "border-border bg-canvas text-muted hover:border-signal/50 hover:bg-surface/50"
                    )}
                  >
                    <input
                      type="radio"
                      value="falsyundawy@gmail.com"
                      {...register("targetEmail")}
                      className="sr-only"
                    />
                    <div className="h-8 w-8 rounded-lg bg-signal/10 text-signal flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">Email Pribadi</p>
                      <p className="text-xs text-muted truncate font-mono">falsyundawy@gmail.com</p>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                      selectedTarget === "falsyundawy@mail.indocyber.my.id"
                        ? "border-signal bg-signal/5 ring-2 ring-signal/30 text-ink shadow-xs"
                        : "border-border bg-canvas text-muted hover:border-signal/50 hover:bg-surface/50"
                    )}
                  >
                    <input
                      type="radio"
                      value="falsyundawy@mail.indocyber.my.id"
                      {...register("targetEmail")}
                      className="sr-only"
                    />
                    <div className="h-8 w-8 rounded-lg bg-signal/10 text-signal flex items-center justify-center shrink-0">
                      <Server className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">Email Server</p>
                      <p className="text-xs text-muted truncate font-mono">mail.indocyber.my.id</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-xs font-medium">Nama Lengkap</Label>
                  <Input id="name" placeholder="Nama Anda" {...register("name")} className="mt-1" />
                  {errors.name && (
                    <p className="text-xs text-status-critical mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-medium">Email Anda</Label>
                  <Input id="email" type="email" placeholder="email@domain.com" {...register("email")} className="mt-1" />
                  {errors.email && (
                    <p className="text-xs text-status-critical mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="text-xs font-medium">Subjek / Topik Kolaborasi</Label>
                <Input id="subject" placeholder="Contoh: Diskusi Proyek Infrastruktur Jaringan" {...register("subject")} className="mt-1" />
                {errors.subject && (
                  <p className="text-xs text-status-critical mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="message" className="text-xs font-medium">Isi Pesan</Label>
                <Textarea id="message" rows={4} placeholder="Tuliskan detail pesan atau penawaran kolaborasi Anda di sini..." {...register("message")} className="mt-1" />
                {errors.message && (
                  <p className="text-xs text-status-critical mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto gap-2">
                <Send className="h-4 w-4" />
                {submitting ? "Mengirim..." : `Kirim Pesan ke ${selectedTarget === "falsyundawy@gmail.com" ? "Email Pribadi" : "Email Server"}`}
              </Button>
            </form>
          </div>

          <div className="flex flex-col justify-end">
            <div className="rounded-2xl border border-border bg-canvas p-6 sm:p-7 shadow-xs">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted mb-4">Informasi Kontak</h3>
              <dl className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <dt className="text-muted">Lokasi</dt>
                  <dd className="font-medium text-ink">{personal.location}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <dt className="text-muted">Pengalaman</dt>
                  <dd className="font-medium text-ink">{personal.experience}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <dt className="text-muted">Email Pribadi</dt>
                  <dd className="font-mono text-xs text-ink font-semibold">
                    <a href="mailto:falsyundawy@gmail.com" className="hover:text-signal transition-colors">
                      falsyundawy@gmail.com
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <dt className="text-muted">Email Server</dt>
                  <dd className="font-mono text-xs text-ink font-semibold">
                    <a href="mailto:falsyundawy@mail.indocyber.my.id" className="hover:text-signal transition-colors">
                      mail.indocyber.my.id
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <dt className="text-muted">WhatsApp / Telp</dt>
                  <dd className="font-mono text-xs text-ink font-semibold">
                    <a href="https://wa.me/621399823073" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">
                      +621399823073
                    </a>
                  </dd>
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
