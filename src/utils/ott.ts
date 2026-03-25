import type { OttService, OttSlug, OttType } from "@/types/ott";
import { ottServices } from "@/mocks/ott";

type OttMeta = {
  image: string;
  imageClassName: string;
  chipClassName: string;
};

export function getOttMeta(ott: OttType): OttMeta {
  switch (ott) {
    case "유튜브":
      return {
        image: "/images/youtube.svg",
        imageClassName: "h-3.5 w-3.5 object-contain",
        chipClassName: "bg-red-50 text-red-700 ring-red-100",
      };
    case "왓챠":
      return {
        image: "/images/watcha.svg",
        imageClassName: "h-3.5 w-3.5 object-contain",
        chipClassName: "bg-pink-50 text-pink-700 ring-pink-100",
      };
    case "애플티비":
      return {
        image: "/images/apple.svg",
        imageClassName: "h-3.5 w-3.5 object-contain",
        chipClassName: "bg-slate-100 text-slate-700 ring-slate-200",
      };
    case "넷플릭스":
      return {
        image: "/images/netflix.jpeg",
        imageClassName: "h-3.5 w-3.5 object-contain",
        chipClassName: "bg-red-50 text-red-700 ring-red-100",
      };
    case "티빙":
      return {
        image: "/images/tving.png",
        imageClassName: "h-3.5 w-3.5 object-contain",
        chipClassName: "bg-rose-50 text-rose-700 ring-rose-100",
      };
    case "디즈니플러스":
      return {
        image: "/images/disney-plus.jpeg",
        imageClassName: "h-3 w-5 object-contain",
        chipClassName: "bg-blue-50 text-blue-700 ring-blue-100",
      };
    default:
      return {
        image: "/images/logo-symbol.png",
        imageClassName: "h-3.5 w-3.5 object-contain",
        chipClassName: "bg-slate-50 text-slate-700 ring-slate-100",
      };
  }
}

export function getOttServiceByName(ott: OttType): OttService | undefined {
  return ottServices.find((service) => service.name === ott);
}

export function getOttServiceBySlug(slug: OttSlug): OttService | undefined {
  return ottServices.find((service) => service.slug === slug);
}

export function getPartyCreatePath(ottSlug: OttSlug): string {
  return `/party/create/${ottSlug}`;
}
