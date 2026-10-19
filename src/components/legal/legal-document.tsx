import Link from "next/link";

import { LEGAL_OPERATOR, LEGAL_UPDATED_ON } from "@/lib/legal/constants";

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalDocumentProps {
  title: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, sections }: LegalDocumentProps) {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <article className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted">
            <Link href="/login" className="hover:text-accent">
              GearVox
            </Link>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-xs text-muted">
            {LEGAL_OPERATOR} / 制定・最終更新 {LEGAL_UPDATED_ON}
          </p>
        </header>

        <div className="space-y-6 text-sm leading-7">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-medium">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-foreground/90">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="text-xs text-muted">
          <Link href="/" className="text-accent hover:underline">
            ホームへ戻る
          </Link>
        </p>
      </article>
    </main>
  );
}
