import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import { ottServices, previewParties } from "@/mocks/ott";
import type { OttSlug, RecruitRole } from "@/types/ott";
import { getOttMeta } from "@/utils/ott";

function shouldUseNestedCircle(slug: OttSlug) {
  return (
    slug === "netflix" ||
    slug === "tving" ||
    slug === "disney-plus" ||
    slug === "watcha"
  );
}

export default function PartyRecruitListPage() {
  const { type } = useParams<{ type: "hosts" | "members" }>();

  const recruitRole: RecruitRole = type === "hosts" ? "HOST" : "MEMBER";

  const pageTitle =
    recruitRole === "HOST" ? "모집 중인 파티장 자리" : "모집 중인 파티원 자리";

  const pageDescription =
    recruitRole === "HOST"
      ? "현재 파티장을 찾고 있는 공동구독 파티 목록입니다."
      : "현재 파티원을 찾고 있는 공동구독 파티 목록입니다.";

  const actionLabel = recruitRole === "HOST" ? "파티장 참여" : "파티원 참여";

  const filteredParties = previewParties.filter(
    (party) => party.recruitRole === recruitRole,
  );

  return (
    <div className="min-h-full bg-slate-50">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-4xl border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-900/5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="h-4 w-4"
                />
                {recruitRole === "HOST" ? "파티장 모집중" : "파티원 모집중"}
              </div>

              <h1 className="mt-3 text-2xl font-bold text-slate-900">
                {pageTitle}
              </h1>

              <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
            </div>

            <Link
              to="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-slate-50"
            >
              홈으로
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filteredParties.map((party) => {
              const ottMeta = getOttMeta(party.ott);
              const ottService =
                ottServices.find((service) => service.name === party.ott) ??
                ottServices[0];

              return (
                <article
                  key={party.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-sky-200 hover:shadow-md hover:shadow-blue-900/10"
                >
                  <div className="h-1 bg-linear-to-r from-blue-900 via-sky-400 to-teal-400" />

                  <div className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              ottMeta.chipClassName ??
                              "bg-slate-50 text-slate-700 ring-slate-200"
                            }`}
                          >
                            {shouldUseNestedCircle(ottService.slug) ? (
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
                                  className={
                                    ottMeta.imageClassName ??
                                    "h-3.5 w-3.5 object-contain"
                                  }
                                />
                              </span>
                            )}
                            {party.ott}
                          </span>

                          <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                            {party.status}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-bold text-slate-900 sm:text-lg">
                          {party.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {party.host}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-blue-900 px-4 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-800"
                      >
                        {actionLabel}
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <p className="text-xs font-medium text-slate-400">
                          현재 인원
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {party.currentMembers}/{party.maxMembers}명
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <p className="text-xs font-medium text-slate-400">
                          정산일
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {party.settlementDate}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <p className="text-xs font-medium text-slate-400">
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
          </div>

          {filteredParties.length === 0 && (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
                <Icon
                  icon="solar:document-text-search-bold"
                  className="h-7 w-7 text-blue-900"
                />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                현재 모집 중인 파티가 없습니다
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                잠시 후 다시 확인해주세요.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
