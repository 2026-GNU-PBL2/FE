"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const serviceCards = [
  {
    name: "Netflix",
    price: "5,240원",
    accent: "#e50914",
    image: "/images/ott/netflix.jpeg",
    seat: "1자리",
    x: "-292px",
    y: "-188px",
    midX: "-188px",
    midY: "-106px",
    rotate: "-9deg",
    delay: "-1.4s",
  },
  {
    name: "TVING",
    price: "4,120원",
    accent: "#ff153c",
    image: "/images/ott/tving.png",
    seat: "2자리",
    x: "196px",
    y: "-170px",
    midX: "126px",
    midY: "-92px",
    rotate: "8deg",
    delay: "-4.8s",
  },
  {
    name: "Wavve",
    price: "3,980원",
    accent: "#0056ff",
    image: "/images/ott/wavve.jpg",
    seat: "마감임박",
    x: "-268px",
    y: "128px",
    midX: "-152px",
    midY: "72px",
    rotate: "7deg",
    delay: "-7.2s",
  },
  {
    name: "Disney+",
    price: "4,450원",
    accent: "#00a9ff",
    image: "/images/ott/disney-plus.jpeg",
    seat: "오늘 시작",
    x: "242px",
    y: "142px",
    midX: "154px",
    midY: "82px",
    rotate: "-7deg",
    delay: "-10.4s",
  },
];

const flowEvents = [
  ["상품 선택", "월 이용권", "solar:ticket-bold-duotone"],
  ["역할 선택", "파티장 · 파티원", "solar:users-group-rounded-bold-duotone"],
  ["이용 안내", "등록 · 확인", "solar:clipboard-check-bold-duotone"],
];

const featureCards = [
  {
    icon: "solar:widget-5-bold-duotone",
    title: "OTT 상품 선택",
    body: "원하는 상품을 고르고 파티장 또는 파티원으로 바로 시작합니다.",
  },
  {
    icon: "solar:card-2-bold-duotone",
    title: "자동결제 참여",
    body: "파티원은 약관 동의와 카드 등록 후 월 이용권으로 참여합니다.",
  },
  {
    icon: "solar:wallet-money-bold-duotone",
    title: "정산 계좌 등록",
    body: "파티장은 정산 계좌를 등록하고 생성 전 금액을 확인합니다.",
  },
];

const faqItems = [
  {
    question: "Submate는 어떤 서비스인가요?",
    answer:
      "OTT 파티를 만들거나 참여하고, 결제와 정산에 필요한 정보를 한곳에서 관리하는 서비스입니다.",
  },
  {
    question: "파티장과 파티원은 무엇이 다른가요?",
    answer:
      "파티장은 구독을 운영하고 정산 계좌를 등록합니다. 파티원은 운영 중인 파티에 참여하고 자동결제를 등록합니다.",
  },
  {
    question: "파티 이용 정보는 어디서 확인하나요?",
    answer:
      "파티장이 이용 정보를 등록하면 나의 파티 상세에서 안내와 확인 상태를 볼 수 있습니다.",
  },
];

function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8 md:py-7">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.12)] ring-1 ring-[#d6d6d6]/70">
            <img
              src="/images/logo-symbol.png"
              alt=""
              className="h-7 w-7 object-contain"
            />
          </span>
          <span className="text-[21px] font-black tracking-[-0.04em] text-[#1d1d1f]">
            <span className="text-[#7dd3fc]">Sub</span>mate
          </span>
        </Link>

        <Link
          to="/log-in"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#0071e3] px-7 text-[15px] font-black text-white shadow-[0_12px_30px_rgba(0,113,227,0.20)] ring-1 ring-[#0071e3]/10 transition hover:-translate-y-0.5 hover:bg-[#0066cc] active:translate-y-0"
        >
          로그인
        </Link>
      </div>
    </header>
  );
}

