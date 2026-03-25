export type OttSlug =
  | "youtube"
  | "watcha"
  | "apple-tv"
  | "netflix"
  | "tving"
  | "disney-plus";

export type OttType =
  | "유튜브"
  | "왓챠"
  | "애플티비"
  | "넷플릭스"
  | "티빙"
  | "디즈니플러스";

export interface OttService {
  id: number;
  slug: OttSlug;
  name: OttType;
  subtitle: string;
  price: string;
  image: string;
  imageClassName?: string;
  chipClassName?: string;
}

export type RecruitRole = "HOST" | "MEMBER";

export interface WaitingParty {
  id: number;
  ott: OttType;
  title: string;
  host: string;
  currentMembers: number;
  maxMembers: number;
  price: string;
  settlementDate: string;
  status: string;
  recruitRole: RecruitRole;
}

export interface OttDetailPriceCard {
  label: string;
  value: string;
  helper: string;
}

export interface OttDetail {
  slug: OttSlug;
  name: string;
  image: string;
  imageClassName?: string;
  badge: string;
  summary: string;
  description: string;
  originalPriceText: string;
  platformPriceText: string;
  settlementRule: string;
  memberRule: string;
  notice: string[];
  priceCards: OttDetailPriceCard[];
}
