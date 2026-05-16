"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

type LandingStory = {
  eyebrow: string;
  title: string;
  description: string;
  side: "left" | "right";
  visual?: "email" | "matching" | "date" | "proof";
  stats?: {
    value: string;
    label: string;
  }[];
};

const BASE_OTT_IMAGES = [
  "/images/content/img1.png",
  "/images/content/img2.png",
  "/images/content/img3.png",
  "/images/content/img4.png",
  "/images/content/img5.png",
  "/images/content/img6.png",
  "/images/content/img7.png",
  "/images/content/img8.png",
  "/images/content/img9.png",
  "/images/content/img10.png",
  "/images/content/img11.png",
  "/images/content/img12.png",
  "/images/content/img13.png",
  "/images/content/img14.png",
  "/images/content/img15.png",
  "/images/content/img16.png",
  "/images/content/img17.png",
  "/images/content/img18.png",
  "/images/content/img19.png",
  "/images/content/img20.png",
  "/images/content/img21.png",
  "/images/content/img22.png",
  "/images/content/img23.png",
  "/images/content/img24.png",
  "/images/content/img25.png",
  "/images/content/img26.png",
  "/images/content/img27.png",
  "/images/content/img28.png",
  "/images/content/img29.png",
  "/images/content/img30.png",
];

const CYLINDER_SLOT_COUNT = 42;

const OTT_IMAGE_URLS = Array.from(
  { length: CYLINDER_SLOT_COUNT },
  (_, index) => BASE_OTT_IMAGES[index % BASE_OTT_IMAGES.length],
);

const STORY_SECTIONS: LandingStory[] = [
  {
    eyebrow: "00 — SUBMATE / OTT",
    title: "구독은 같이,\n요금은 가볍게",
    description:
      "OTT 구독을 파티로 나누면 최대 68% 절약.\n인앱 결제나 통신사 번들보다 합리적인\n 공식 웹 요금 기준으로 구독료 부담을 줄입니다.",
    side: "left",
    stats: [
      { value: "7", label: "OTT 지원" },
      { value: "68%", label: "최대 절약" },
      { value: "5,240원", label: "Netflix 파티원" },
    ],
  },
  {
    eyebrow: "01 — AUTO PAYMENT",
    title: "카드는 자동결제,\n계좌는 자동정산",
    description:
      "파티원은 등록한 카드로 매달 자동 결제되고, 파티장은 등록한 계좌로 자동 정산받습니다.",
    side: "right",
    stats: [
      { value: "AUTO", label: "자동 정산 및 결제" },
      { value: "990원", label: "파티원 수수료" },
      { value: "490원", label: "파티장 수수료" },
    ],
  },
  {
    eyebrow: "02 — PRIVATE EMAIL",
    title: "내 이메일 대신,\nSubmate 도메인으로",
    description:
      "모든 유저에게 Submate 도메인 이메일을 발급해\n개인 이메일 노출 없이 OTT 파티에 참여할 수 있도록 돕습니다.",
    side: "left",
    visual: "email",
    stats: [
      { value: "PRIVATE", label: "개인 이메일 보호" },
      { value: "DOMAIN", label: "전용 도메인 발급" },
    ],
  },
  {
    eyebrow: "03 — FAST MATCHING",
    title: "자동 매칭으로,\n빠르게 시작하세요",
    description:
      "원하는 OTT를 선택하면 조건에 맞는 파티를 빠르게 찾아 연결합니다.\n오래 기다리지 않고 바로 이용을 시작할 수 있습니다.",
    side: "right",
    visual: "matching",
    stats: [
      { value: "AUTO", label: "자동 매칭" },
      { value: "FAST", label: "빠른 이용 시작" },
    ],
  },
  {
    eyebrow: "04 — START DATE",
    title: "빈자리 기준으로,\n시작일도 선택하세요",
    description:
      "결원이 생긴 파티 목록을 확인하고,\n내 일정에 맞는 OTT 이용 시작일을 선택해 합류할 수 있습니다.",
    side: "left",
    visual: "date",
    stats: [
      { value: "EMPTY", label: "결원 파티 확인" },
      { value: "DATE", label: "시작일 선택" },
    ],
  },
  {
    eyebrow: "05 — SOCIAL PROOF",
    title: "매달 독촉하는\n불편함을 줄입니다",
    description:
      "파티원이 결제하지 않아 생기는 독촉, 환불 계산, 중도 탈퇴 관리 같은\n번거로운 운영 문제를 줄입니다.",
    side: "right",
    visual: "proof",
    stats: [
      { value: "NO DM", label: "독촉 부담 감소" },
      { value: "AUTO", label: "정산 흐름 자동화" },
    ],
  },
];