function LandingLegalBar() {
  return (
    <footer className="border-t border-[#d6d6d6]/70 bg-[#f5f5f7] px-5 py-6 text-[#707070] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[12px] font-semibold leading-5 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Submate. All rights reserved.</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/terms" className="transition hover:text-[#1d1d1f]">
            이용약관
          </Link>
          <Link to="/privacy" className="transition hover:text-[#1d1d1f]">
            개인정보 처리방침
          </Link>
          <a
            href="mailto:hello@submate.app"
            className="transition hover:text-[#1d1d1f]"
          >
            고객센터
          </a>
          <details className="group relative">
            <summary className="cursor-pointer list-none transition hover:text-[#1d1d1f]">
              사업자정보
            </summary>
            <div className="mt-3 rounded-[18px] border border-[#d6d6d6]/80 bg-white p-4 text-[12px] font-medium leading-6 text-[#707070] shadow-[0_18px_50px_rgba(15,23,42,0.10)] md:absolute md:bottom-7 md:right-0 md:mt-0 md:w-[360px]">
              <p>상호 Submate · 대표자 김용환</p>
              <p>사업자등록번호 000-00-00000</p>
              <p>통신판매업 2026-경남-0000</p>
              <p>주소 경남 진주시 진주대로 501, ICT융합센터 601호관</p>
              <p>호스팅 제공자 Amazon Web Services Korea LLC</p>
              <p>이메일 hello@submate.app</p>
            </div>
          </details>
        </div>
      </div>
    </footer>
  );
}

function LandingMotionStyles() {
  return (
    <style>
      {`
        .landing-hero-bg {
          background:
            radial-gradient(circle at 68% 28%, rgba(0,113,227,0.18), transparent 34%),
            radial-gradient(circle at 82% 72%, rgba(18,185,129,0.13), transparent 30%),
            linear-gradient(120deg, rgba(255,255,255,0.96), rgba(245,247,255,0.88) 34%, rgba(236,250,246,0.72) 58%, rgba(255,255,255,0.94)),
            linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
          background-size: 140% 140%, 130% 130%, 100% 100%, 100% 100%;
          animation: landingSurface 12s ease-in-out infinite alternate;
        }

        .landing-grid {
          background-image:
            linear-gradient(rgba(29,29,31,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29,29,31,0.045) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, transparent, black 14%, black 72%, transparent);
        }

        .landing-stage {
          transform-style: preserve-3d;
          animation: landingStageFloat 7s ease-in-out infinite;
        }

        .landing-service-card {
          animation: landingServiceFlow 13s cubic-bezier(.68,0,.24,1) infinite;
          animation-delay: var(--delay);
          transform: translate3d(var(--x), var(--y), 0) rotate(var(--rotate));
        }

        .landing-mobile-rail {
          animation: landingMobileRail 16s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .landing-mobile-card {
          animation: landingMobileCardDrift 4.8s ease-in-out infinite;
          animation-delay: var(--mobile-delay);
        }

        .landing-packet {
          animation: landingPacket 3.8s cubic-bezier(.65,0,.35,1) infinite;
          animation-delay: var(--delay);
        }

        .landing-ledger-row {
          animation: landingLedger 4.6s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .landing-price-switch span {
          animation: landingPriceSwitch 5.6s ease-in-out infinite;
        }

        .landing-price-switch span:last-child {
          animation-delay: -2.8s;
        }

        @keyframes landingSurface {
          from { background-position: 0% 30%, 0 0; }
          to { background-position: 100% 68%, 0 0; }
        }

        @keyframes landingStageFloat {
          0%, 100% { transform: translateY(0) rotateX(0deg) rotateZ(-0.4deg); }
          50% { transform: translateY(-16px) rotateX(1.5deg) rotateZ(0.6deg); }
        }

        @keyframes landingServiceFlow {
          0%, 100% {
            opacity: 0.94;
            transform: translate3d(var(--x), var(--y), 0) rotate(var(--rotate)) scale(1);
          }
          45% {
            opacity: 1;
            transform: translate3d(var(--mid-x), var(--mid-y), 54px) rotate(0deg) scale(1.08);
          }
          63% {
            opacity: 0.98;
            transform: translate3d(-52px, -36px, 90px) rotate(0deg) scale(0.84);
          }
          74% {
            opacity: 0.5;
            transform: translate3d(-8px, -4px, 120px) rotate(0deg) scale(0.5);
          }
        }

        @keyframes landingPacket {
          0% { opacity: 0; transform: translateX(-96px) scale(0.78); }
          12% { opacity: 1; }
          76% { opacity: 1; }
          100% { opacity: 0; transform: translateX(118px) scale(1); }
        }

        @keyframes landingLedger {
          0%, 100% { background: rgba(255,255,255,0.68); transform: translateX(0); }
          46% { background: rgba(232,247,255,0.96); transform: translateX(6px); }
        }

        @keyframes landingPriceSwitch {
          0%, 42%, 100% { opacity: 1; transform: translateY(0); }
          50%, 92% { opacity: 0; transform: translateY(-10px); }
        }

        @keyframes landingMobileRail {
          0% { transform: translateX(0) translateY(0) rotateZ(-0.6deg); }
          22% { transform: translateX(-16%) translateY(8px) rotateZ(0.8deg); }
          50% { transform: translateX(-32%) translateY(-4px) rotateZ(-0.5deg); }
          74% { transform: translateX(-44%) translateY(7px) rotateZ(0.6deg); }
          100% { transform: translateX(-50%) translateY(0) rotateZ(-0.6deg); }
        }

        @keyframes landingMobileCardDrift {
          0%, 100% {
            transform: translateY(0) scale(1) rotate(var(--mobile-rotate));
          }
          45% {
            transform: translateY(var(--mobile-float)) scale(1.035) rotate(calc(var(--mobile-rotate) * -1));
          }
        }

        @media (max-width: 767px) {
          .landing-stage {
            animation-duration: 6.5s;
          }
        }
      `}
    </style>
  );
}

