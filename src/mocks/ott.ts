// src/mocks/ott.ts

import type {
  OttDetail,
  OttService,
  OttSlug,
  OttType,
  WaitingParty,
} from "@/types/ott";

export const ottServices: OttService[] = [
  {
    id: 1,
    slug: "youtube",
    name: "유튜브",
    subtitle: "광고 없이 영상과 음악",
    price: "월 4,750원부터",
    image: "/images/ott/youtube.svg",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-red-50 text-red-700 ring-red-100",
  },
  {
    id: 2,
    slug: "watcha",
    name: "왓챠",
    subtitle: "취향 기반 영화 · 드라마",
    price: "월 3,900원부터",
    image: "/images/ott/watcha.svg",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-pink-50 text-pink-700 ring-pink-100",
  },
  {
    id: 3,
    slug: "apple-tv",
    name: "애플티비",
    subtitle: "오리지널 콘텐츠",
    price: "월 4,900원부터",
    image: "/images/ott/apple.svg",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    id: 4,
    slug: "netflix",
    name: "넷플릭스",
    subtitle: "글로벌 인기 OTT",
    price: "월 10,000원",
    image: "/images/ott/netflix.jpeg",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-red-50 text-red-700 ring-red-100",
  },
  {
    id: 5,
    slug: "tving",
    name: "티빙",
    subtitle: "국내 드라마 · 예능",
    price: "월 4,200원부터",
    image: "/images/ott/tving.png",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  {
    id: 6,
    slug: "disney-plus",
    name: "디즈니플러스",
    subtitle: "마블 · 픽사 · 디즈니",
    price: "월 4,650원부터",
    image: "/images/ott/disney-plus.jpeg",
    imageClassName: "h-5 w-8 object-contain",
    chipClassName: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    id: 7,
    slug: "wavve",
    name: "웨이브",
    subtitle: "국내 방송 · 영화",
    price: "월 이용권",
    image: "/images/logo-symbol.png",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    id: 8,
    slug: "laftel",
    name: "라프텔",
    subtitle: "애니메이션 스트리밍",
    price: "월 이용권",
    image: "/images/logo-symbol.png",
    imageClassName: "h-6 w-6 object-contain",
    chipClassName: "bg-violet-50 text-violet-700 ring-violet-100",
  },
];

export const waitingParties: WaitingParty[] = [
  {
    id: 1,
    ott: "넷플릭스",
    title: "넷플릭스 프리미엄 파티장 모집",
    host: "운영 예정 파티",
    currentMembers: 3,
    maxMembers: 4,
    price: "월 4,250원",
    settlementDate: "03.26 정산",
    status: "파티장 1자리",
    recruitRole: "HOST",
  },
  {
    id: 2,
    ott: "티빙",
    title: "티빙 스탠다드 파티장 모집",
    host: "운영 예정 파티",
    currentMembers: 2,
    maxMembers: 4,
    price: "월 4,200원",
    settlementDate: "03.28 정산",
    status: "파티장 1자리",
    recruitRole: "HOST",
  },
  {
    id: 3,
    ott: "유튜브",
    title: "유튜브 프리미엄 가족형 파티원 모집",
    host: "파티장 지은",
    currentMembers: 5,
    maxMembers: 6,
    price: "월 4,750원",
    settlementDate: "03.24 정산",
    status: "파티원 1자리",
    recruitRole: "MEMBER",
  },
  {
    id: 4,
    ott: "디즈니플러스",
    title: "디즈니플러스 장기 파티원 모집",
    host: "파티장 서연",
    currentMembers: 3,
    maxMembers: 4,
    price: "월 4,650원",
    settlementDate: "03.23 정산",
    status: "파티원 1자리",
    recruitRole: "MEMBER",
  },
  {
    id: 5,
    ott: "왓챠",
    title: "왓챠 영화 취향 파티장 모집",
    host: "운영 예정 파티",
    currentMembers: 1,
    maxMembers: 4,
    price: "월 3,900원",
    settlementDate: "03.30 정산",
    status: "파티장 1자리",
    recruitRole: "HOST",
  },
  {
    id: 6,
    ott: "애플티비",
    title: "애플티비 오리지널 정주행 파티원 모집",
    host: "파티장 예린",
    currentMembers: 2,
    maxMembers: 4,
    price: "월 4,900원",
    settlementDate: "03.27 정산",
    status: "파티원 2자리",
    recruitRole: "MEMBER",
  },
];

export const hostParties = waitingParties.filter(
  (party) => party.recruitRole === "HOST",
);

export const memberParties = waitingParties.filter(
  (party) => party.recruitRole === "MEMBER",
);

export const hostPreviewParties = hostParties.slice(0, 2);

export const memberPreviewParties = memberParties.slice(0, 2);

export const previewParties = [...hostPreviewParties, ...memberPreviewParties];

export const ottDetailsMap: Partial<Record<OttSlug, OttDetail>> = {
  netflix: {
    slug: "netflix",
    name: "넷플릭스",
    image: "/images/ott/netflix.jpeg",
    imageClassName: "h-6 w-6 object-contain",
    badge: "NETFLIX PREMIUM",
    summary: "넷플릭스 프리미엄 공유 구독",
    description:
      "Submate에서는 넷플릭스 상품을 프리미엄 1종으로만 운영합니다. 파티장은 실제 OTT를 결제하고, 파티원은 플랫폼을 통해 월 이용권 형태로 참여합니다. 중도 탈퇴 시에도 다음 결제일까지 이용 가능하며, 환불 없이 빈자리는 신규 파티원으로 채워지는 구조입니다.",
    originalPriceText: "17,000원",
    platformPriceText: "10,000원",
    settlementRule:
      "넷플릭스 프리미엄 정가 17,000원에 파티장 운영 보전 금액 10,000원을 더해 총 27,000원으로 계산합니다. 이를 3인 기준으로 나누면 1인당 9,000원이며, 여기에 플랫폼 수수료 1,000원이 더해져 최종 결제 금액은 월 10,000원입니다.",
    memberRule: "넷플릭스는 현재 프리미엄 3인 파티 기준으로만 운영됩니다.",
    notice: [
      "넷플릭스는 프리미엄 상품만 운영합니다.",
      "결제 시 1개월 이용권이 부여됩니다.",
      "중도 탈퇴해도 다음 결제일까지 이용 가능합니다.",
      "환불은 제공되지 않습니다.",
      "빈자리는 새로운 파티원으로 충원됩니다.",
    ],
    priceCards: [
      {
        label: "넷플릭스 정가",
        value: "17,000원",
        helper: "프리미엄 기준",
      },
      {
        label: "실 분담 금액",
        value: "9,000원",
        helper: "27,000원 ÷ 3인",
      },
      {
        label: "최종 결제 금액",
        value: "10,000원",
        helper: "수수료 포함",
      },
    ],
  },
};

export const getOttDetail = (slug: string): OttDetail | null => {
  return ottDetailsMap[slug as OttSlug] ?? null;
};

export const getPartyCreatePath = (slug: OttSlug) => `/party/create/${slug}`;

export const getPartyRecruitListPath = (role: "HOST" | "MEMBER") => {
  return role === "HOST" ? "/parties/hosts" : "/parties/members";
};

export const getOttMeta = (ottName: OttType): OttService => {
  const found = ottServices.find((service) => service.name === ottName);

  if (!found) {
    return ottServices[0];
  }

  return found;
};
