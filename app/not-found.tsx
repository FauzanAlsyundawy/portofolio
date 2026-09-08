import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-ink mb-2">404 — Halaman Tidak Ditemukan</h2>
        <p className="text-muted mb-6">Halaman yang Anda cari tidak ada.</p>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
