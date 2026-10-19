import Link from "next/link";

import { LEGAL_ROUTES } from "@/lib/legal/constants";

interface LegalLinksProps {
  className?: string;
}

export function LegalLinks({ className = "" }: LegalLinksProps) {
  return (
    <p className={`text-center text-xs text-muted ${className}`}>
      <Link href={LEGAL_ROUTES.terms} className="text-accent hover:underline">
        利用規約
      </Link>
      <span aria-hidden> ・ </span>
      <Link href={LEGAL_ROUTES.privacy} className="text-accent hover:underline">
        プライバシーポリシー
      </Link>
    </p>
  );
}
