import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const serviceLinks = [
  { label: "홈", to: "/" },
  { label: "서비스 소개", to: "/about" },
  { label: "이벤트", to: "/event" },
  { label: "파티 찾기", to: "/parties" },
];

const supportLinks = [
  { label: "고객센터", to: "/support" },
  { label: "이용약관", to: "/terms" },
  { label: "개인정보 처리방침", to: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="relative hidden w-full border-t border-[#d6d6d6]/60 bg-[#f5f5f7] md:block">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* 브랜드 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#d6d6d6]/60">
                <img
                  src="/images/logo-symbol.png"
                  alt="Submate"
                  className="h-5 w-5 object-contain"
                />
              </span>
              <span className="text-base font-extrabold tracking-tight text-[#1d1d1f]">
                <span className="text-[#4f46e5]">Sub</span>mate
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#707070]">
              OTT 구독료를 파티로 나눠 절약하는
              <br />
              스마트한 공동구독 플랫폼
            </p>

            <div className="text-xs leading-relaxed text-[#858585]">
              <div>대표자: 김용환 · 사업자등록번호: 000-00-00000</div>
              <div>통신판매업: 2026-경남-0000</div>
              <div className="mt-1">
                주소: 경남 진주시 진주대로 501, ICT융합센터 601호관
              </div>
              <div>
                고객센터:{" "}
                <a
                  href="mailto:hello@submate.app"
                  className="font-semibold text-[#4f46e5] hover:underline"
                >
                  hello@submate.app
                </a>
              </div>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#858585]">
              서비스
            </h3>
            <ul className="flex flex-col gap-2">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[#474747] transition hover:text-[#4f46e5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 링크 */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#858585]">
              고객지원
            </h3>
            <ul className="flex flex-col gap-2">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[#474747] transition hover:text-[#4f46e5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="#"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#d6d6d6]/60 transition hover:shadow-md"
                aria-label="GitHub"
              >
                <Icon
                  icon="mdi:github"
                  className="h-4 w-4 text-[#707070] transition group-hover:text-[#1d1d1f]"
                />
              </a>

              <a
                href="mailto:hello@submate.app"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#d6d6d6]/60 transition hover:shadow-md"
                aria-label="Email"
              >
                <Icon
                  icon="solar:letter-linear"
                  className="h-4 w-4 text-[#707070] transition group-hover:text-[#1d1d1f]"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#d6d6d6]/60 pt-5">
          <p className="text-center text-xs text-[#858585]">
            © 2026{" "}
            <span className="font-semibold text-[#4f46e5]">Submate</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