function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      resolve(null);
    };

    image.src = url;
  });
}

async function createMasterTexture(imageUrls: string[]) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context 생성 실패");
  }

  const slotWidth = 420;
  const slotHeight = 760;
  const gap = 14;
  const totalWidth =
    imageUrls.length * slotWidth + (imageUrls.length - 1) * gap;

  canvas.width = totalWidth;
  canvas.height = slotHeight;

  ctx.fillStyle = "#1d1d1f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const images = await Promise.all(imageUrls.map((url) => loadImage(url)));

  images.forEach((image, index) => {
    const x = index * (slotWidth + gap);
    const y = 0;

    ctx.save();

    createRoundedRectPath(ctx, x, y, slotWidth, slotHeight, 34);
    ctx.clip();

    ctx.fillStyle = "#1d1d1f";
    ctx.fillRect(x, y, slotWidth, slotHeight);

    if (image) {
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const slotRatio = slotWidth / slotHeight;

      let drawWidth = slotWidth;
      let drawHeight = slotHeight;
      let drawX = x;
      let drawY = y;

      if (imageRatio > slotRatio) {
        drawHeight = slotHeight;
        drawWidth = slotHeight * imageRatio;
        drawX = x - (drawWidth - slotWidth) / 2;
      } else {
        drawWidth = slotWidth;
        drawHeight = slotWidth / imageRatio;
        drawY = y - (drawHeight - slotHeight) / 2;
      }

      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const overlay = ctx.createLinearGradient(x, y, x, y + slotHeight);
      overlay.addColorStop(0, "rgba(0,0,0,0.04)");
      overlay.addColorStop(0.58, "rgba(0,0,0,0.00)");
      overlay.addColorStop(1, "rgba(0,0,0,0.32)");
      ctx.fillStyle = overlay;
      ctx.fillRect(x, y, slotWidth, slotHeight);
    }

    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createCylinderRibbonGeometry() {
  const imageCount = OTT_IMAGE_URLS.length;
  const imageHeight = 4.6;
  const slotWidth = 1.35;
  const totalWidth = imageCount * slotWidth;
  const segmentsW = 900;
  const segmentsH = 24;
  const spiralTurns = 5.6;
  const spiralRadius = 2.55;
  const spiralHeight = 10.5;

  const geometry = new THREE.PlaneGeometry(
    totalWidth,
    imageHeight,
    segmentsW,
    segmentsH,
  );
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i += 1) {
    const originalX = positions.getX(i);
    const originalY = positions.getY(i);

    const t = (originalX + totalWidth / 2) / totalWidth;
    const angle = t * Math.PI * 2 * spiralTurns;
    const radius = spiralRadius * (1 - t * 0.04);

    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    const y = (t - 0.5) * spiralHeight + originalY * 0.26;

    positions.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();

  return geometry;
}

function LandingVisual({
  type,
}: {
  type: NonNullable<LandingStory["visual"]>;
}) {
  if (type === "email") {
    return (
      <div className="landing-story-visual-card relative h-[460px] w-[400px] rounded-[40px] bg-white shadow-[0_32px_100px_rgba(0,113,227,0.13)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#0071e3]/18 to-[#2997ff]/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-gradient-to-br from-[#2997ff]/12 to-[#0071e3]/6 blur-3xl" />
        </div>

        <div className="absolute left-8 top-8 w-[210px] overflow-hidden rounded-[28px] shadow-[0_20px_64px_rgba(0,113,227,0.22)]">
          <div className="bg-gradient-to-br from-[#0071e3] to-[#2997ff] px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Icon icon="solar:letter-bold" className="h-4 w-4 text-white" />
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">
                Private
              </span>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Submate Domain
            </p>
            <p className="mt-1.5 break-all text-[16px] font-bold leading-snug tracking-[-0.03em] text-white">
              user4827
              <br />
              @submate.cloud
            </p>
          </div>

          <div className="space-y-2 bg-white px-4 py-4">
            <div className="flex items-center justify-between rounded-full bg-[#f5f5f7] px-3 py-2">
              <span className="text-[11px] text-[#707070]">개인 이메일</span>
              <span className="text-[11px] font-semibold text-[#1d1d1f]">
                숨김
              </span>
            </div>
            <div className="flex items-center justify-between rounded-full bg-[#e6f2ff] px-3 py-2">
              <span className="text-[11px] text-[#707070]">OTT 파티</span>
              <span className="text-[11px] font-semibold text-[#0071e3]">
                안전
              </span>
            </div>
          </div>
        </div>

        <div className="landing-visual-float absolute right-8 top-12 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#0071e3] to-[#2997ff] shadow-[0_16px_48px_rgba(0,113,227,0.38)]">
          <Icon
            icon="solar:shield-check-bold-duotone"
            className="h-9 w-9 text-white"
          />
        </div>

        <div className="landing-visual-float absolute bottom-10 right-8 rounded-[22px] bg-white px-5 py-4 shadow-[0_20px_60px_rgba(29,29,31,0.10)] ring-1 ring-[#e2e2e5]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0071e3]/10">
              <Icon
                icon="solar:lock-bold-duotone"
                className="h-4 w-4 text-[#0071e3]"
              />
            </div>
            <div>
              <p className="text-[13px] font-bold leading-none text-[#1d1d1f]">
                보호됨
              </p>
              <p className="mt-0.5 text-[11px] text-[#707070]">이메일 익명화</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[7.5rem] left-8 right-8 h-px bg-gradient-to-r from-[#0071e3]/25 via-[#2997ff]/15 to-transparent" />

        <div className="landing-visual-float absolute bottom-24 right-8 flex items-center gap-2 rounded-full bg-[#e6f2ff] px-4 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[12px] font-semibold text-[#0071e3]">
            Cloud Domain 발급 완료
          </span>
        </div>
      </div>
    );
  }

  if (type === "matching") {
    return (
      <div className="landing-story-visual-card relative h-[460px] w-[400px] rounded-[40px] bg-white shadow-[0_32px_100px_rgba(0,113,227,0.10)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#0071e3]/10 to-[#2997ff]/6 blur-3xl" />
        </div>

        <div className="landing-visual-float absolute left-7 top-10 rounded-[22px] bg-white px-4 py-4 shadow-[0_16px_48px_rgba(0,113,227,0.12)] ring-1 ring-[#e2e2e5]">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0071e3]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#707070]">
              Wanted
            </p>
          </div>
          <p className="text-[22px] font-bold leading-none tracking-[-0.04em] text-[#1d1d1f]">
            Netflix
          </p>
          <p className="mt-1.5 text-[11px] text-[#707070]">오늘 시작 가능</p>
        </div>

        <div className="landing-visual-float absolute right-7 top-16 rounded-[22px] bg-white px-4 py-4 shadow-[0_16px_48px_rgba(0,113,227,0.12)] ring-1 ring-[#e2e2e5]">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2997ff]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#707070]">
              Party
            </p>
          </div>
          <p className="text-[22px] font-bold leading-none tracking-[-0.04em] text-[#1d1d1f]">
            3 / 4
          </p>
          <p className="mt-1.5 text-[11px] text-[#707070]">1자리 남음</p>
        </div>

        <div className="absolute left-1/2 top-1/2 flex h-[152px] w-[152px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#0071e3] to-[#2997ff] shadow-[0_24px_72px_rgba(0,113,227,0.42)]">
          <div className="absolute inset-3 rounded-full border border-white/20" />
          <div className="text-center">
            <Icon
              icon="solar:magic-stick-3-bold-duotone"
              className="mx-auto h-8 w-8 text-white"
            />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Auto
            </p>
            <p className="mt-0.5 text-[28px] font-bold leading-none tracking-[-0.05em] text-white">
              Match
            </p>
          </div>
        </div>

        <div className="landing-visual-float absolute bottom-10 left-7 rounded-[22px] bg-white px-4 py-4 shadow-[0_16px_48px_rgba(0,113,227,0.12)] ring-1 ring-[#e2e2e5]">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0066cc]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#707070]">
              Price
            </p>
          </div>
          <p className="text-[22px] font-bold leading-none tracking-[-0.04em] text-[#1d1d1f]">
            5,240원
          </p>
          <p className="mt-1.5 text-[11px] text-[#707070]">월 예상 부담</p>
        </div>

        <div className="landing-visual-float absolute bottom-10 right-7 flex flex-col items-center gap-1.5 rounded-[22px] bg-[#e6f2ff] px-4 py-3">
          <Icon
            icon="solar:check-circle-bold-duotone"
            className="h-6 w-6 text-[#0071e3]"
          />
          <p className="text-[11px] font-bold text-[#0071e3]">매칭 완료</p>
        </div>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className="landing-story-visual-card relative h-[460px] w-[400px] rounded-[40px] bg-white shadow-[0_32px_100px_rgba(0,113,227,0.10)]">
        <div className="pointer-events-none absolute -left-12 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-[#0071e3]/12 to-transparent blur-3xl" />

        <div className="absolute left-7 top-8 w-[158px] overflow-hidden rounded-[26px] shadow-[0_16px_48px_rgba(0,113,227,0.15)] ring-1 ring-[#e2e2e5]">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0071e3] to-[#2997ff] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
              Seat
            </p>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white">
              Open
            </span>
          </div>
          <div className="space-y-2 bg-white p-3">
            {["Netflix", "TVING", "Wavve"].map((service, index) => (
              <div
                key={service}
                className="rounded-[14px] bg-[#f5f5f7] px-3 py-2.5"
              >
                <p className="text-[13px] font-bold text-[#1d1d1f]">
                  {service}
                </p>
                <p className="text-[10px] text-[#707070]">
                  {index + 1}자리 남음
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-7 top-12 w-[200px] overflow-hidden rounded-[26px] shadow-[0_20px_64px_rgba(0,113,227,0.18)] ring-1 ring-[#e2e2e5]">
          <div className="bg-gradient-to-br from-[#0071e3] to-[#2997ff] px-4 pb-3 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
              Start Date
            </p>
            <p className="mt-1 text-[14px] font-bold text-white">5월 2025</p>
          </div>
          <div className="bg-white p-3">
            <div className="grid grid-cols-3 gap-1.5">
              {["10", "11", "12", "13", "14", "15", "16", "17", "18"].map(
                (day) => (
                  <div
                    key={day}
                    className={`flex h-10 items-center justify-center rounded-[12px] text-[13px] font-semibold ${
                      day === "15"
                        ? "bg-gradient-to-br from-[#0071e3] to-[#2997ff] text-white shadow-[0_4px_12px_rgba(0,113,227,0.32)]"
                        : "bg-[#f5f5f7] text-[#707070]"
                    }`}
                  >
                    {day}
                  </div>
                ),
              )}
            </div>
            <div className="mt-3 rounded-[14px] bg-[#e6f2ff] p-3">
              <p className="text-[10px] font-semibold text-[#0071e3]">
                선택한 시작일
              </p>
              <p className="mt-0.5 text-[20px] font-bold tracking-[-0.04em] text-[#1d1d1f]">
                5월 15일
              </p>
            </div>
          </div>
        </div>

        <div className="landing-visual-float absolute bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_36px_rgba(0,113,227,0.35)]">
          원하는 날부터 합류
        </div>
      </div>
    );
  }

  return (
    <div className="landing-story-visual-card relative h-[460px] w-[400px] rounded-[40px] bg-white shadow-[0_32px_100px_rgba(0,113,227,0.10)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#0071e3]/10 to-[#2997ff]/6 blur-3xl" />
      </div>

      <div className="absolute left-8 top-8 w-[264px] overflow-hidden rounded-[28px] shadow-[0_20px_64px_rgba(0,113,227,0.20)]">
        <div className="bg-gradient-to-br from-[#0071e3] to-[#2997ff] px-5 pb-4 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            Settlement Flow
          </p>
          <p className="mt-1 text-[18px] font-bold text-white">자동 정산</p>
        </div>
        <div className="space-y-3 bg-white px-4 py-4">
          {(
            [
              ["파티원 결제", "자동 완료", "#0071e3"],
              ["파티장 확인", "독촉 없음", "#2997ff"],
              ["정산 처리", "계좌 입금", "#0066cc"],
            ] as [string, string, string][]
          ).map(([label, value, color], index) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ background: color }}
              >
                {index + 1}
              </div>
              <div className="flex flex-1 items-center justify-between rounded-[14px] bg-[#f5f5f7] px-3 py-2.5">
                <span className="text-[12px] text-[#707070]">{label}</span>
                <span className="text-[12px] font-bold text-[#1d1d1f]">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-visual-float absolute right-8 top-16 rounded-[22px] bg-white px-4 py-4 shadow-[0_16px_48px_rgba(0,113,227,0.12)] ring-1 ring-[#e2e2e5]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0071e3]/10">
          <Icon
            icon="solar:bell-off-bold-duotone"
            className="h-5 w-5 text-[#0071e3]"
          />
        </div>
        <p className="mt-3 text-[22px] font-bold tracking-[-0.04em] text-[#1d1d1f]">
          No DM
        </p>
        <p className="mt-0.5 text-[11px] text-[#707070]">독촉 부담 감소</p>
      </div>

      <div className="landing-visual-float absolute bottom-9 right-8 rounded-[22px] bg-white px-4 py-4 shadow-[0_16px_48px_rgba(0,113,227,0.12)] ring-1 ring-[#e2e2e5]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#707070]">
          This Month
        </p>
        <p className="mt-2 text-[28px] font-bold leading-none tracking-[-0.05em] text-[#1d1d1f]">
          자동 정산
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          <p className="text-[11px] font-semibold text-[#0071e3]">완료</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const initialRightCardRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let mounted = true;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    camera.position.set(0, 0.9, 10.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
    keyLight.position.set(4, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0071e3, 1.1);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    group.rotation.x = -0.13;
    group.rotation.z = 0.08;
    group.scale.setScalar(1);
    groupRef.current = group;
    scene.add(group);

    const handleResize = () => {
      const nextCamera = cameraRef.current;
      const nextRenderer = rendererRef.current;
      const nextGroup = groupRef.current;

      if (!nextCamera || !nextRenderer) {
        return;
      }

      nextCamera.aspect = window.innerWidth / window.innerHeight;
      nextCamera.updateProjectionMatrix();

      if (window.innerWidth < 768) {
        nextCamera.position.set(0, 1.1, 12.8);

        if (nextGroup) {
          nextGroup.scale.setScalar(0.68);
        }
      } else {
        nextCamera.position.set(0, 0.9, 10.2);

        if (nextGroup) {
          nextGroup.scale.setScalar(1);
        }
      }

      nextRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      nextRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const setupScene = async () => {
      const texture = await createMasterTexture(OTT_IMAGE_URLS);

      if (!mounted) {
        texture.dispose();
        return;
      }

      textureRef.current = texture;

      const geometry = createCylinderRibbonGeometry();

      const material = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: texture },
          offset: { value: 0 },
          opacity: { value: 1 },
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float offset;
          uniform float opacity;
          varying vec2 vUv;

          void main() {
            float u = vUv.x + offset;

            if (u >= 1.0) {
              u -= 1.0;
            }

            if (u < 0.0) {
              u += 1.0;
            }

            vec4 color = texture2D(map, vec2(u, vUv.y));
            gl_FragColor = vec4(color.rgb, color.a * opacity);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true,
      });

      materialRef.current = material;

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0.2, 0);
      mesh.rotation.x = 0.12;
      mesh.rotation.y = 0;
      meshRef.current = mesh;

      group.add(mesh);
      handleResize();

      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);

        const nextRenderer = rendererRef.current;
        const nextScene = sceneRef.current;
        const nextCamera = cameraRef.current;
        const nextMaterial = materialRef.current;
        const nextGroup = groupRef.current;
        const nextMesh = meshRef.current;

        if (
          !nextRenderer ||
          !nextScene ||
          !nextCamera ||
          !nextMaterial ||
          !nextGroup ||
          !nextMesh
        ) {
          return;
        }

        smoothProgressRef.current +=
          (targetProgressRef.current - smoothProgressRef.current) * 0.075;

        const progress = smoothProgressRef.current;
        const time = performance.now() * 0.001;

        nextMaterial.uniforms.offset.value = progress * 1.35 + time * 0.014;

        nextGroup.rotation.x =
          -0.13 + mouseRef.current.y * 0.022 + Math.sin(time * 0.36) * 0.01;
        nextGroup.rotation.z =
          0.08 + mouseRef.current.x * 0.028 + Math.cos(time * 0.32) * 0.008;

        nextMesh.rotation.y = progress * Math.PI * 3.8 + time * 0.05;
        nextMesh.position.y = 0.2 + Math.sin(time * 0.48) * 0.055;

        nextRenderer.render(nextScene, nextCamera);
      };

      animate();
    };

    void setupScene();

    return () => {
      mounted = false;

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const mesh = meshRef.current;
      const groupToDispose = groupRef.current;
      const rendererToDispose = rendererRef.current;
      const materialToDispose = materialRef.current;
      const textureToDispose = textureRef.current;

      if (mesh) {
        mesh.geometry.dispose();

        if (groupToDispose) {
          groupToDispose.remove(mesh);
        }
      }

      if (materialToDispose) {
        materialToDispose.dispose();
      }

      if (textureToDispose) {
        textureToDispose.dispose();
      }

      if (rendererToDispose) {
        rendererToDispose.dispose();
      }

      scene.clear();

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      materialRef.current = null;
      meshRef.current = null;
      groupRef.current = null;
      textureRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const getValidTargets = (
      targets: Array<Element | null | undefined | NodeListOf<Element>>,
    ) => {
      return targets.flatMap((target) => {
        if (!target) {
          return [];
        }

        if (target instanceof NodeList) {
          return Array.from(target);
        }

        return [target];
      });
    };

    const sections = gsap.utils.toArray<HTMLElement>(".landing-story-section");
    const dots = gsap.utils.toArray<HTMLElement>(".landing-progress-dot");

    const sectionTriggers: ScrollTrigger[] = [];

    sections.forEach((section, index) => {
      const card = section.querySelector(".landing-story-card");
      const visual = section.querySelector(".landing-story-visual");
      const visualCard = section.querySelector(".landing-story-visual-card");
      const line = section.querySelector(".landing-story-line");
      const eyebrow = section.querySelector(".landing-story-eyebrow");
      const title = section.querySelector(".landing-story-title");
      const description = section.querySelector(".landing-story-description");
      const stats = section.querySelectorAll(".landing-story-stat");
      const actions = section.querySelector(".landing-story-actions");
      const floats = section.querySelectorAll(".landing-visual-float");

      const revealTargets = getValidTargets([
        line,
        eyebrow,
        title,
        description,
        stats,
        actions,
      ]);

      if (!card) {
        return;
      }

      const isFirstCard = index === 0;

      gsap.set(card, {
        autoAlpha: isFirstCard ? 1 : 0,
        y: isFirstCard ? 0 : 42,
        filter: isFirstCard ? "blur(0px)" : "blur(10px)",
      });

      if (revealTargets.length > 0) {
        gsap.set(revealTargets, {
          autoAlpha: isFirstCard ? 1 : 0,
          y: isFirstCard ? 0 : 18,
        });
      }

      if (line) {
        gsap.set(line, {
          scaleX: isFirstCard ? 1 : 0,
        });
      }

      if (visual) {
        gsap.set(visual, {
          autoAlpha: isFirstCard ? 1 : 0,
          y: isFirstCard ? 0 : 56,
          filter: isFirstCard ? "blur(0px)" : "blur(12px)",
        });
      }

      const enterTimeline = gsap.timeline({
        paused: true,
      });

      enterTimeline.to(card, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.38,
        ease: "power3.out",
      });

      if (line) {
        enterTimeline.to(
          line,
          {
            autoAlpha: 1,
            y: 0,
            scaleX: 1,
            duration: 0.32,
            ease: "power3.out",
          },
          "<+=0.02",
        );
      }

      const contentTargets = getValidTargets([
        eyebrow,
        title,
        description,
        stats,
        actions,
      ]);

      if (contentTargets.length > 0) {
        enterTimeline.to(
          contentTargets,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.36,
            stagger: 0.055,
            ease: "power3.out",
          },
          "<+=0.06",
        );
      }

      if (visual) {
        enterTimeline.to(
          visual,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.62,
            ease: "power3.out",
          },
          "<+=0.04",
        );
      }

      if (visualCard) {
        gsap.to(visualCard, {
          y: -10,
          rotate: index % 2 === 0 ? 1.2 : -1.2,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      floats.forEach((float, floatIndex) => {
        gsap.to(float, {
          y: floatIndex % 2 === 0 ? -8 : 8,
          rotate: floatIndex % 2 === 0 ? 1.4 : -1.4,
          duration: 2.4 + floatIndex * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      const activateDots = () => {
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("bg-ink", dotIndex === index);
          dot.classList.toggle("scale-[1.85]", dotIndex === index);
          dot.classList.toggle("bg-silver-mist", dotIndex !== index);
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: index >= 4 ? "top 96%" : "top 88%",
        end: "bottom 12%",
        onEnter: () => {
          enterTimeline.restart();
          activateDots();
        },
        onEnterBack: () => {
          enterTimeline.restart();
          activateDots();
        },
        onLeaveBack: () => {
          if (index !== 0) {
            enterTimeline.reverse();
          }
        },
      });

      sectionTriggers.push(trigger);
    });

    const mainTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const textEndProgress = 0.72;
        const textProgress = Math.min(1, progress / textEndProgress);

        const activeIndex = Math.min(
          STORY_SECTIONS.length - 1,
          Math.floor(textProgress * STORY_SECTIONS.length),
        );

        targetProgressRef.current = progress;

        const shouldShowInitialRightCard = progress <= 0.18;

        if (initialRightCardRef.current) {
          initialRightCardRef.current.style.opacity = shouldShowInitialRightCard
            ? "1"
            : "0";

          initialRightCardRef.current.style.visibility =
            shouldShowInitialRightCard ? "visible" : "hidden";

          initialRightCardRef.current.style.transform =
            shouldShowInitialRightCard ? "translateY(0)" : "translateY(-16px)";
        }

        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${Math.round(progress * 100)}%`;
        }

        if (progressTextRef.current) {
          progressTextRef.current.textContent = `${String(
            Math.round(progress * 100),
          ).padStart(3, "0")}%`;
        }

        if (captionRef.current) {
          captionRef.current.textContent =
            STORY_SECTIONS[activeIndex]?.eyebrow ?? "SUBMATE";
        }
      },
    });

    return () => {
      sectionTriggers.forEach((trigger) => {
        trigger.kill();
      });

      mainTrigger.kill();
      gsap.killTweensOf(initialRightCardRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-fog text-ink">
      <section ref={rootRef} className="relative bg-fog">
        <div className="sticky top-0 z-0 h-screen overflow-hidden bg-fog">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[76vh] w-[58vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-snow/80 blur-3xl" />
          </div>

          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 h-full w-full"
          />

          <div
            ref={initialRightCardRef}
            className="pointer-events-none absolute bottom-[13vh] right-5 z-30 hidden w-full max-w-[700px] border-r border-silver-mist pr-6 text-right opacity-100 transition-all duration-300 md:right-10 md:block md:pr-10 lg:right-16"
          >
            <div className="mb-6 ml-auto h-px w-20 origin-right bg-ink" />

            <p className="mb-5 text-[12px] font-semibold uppercase leading-caption tracking-[0.22em] text-graphite">
              {STORY_SECTIONS[1].eyebrow}
            </p>

            <h1 className="whitespace-pre-line font-sf-pro-display text-[48px] font-bold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[58px] lg:text-[72px] xl:text-[82px]">
              {STORY_SECTIONS[1].title}
            </h1>

            <p className="ml-auto mt-7 max-w-[410px] whitespace-pre-line font-sf-pro-text text-[20px] font-normal leading-[1.72] tracking-[-0.04px] text-graphite md:text-[20px]">
              {STORY_SECTIONS[1].description}
            </p>

            {STORY_SECTIONS[1].stats && (
              <div className="mt-9 flex flex-wrap justify-end gap-7">
                {STORY_SECTIONS[1].stats.map((stat) => (
                  <div key={`initial-${stat.label}`} className="text-right">
                    <div className="font-sf-pro-display text-[34px] font-bold leading-none tracking-[-0.035em] text-ink md:text-[40px]">
                      {stat.value}
                    </div>

                    <div className="mt-2 text-[15px] font-semibold uppercase tracking-[0.2em] text-graphite">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute right-5 top-5 z-30 w-40 text-right md:right-8 md:top-8">
            <div className="mt-3 h-px w-full overflow-hidden bg-silver-mist">
              <div ref={progressBarRef} className="h-full w-0 bg-ink" />
            </div>
          </div>

          <div className="pointer-events-none absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            {STORY_SECTIONS.map((section, index) => (
              <span
                key={section.eyebrow}
                className={`landing-progress-dot block h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  index === 0 ? "scale-[1.85] bg-ink" : "bg-silver-mist"
                }`}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-center">
            <div className="mx-auto mt-3 h-10 w-px overflow-hidden bg-silver-mist">
              <div className="h-4 w-px animate-bounce bg-ink" />
            </div>
          </div>
        </div>

        <div className="relative z-20 -mt-[100vh]">
          {STORY_SECTIONS.map((section, index) => {
            if (index === 1) {
              return null;
            }

            const isRight = section.side === "right";
            const isLast = index === STORY_SECTIONS.length - 1;

            return (
              <section
                key={section.eyebrow}
                className={`landing-story-section relative flex items-start px-5 pb-16 pt-[8vh] md:px-10 md:pt-[10vh] lg:px-16 ${
                  index <= 1 ? "min-h-screen" : "min-h-[64vh]"
                } ${index >= 2 ? "-mt-[6vh]" : ""}`}
              >
                {section.visual && (
                  <div
                    className={`landing-story-visual pointer-events-none absolute top-1/2 hidden -translate-y-1/2 xl:block ${
                      isRight ? "left-[10vw]" : "right-[10vw]"
                    }`}
                  >
                    <LandingVisual type={section.visual} />
                  </div>
                )}

                <article
                  className={`landing-story-card relative z-10 w-full max-w-[800px] ${
                    isRight
                      ? "ml-auto border-r border-silver-mist pr-6 text-right md:pr-10"
                      : "mr-auto border-l border-silver-mist pl-6 text-left md:pl-10"
                  }`}
                >
                  <div
                    className={`landing-story-line mb-6 h-px w-20 origin-left scale-x-0 bg-ink ${
                      isRight ? "ml-auto origin-right" : ""
                    }`}
                  />

                  <p className="landing-story-eyebrow mb-5 text-[12px] font-semibold uppercase leading-caption tracking-[0.22em] text-graphite">
                    {section.eyebrow}
                  </p>

                  <h1 className="landing-story-title whitespace-pre-line font-sf-pro-display text-[48px] font-bold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[58px] lg:text-[72px] xl:text-[82px]">
                    {section.title}
                  </h1>

                  <p
                    className={`landing-story-description mt-7 max-w-[700px] whitespace-pre-line font-sf-pro-text text-[20px] font-normal leading-[1.72] tracking-[-0.04px] text-graphite md:text-[20px] ${
                      isRight ? "ml-auto" : ""
                    }`}
                  >
                    {section.description}
                  </p>

                  {section.stats && (
                    <div
                      className={`mt-9 flex flex-wrap gap-7 ${
                        isRight ? "justify-end" : "justify-start"
                      }`}
                    >
                      {section.stats.map((stat) => (
                        <div
                          key={`${section.eyebrow}-${stat.label}`}
                          className={`landing-story-stat ${
                            isRight ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="font-sf-pro-display text-[34px] font-bold leading-none tracking-[-0.035em] text-ink md:text-[40px]">
                            {stat.value}
                          </div>

                          <div className="mt-2 text-[15px] font-semibold uppercase tracking-[0.2em] text-graphite">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isLast && (
                    <div
                      className={`landing-story-actions mt-10 flex flex-wrap gap-3 ${
                        isRight ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Link
                        to="/home"
                        className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] px-8 py-4 text-[17px] font-bold tracking-[-0.02em] text-white shadow-[0_8px_32px_rgba(0,113,227,0.40)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_14px_48px_rgba(0,113,227,0.58)] active:scale-[0.98]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0066cc] to-[#0071e3] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <span className="relative">파티 시작하기</span>
                        <Icon
                          icon="solar:arrow-right-bold"
                          className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  )}
                </article>
              </section>
            );
          })}

          <section className="relative min-h-[36vh]" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
