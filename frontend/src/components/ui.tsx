import { txUrl, shortHash } from "@/lib/format";
import { MOCK } from "@/lib/config";

const MAP = {
  released: ["rel", "Released"],
  refunded: ["ref", "Refunded"],
  force_refunded: ["ref", "Force refunded"],
  reserved: ["hold", "Held by cat"],
  failed: ["ref", "Failed"],
} as const;

export function Badge({ status }: { status: keyof typeof MAP }) {
  const [cls, label] = MAP[status];
  return <span className={`bdg ${cls}`}>{label}</span>;
}

export function TxLink({ hash }: { hash?: string }) {
  if (!hash) return <span className="mut">-</span>;
  return (
    <a href={txUrl(hash)} target="_blank" rel="noopener noreferrer"
      title={MOCK ? "Transaksi simulasi (mode demo)" : "Lihat di explorer"}>
      {shortHash(hash)}
    </a>
  );
}