function HeroStage() {
  return (
    <div className="landing-stage relative mx-auto h-[620px] w-full max-w-[720px] overflow-visible md:h-[660px]">
      <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d6d6d6]/70 bg-white/36 shadow-[inset_0_0_90px_rgba(0,113,227,0.10),0_0_120px_rgba(0,113,227,0.10)] backdrop-blur-sm md:h-[460px] md:w-[460px]" />

      <div className="absolute left-1/2 top-1/2 hidden h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#d6d6d6]/70 md:block" />

      {serviceCards.map((service) => (
        <div
          key={service.name}
          className="landing-service-card absolute left-1/2 top-1/2 z-20 hidden w-[156px] rounded-[24px] border border-[#d6d6d6]/70 bg-white/82 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:block"
          style={
            {
              "--x": service.x,
              "--y": service.y,
              "--mid-x": service.midX,
              "--mid-y": service.midY,
              "--rotate": service.rotate,
              "--delay": service.delay,
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] bg-[#11131a] shadow-[0_10px_24px_rgba(15,23,42,0.16)] ring-1 ring-black/5">
              <img
                src={service.image}
                alt={service.name}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="rounded-full bg-white/82 px-2.5 py-1 text-[11px] font-bold text-[#474747]">
              {service.seat}
            </span>
          </div>
          <p className="mt-4 text-[17px] font-black tracking-[-0.02em] text-[#1d1d1f]">
            {service.name}
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#7dd3fc]">
            월 {service.price}
          </p>
        </div>
      ))}

      <div className="absolute left-1/2 top-[2%] z-50 w-[calc(100%-20px)] -translate-x-1/2 overflow-hidden px-1 md:hidden">
        <div className="landing-mobile-rail flex w-max gap-3 py-2">
          {[...serviceCards, ...serviceCards].map((service, index) => (
            <div
              key={`mobile-${service.name}-${index}`}
              className="landing-mobile-card w-[148px] shrink-0 rounded-[22px] border border-[#c7c7c7] bg-white px-3.5 py-3 shadow-[0_14px_34px_rgba(15,23,42,0.16)]"
              style={
                {
                  "--mobile-delay": `${(index % serviceCards.length) * 0.42}s`,
                  "--mobile-float": index % 2 === 0 ? "-9px" : "7px",
                  "--mobile-rotate": index % 2 === 0 ? "-1.4deg" : "1.2deg",
                } as React.CSSProperties
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span className="h-11 w-11 overflow-hidden rounded-[15px] bg-[#11131a] shadow-[0_8px_18px_rgba(15,23,42,0.16)] ring-1 ring-black/10">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover opacity-100"
                  />
                </span>
                <span className="rounded-full bg-[#e6f2ff] px-2.5 py-1 text-[11px] font-black text-[#0071e3]">
                  {service.seat}
                </span>
              </div>
              <p className="mt-2.5 text-[15px] font-black tracking-[-0.03em] text-[#1d1d1f]">
                {service.name}
              </p>
              <p className="mt-0.5 text-[12px] font-bold text-[#0071e3]">
                월 {service.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 z-30 w-[min(88vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-[34px] border border-[#d6d6d6]/80 bg-white/92 p-4 text-[#1d1d1f] shadow-[0_42px_110px_rgba(15,23,42,0.16)] backdrop-blur-2xl md:w-[450px] md:p-5">
        <div className="flex items-center justify-between border-b border-[#e2e2e5] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#f5f5f7] text-[#4f46e5] ring-1 ring-[#d6d6d6]/70">
              <img
                src="/images/logo-symbol.png"
                alt=""
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#858585]">
                Submate Flow
              </p>
              <p className="text-[18px] font-black tracking-[-0.03em]">
                파티 이용 흐름
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-black text-emerald-700 ring-1 ring-emerald-100">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#858585]">
              Party List
            </p>
            <div className="mt-3 flex -space-x-2">
              {["넷", "티", "디", "왓"].map((name, index) => (
                <span
                  key={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#f5f5f7] text-sm font-black text-[#1d1d1f] shadow-sm ring-1 ring-[#d6d6d6]/70"
                  style={{ opacity: 1 - index * 0.08 }}
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[13px] font-bold text-[#707070]">
              모집 파티 보기
            </p>
          </div>

          <div className="relative mx-auto h-16 w-full overflow-hidden rounded-full bg-[#e6f2ff] ring-1 ring-blue-100 sm:h-20 sm:w-28">
            {[0, 1, 2].map((item) => (
              <span
                key={item}
                className="landing-packet absolute left-1/2 top-1/2 flex h-9 w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[12px] font-black text-[#0071e3] shadow-[0_12px_28px_rgba(0,113,227,0.18)] ring-1 ring-blue-100"
                style={{ "--delay": `${item * 0.72}s` } as React.CSSProperties}
              >
                월 이용권
              </span>
            ))}
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#858585]">
              Host Setup
            </p>
            <p className="mt-2 text-[30px] font-black leading-none tracking-[-0.05em] text-[#1d1d1f] sm:mt-3 sm:text-[34px]">
              정산 계좌
            </p>
            <p className="mt-2 text-[13px] font-bold text-emerald-700">
              생성 전 확인
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {flowEvents.map(([label, value, icon], index) => (
            <div
              key={label}
              className="landing-ledger-row flex items-center justify-between rounded-[18px] border border-[#e2e2e5] bg-[#f5f5f7] px-4 py-3"
              style={{ "--delay": `${index * 0.38}s` } as React.CSSProperties}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-white ring-1 ring-blue-100">
                  <Icon icon={icon} className="h-5 w-5 text-[#0071e3]" />
                </span>
                <span className="text-[14px] font-bold text-[#474747]">
                  {label}
                </span>
              </div>
              <span className="text-[13px] font-black text-[#1d1d1f]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[7%] left-1/2 z-40 grid w-[min(92vw,560px)] -translate-x-1/2 grid-cols-3 overflow-hidden rounded-[28px] border border-[#d6d6d6]/70 bg-white/82 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
        {[
          ["상품 목록", "홈에서 선택"],
          ["정산 계좌", "파티장 단계"],
          ["이용 안내", "파티 상세"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="border-r border-white/10 px-4 py-4 text-center last:border-r-0"
          >
            <p className="text-[18px] font-black tracking-[-0.03em] text-[#1d1d1f] md:text-[22px]">
              {value}
            </p>
            <p className="mt-1 text-[11px] font-bold text-[#707070] md:text-[12px]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".landing-reveal",
        { autoAlpha: 0, y: 28, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.78,
          ease: "power3.out",
          stagger: 0.08,
        },
      );

      gsap.utils.toArray<HTMLElement>(".landing-panel").forEach((panel) => {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 46, filter: "blur(12px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 82%",
              once: true,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5f7] text-[#1d1d1f]">
      <LandingMotionStyles />
      <LandingHeader />

      <section className="landing-hero-bg relative min-h-screen overflow-hidden">
        <div className="landing-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#f5f5f7] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#f5f5f7] to-transparent" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-5 pb-12 pt-28 md:px-8 md:pt-32 lg:grid-cols-[0.92fr_1.08fr] lg:pb-16">
          <div className="relative z-20 max-w-[650px]">
            <p className="landing-reveal inline-flex items-center gap-2 rounded-full border border-[#d6d6d6]/70 bg-white/72 px-3.5 py-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#474747] shadow-sm backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              OTT Party Service
            </p>

            <h1 className="landing-reveal mt-7 text-[44px] font-black leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] sm:text-[54px] lg:text-[62px] xl:text-[66px]">
              OTT 파티 만들기
              <br />
              <span className="bg-gradient-to-r from-[#4f46e5] via-[#0071e3] to-[#12b981] bg-clip-text text-transparent">
                참여부터 정산까지
              </span>
            </h1>

            <p className="landing-reveal mt-7 max-w-[560px] text-[18px] font-medium leading-[1.72] tracking-[-0.01em] text-[#474747] md:text-[20px]">
              OTT 상품을 선택하고 파티장 또는 파티원으로 시작하세요. 결제 등록,
              정산 계좌, 이용 안내까지 역할에 맞게 이어집니다.
            </p>

            <div className="landing-reveal mt-9 flex flex-wrap gap-3">
              <Link
                to="/log-in"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] px-7 text-[16px] font-black text-white shadow-[0_18px_46px_rgba(0,113,227,0.28)] ring-1 ring-[#0071e3]/10 transition hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgba(0,113,227,0.34)] active:translate-y-0"
              >
                파티 시작하기
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18 transition group-hover:translate-x-0.5 group-hover:bg-white/24">
                  <Icon
                    icon="solar:arrow-right-bold"
                    className="h-[18px] w-[18px]"
                  />
                </span>
              </Link>
            </div>

            <div className="landing-reveal mt-10 grid max-w-[520px] grid-cols-3 gap-3">
              {[
                ["8개", "OTT 상품"],
                ["2가지", "참여 방식"],
                ["월", "이용권"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-[#d6d6d6]/70 bg-white/72 px-4 py-4 shadow-[0_16px_44px_rgba(0,0,0,0.16)] backdrop-blur-xl"
                >
                  <p className="text-[24px] font-black tracking-[-0.04em] text-[#1d1d1f]">
                    {value}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-[#707070]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-reveal relative z-10">
            <HeroStage />
          </div>
        </div>
      </section>

      <section className="relative border-t border-[#d6d6d6]/70 bg-[#f5f5f7] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="landing-panel grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#7dd3fc]">
                Why Submate
              </p>
              <h2 className="mt-4 text-[34px] font-black leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] md:text-[54px]">
                파티 시작에 필요한 단계만 담았습니다.
              </h2>
            </div>
            <p className="max-w-[620px] text-[18px] font-medium leading-[1.75] tracking-[-0.01em] text-[#474747] lg:ml-auto">
              상품 선택부터 역할 선택, 결제 등록, 정산 계좌, 이용 안내까지 실제
              서비스에서 쓰는 흐름으로 정리했습니다.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="landing-panel rounded-[28px] border border-[#d6d6d6]/70 bg-white/78 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#0071e3]">
                  <Icon icon={feature.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-[24px] font-black tracking-[-0.035em] text-[#1d1d1f]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[15px] font-medium leading-[1.68] text-[#5f6368]">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#d6d6d6]/70 bg-white px-5 py-20 text-[#1d1d1f] md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="landing-panel">
            <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#7dd3fc]">
              Real Flow
            </p>
            <h2 className="mt-4 text-[40px] font-black leading-[1.02] tracking-[-0.045em] md:text-[62px]">
              금액은 나누고,
              <br />
              이용은 분명하게.
            </h2>
            <p className="mt-6 max-w-[560px] text-[18px] font-medium leading-[1.75] text-[#474747]">
              파티원은 자동결제로 참여하고, 파티장은 정산 계좌와 이용 안내를
              등록합니다. 진행 상태는 파티 상세에서 확인할 수 있습니다.
            </p>
          </div>

          <div className="landing-panel overflow-hidden rounded-[34px] border border-[#d6d6d6]/70 bg-white/78 p-5 shadow-[0_32px_100px_rgba(15,23,42,0.10)]">
            <div className="rounded-[26px] bg-white p-5 text-[#1d1d1f]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#707070]">
                    Netflix Premium
                  </p>
                  <p className="mt-1 text-[26px] font-black tracking-[-0.04em]">
                    파티 생성 전 확인
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-black text-emerald-700">
                  계정공유형
                </span>
              </div>

              <div className="mt-7 rounded-[24px] bg-[#f5f5f7] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#707070]">
                    월 이용권
                  </span>
                  <div className="landing-price-switch relative h-9 w-36 overflow-hidden text-right text-[32px] font-black leading-none tracking-[-0.05em]">
                    <span className="absolute inset-0 line-through opacity-30">
                      17,000
                    </span>
                    <span className="absolute inset-0 text-[#0071e3]">
                      5,240
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#4f46e5] via-[#0071e3] to-[#12b981]" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["역할", "파티장 · 파티원"],
                  ["결제", "자동결제"],
                  ["정산", "계좌 등록"],
                  ["이용 안내", "등록 · 확인"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[20px] bg-[#f5f5f7] p-4">
                    <p className="text-[12px] font-bold text-[#707070]">
                      {label}
                    </p>
                    <p className="mt-1 text-[16px] font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#d6d6d6]/70 bg-[#f5f5f7] px-5 py-20 text-[#1d1d1f] md:px-8 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="landing-panel text-center">
            <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#7dd3fc]">
              Questions
            </p>
            <h2 className="mt-4 text-[38px] font-black leading-[1.04] tracking-[-0.04em] md:text-[56px]">
              자주 묻는 질문
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="landing-panel group rounded-[24px] border border-[#d6d6d6]/70 bg-white/78 px-5 py-5 backdrop-blur-xl open:bg-white/90"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[18px] font-black tracking-[-0.02em]">
                  {item.question}
                  <Icon
                    icon="solar:add-circle-bold"
                    className="h-6 w-6 shrink-0 text-[#707070] transition group-open:rotate-45 group-open:text-[#7dd3fc]"
                  />
                </summary>
                <p className="mt-4 max-w-3xl text-[15px] font-medium leading-7 text-[#5f6368]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="landing-panel mt-12 rounded-[32px] border border-[#d6d6d6]/70 bg-white/78 p-6 text-center shadow-[0_26px_90px_rgba(15,23,42,0.10)] md:p-8">
            <h3 className="text-[28px] font-black tracking-[-0.04em] md:text-[38px]">
              OTT 파티를 더 쉽게 시작하세요.
            </h3>
            <p className="mx-auto mt-3 max-w-[560px] text-[16px] font-medium leading-7 text-[#5f6368]">
              상품을 고르고 역할을 선택하면 필요한 단계가 차례로 이어집니다.
            </p>
            <Link
              to="/log-in"
              className="group mt-7 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] px-7 text-[16px] font-black text-white shadow-[0_18px_46px_rgba(0,113,227,0.28)] ring-1 ring-[#0071e3]/10 transition hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgba(0,113,227,0.34)] active:translate-y-0"
            >
              시작하기
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18 transition group-hover:translate-x-0.5 group-hover:bg-white/24">
                <Icon
                  icon="solar:arrow-right-bold"
                  className="h-[18px] w-[18px]"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <LandingLegalBar />
    </main>
  );
}
