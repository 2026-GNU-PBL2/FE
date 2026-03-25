import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="hidden md:block relative mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="border-t border-slate-200/70 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs leading-relaxed text-slate-500">
            <div className="font-semibold text-slate-700">Submate</div>

            <div className="mt-1">
              대표자: 김용환 · 사업자등록번호: 000-00-00000 · 통신판매업:
              2026-경남-0000
            </div>

            <div className="mt-1">
              주소: 경남 진주시 진주대로 501, ICT융합센터 601호관 · 고객센터:{" "}
              <a
                href="mailto:hello@submate.app"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                hello@submate.app
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              aria-label="GitHub"
              title="GitHub"
            >
              <Icon
                icon="mdi:github"
                className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900"
              />
              <span className="sr-only">GitHub</span>
            </a>

            <a
              href="#"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              aria-label="Blog"
              title="Blog"
            >
              <Icon
                icon="solar:document-text-linear"
                className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900"
              />
              <span className="sr-only">Blog</span>
            </a>

            <a
              href="mailto:hello@submate.app"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              aria-label="Email"
              title="Email"
            >
              <Icon
                icon="solar:letter-linear"
                className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900"
              />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-400">
            © 2026 Submate. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
