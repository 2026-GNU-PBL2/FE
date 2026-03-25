import { Icon } from "@iconify/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { waitingParties } from "@/mocks/ott";
import type { RecruitRole } from "@/types/ott";
import { getOttMeta } from "@/mocks/ott";

type OttType =
  | "전체"
  | "유튜브"
  | "왓챠"
  | "애플티비"
  | "넷플릭스"
  | "티빙"
  | "디즈니플러스";

const ottFilterList: OttType[] = [
  "전체",
  "유튜브",
  "왓챠",
  "애플티비",
  "넷플릭스",
  "티빙",
  "디즈니플러스",
];

export default function PartyListPage() {
  const { type } = useParams<{ type: "hosts" | "members" }>();
  const [searchParams] = useSearchParams();

  const recruitRole: RecruitRole = type === "hosts" ? "HOST" : "MEMBER";

  const pageBadge =
    recruitRole === "HOST" ? "파티장 모집 전체 목록" : "파티원 모집 전체 목록";

  const pageDescription =
    recruitRole === "HOST"
      ? "현재 파티장을 찾고 있는 파티를 서비스별로 확인할 수 있습니다."
      : "현재 파티원을 찾고 있는 파티를 서비스별로 확인할 수 있습니다.";

  const actionLabel = recruitRole === "HOST" ? "파티장 참여" : "파티원 참여";

  const ottParam = searchParams.get("ott") as OttType | null;
  const selectedOtt: OttType =
    ottParam && ottFilterList.includes(ottParam) ? ottParam : "전체";

  const roleFilteredParties = waitingParties.filter(
    (party) => party.recruitRole === recruitRole,
  );

  const filteredParties =
    selectedOtt === "전체"
      ? roleFilteredParties
      : roleFilteredParties.filter((party) => party.ott === selectedOtt);

  const shouldUseNestedCircle = (
    slug:
      | "youtube"
      | "watcha"
      | "apple-tv"
      | "netflix"
      | "tving"
      | "disney-plus",
  ) => {
    return (
      slug === "netflix" ||
      slug === "tving" ||
      slug === "disney-plus" ||
      slug === "watcha"
    );
  };

  const getFilterPath = (ott: OttType) => {
    const basePath =
      recruitRole === "HOST" ? "/parties/hosts" : "/parties/members";

    return ott === "전체"
      ? basePath
      : `${basePath}?ott=${encodeURIComponent(ott)}`;
  };

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-4xl border border-sky-100 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(30,58,138,0.06)] sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-brand-main">
                <Icon icon="solar:list-bold" className="h-4 w-4" />
                {pageBadge}
              </div>

              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {selectedOtt === "전체"
                  ? recruitRole === "HOST"
                    ? "파티장을 찾고 있는 파티"
                    : "지금 참여 가능한 파티"
                  : recruitRole === "HOST"
                    ? `${selectedOtt} 파티장 모집`
                    : `${selectedOtt} 참여 가능 파티`}
              </h1>

              <p className="mt-2 text-sm text-slate-500">{pageDescription}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {ottFilterList.map((ott) => {
              const isSelected = selectedOtt === ott;

              return (
                <Link
                  key={ott}
                  to={getFilterPath(ott)}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    isSelected
                      ? "bg-brand-main text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {ott}
                </Link>
              );
            })}
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredParties.map((party) => {
            const ottMeta = getOttMeta(party.ott);

            return (
              <article
                key={party.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-200 hover:border-sky-200 hover:shadow-[0_16px_40px_rgba(30,58,138,0.08)]"
              >
                <div className="h-1 bg-linear-to-r from-brand-main via-brand-sub to-brand-accent" />

                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${ottMeta.chipClassName ?? "bg-slate-50 text-slate-700 ring-slate-100"}`}
                        >
                          {shouldUseNestedCircle(ottMeta.slug) ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80">
                              <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                                <img
                                  src={ottMeta.image}
                                  alt={party.ott}
                                  className="h-full w-full object-contain"
                                />
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-xl bg-white/80">
                              <img
                                src={ottMeta.image}
                                alt={party.ott}
                                className={ottMeta.imageClassName}
                              />
                            </span>
                          )}
                          {party.ott}
                        </span>

                        <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-100">
                          {party.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {party.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {party.host}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-brand-main px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(30,58,138,0.18)] transition-all hover:bg-blue-700"
                    >
                      {actionLabel}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        현재 인원
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {party.currentMembers}/{party.maxMembers}명
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        정산일
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {party.settlementDate}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        금액
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {party.price}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {filteredParties.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50">
              <Icon
                icon="solar:document-text-search-bold"
                className="h-7 w-7 text-brand-main"
              />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              현재 모집 중인 파티가 없습니다
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              다른 OTT를 선택해서 다시 확인해보세요.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
