import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalDocumentPageProps = {
  badge: string;
  title: string;
  description: string;
  effectiveDate: string;
  updatedDate: string;
  sections: LegalSection[];
};

export default function LegalDocumentPage({
  badge,
  title,
  description,
  effectiveDate,
  updatedDate,
  sections,
}: LegalDocumentPageProps) {
  return (
    <main className="min-h-screen bg-brand-bg">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.12)] ring-1 ring-[#d6d6d6]/70">
              <img
                src="/images/logo-symbol.png"
                alt=""
                className="h-6 w-6 object-contain"
              />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-[#1d1d1f]">
              <span className="text-brand-main">Sub</span>mate
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pb-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="rounded-[28px] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 lg:sticky lg:top-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
              <Icon icon="solar:document-text-bold-duotone" className="h-4 w-4" />
              {badge}
            </div>

            <h1 className="mt-4 text-2xl font-extrabold leading-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {description}
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <span>시행일</span>
                <span className="font-bold text-slate-800">{effectiveDate}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span>최종 수정</span>
                <span className="font-bold text-slate-800">{updatedDate}</span>
              </div>
            </div>

            <Link
              to="/"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
            >
              홈으로 돌아가기
            </Link>
          </aside>

          <article className="overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <p className="text-sm font-bold text-slate-400">
                Submate Policy
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">
                꼭 필요한 내용을 쉽게 확인할 수 있도록 정리했어요.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {sections.map((section, index) => (
                <section key={section.title} className="px-5 py-5 sm:px-7">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-xs font-extrabold text-brand-main ring-1 ring-slate-100">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-slate-950">
                        {section.title}
                      </h2>
                      <div className="mt-3 space-y-2.5">
                        {section.body.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-sm leading-7 text-slate-600"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="bg-slate-50 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100">
                <Icon
                  icon="solar:letter-bold-duotone"
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-main"
                />
                <p className="text-sm leading-6 text-slate-600">
                  약관과 정책에 대한 문의는{" "}
                  <a
                    href="mailto:hello@submate.app"
                    className="font-bold text-brand-main hover:underline"
                  >
                    hello@submate.app
                  </a>
                  으로 보내주세요.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
