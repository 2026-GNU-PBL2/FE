import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const footerLinks = [
  { label: "서비스 소개", to: "/about" },
  { label: "고객센터", to: "/support" },
  { label: "이용약관", to: "/terms" },
  { label: "개인정보 처리방침", to: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="relative mx-auto hidden w-full max-w-7xl bg-brand-bg px-4 pb-8 pt-3 sm:px-6 lg:px-8 md:block">
      <div className="border-t border-slate-200/70 pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl text-xs leading-5 text-slate-500">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-slate-950">
                <span className="text-brand-main">Sub</span>mate
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="font-semibold text-slate-400">
                구독은 같이, 요금은 가볍게
              </span>
            </Link>

            <p className="mt-3">
              대표자 김용환 · 사업자등록번호 000-00-00000 · 통신판매업
              2026-경남-0000
            </p>

            <p className="mt-1">
              주소 경남 진주시 진주대로 501, ICT융합센터 601호관 · 고객센터{" "}
              <a
                href="mailto:hello@submate.app"
                className="font-bold text-slate-700 transition hover:text-brand-main"
              >
                hello@submate.app
              </a>
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs font-bold text-slate-500 transition hover:text-brand-main"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 text-slate-400">
              <a
                href="mailto:hello@submate.app"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-blue-50 hover:text-brand-main"
                aria-label="Email"
                title="Email"
              >
                <Icon icon="solar:letter-linear" className="h-5 w-5" />
              </a>

              <Link
                to="/support"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-blue-50 hover:text-brand-main"
                aria-label="고객센터"
                title="고객센터"
              >
                <Icon icon="solar:question-circle-linear" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <p className="text-xs font-semibold text-slate-400">
            © 2026 Submate. All rights reserved.
          </p>

          <p>
            안전한 공동구독 관리를 위한 결제·정산 플랫폼
          </p>
        </div>
      </div>
    </footer>
  );
}
