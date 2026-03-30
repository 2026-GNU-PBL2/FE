import { Icon } from "@iconify/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  hostPreviewParties,
  memberPreviewParties,
  ottServices,
  getOttMeta,
  getPartyCreatePath,
  getPartyRecruitListPath,
} from "@/mocks/ott";
import type { OttSlug, OttType, WaitingParty } from "@/types/ott";
import { useAuthStore } from "@/stores/authStore";

function shouldUseNestedCircle(slug: OttSlug) {
  return (
    slug === "netflix" ||
    slug === "tving" ||
    slug === "disney-plus" ||
    slug === "watcha"
  );
}

function renderOttLogo({
  image,
  alt,
  slug,
  defaultImageClassName,
  outerClassName,
}: {
  image: string;
  alt: string;
  slug: OttSlug;
  defaultImageClassName: string;
  outerClassName: string;
}) {
  if (shouldUseNestedCircle(slug)) {
    return (
      <div
        className={[
          outerClassName,
          "inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200",
        ].join(" ")}
      >
        <div className="flex h-4/5 w-4/5 items-center justify-center overflow-hidden rounded-full">
          <img src={image} alt={alt} className="h-full w-full object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        outerClassName,
        "inline-flex items-center justify-center rounded-2xl bg-white",
      ].join(" ")}
    >
      <img src={image} alt={alt} className={defaultImageClassName} />
    </div>
  );
}

function RecruitPartyCard({
  party,
  actionLabel,
}: {
  party: WaitingParty;
  actionLabel: string;
}) {
  const ottMeta = getOttMeta(party.ott);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-sky-200 hover:shadow-md hover:shadow-blue-900/10">
      <div className="h-1 bg-linear-to-r from-brand-main via-brand-sub to-brand-accent" />

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
                      className={
                        ottMeta.imageClassName ?? "h-3.5 w-3.5 object-contain"
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

            <p className="mt-1 text-sm text-slate-500">{party.host}</p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-brand-main px-4 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-800"
          >
            {actionLabel}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-400">현재 인원</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {party.currentMembers}/{party.maxMembers}명
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-400">정산일</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {party.settlementDate}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-400">금액</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {party.price}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecruitSection({
  badge,
  title,
  description,
  viewAllPath,
  parties,
  actionLabel,
}: {
  badge: string;
  title: string;
  description: string;
  viewAllPath: string;
  parties: WaitingParty[];
  actionLabel: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-900/5 sm:px-7 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand-main">
            <Icon icon="solar:users-group-rounded-bold" className="h-4 w-4" />
            {badge}
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <Link
          to={viewAllPath}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-slate-50"
        >
          전체보기
          <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {parties.map((party) => (
          <RecruitPartyCard
            key={party.id}
            party={party}
            actionLabel={actionLabel}
          />
        ))}
      </div>

      {parties.length === 0 && (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
            <Icon
              icon="solar:document-text-search-bold"
              className="h-7 w-7 text-brand-main"
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
    </section>
  );
}

console.log(useAuthStore.getState());

export default function HomePage() {
  const [selectedOtt, setSelectedOtt] = useState<OttType>("유튜브");

  const selectedOttService =
    ottServices.find((service) => service.name === selectedOtt) ??
    ottServices[0];

  const hostParties = hostPreviewParties;
  const memberParties = memberPreviewParties;

  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5">
          <div className="bg-linear-to-br from-blue-50 via-sky-50 to-teal-50 px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-brand-main">
                  <span className="h-2 w-2 rounded-full bg-brand-accent" />
                  원하는 OTT를 먼저 선택해보세요
                </div>

                <div>
                  <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                    이용할 OTT를 고르고
                    <br />
                    빠르게 시작해보세요
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    파티 생성이나 참여를 빠르게 시작할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="-mx-5 overflow-x-auto px-5 sm:-mx-7 sm:px-7 lg:-mx-8 lg:px-8 no-scrollbar">
                <div className="flex min-w-max gap-3">
                  {ottServices.map((service) => {
                    const isSelected = selectedOtt === service.name;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedOtt(service.name)}
                        className={[
                          "h-36 w-40 shrink-0 rounded-3xl border p-3 text-left transition",
                          isSelected
                            ? "border-brand-main bg-linear-to-br from-blue-50 to-teal-50 shadow-md shadow-blue-900/10"
                            : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-2">
                            {renderOttLogo({
                              image: service.image,
                              alt: service.name,
                              slug: service.slug,
                              defaultImageClassName:
                                service.imageClassName ??
                                "h-6 w-6 object-contain",
                              outerClassName: [
                                "h-10 w-10 shrink-0",
                                isSelected ? "bg-white" : "bg-slate-50",
                              ].join(" "),
                            })}

                            {isSelected && (
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-main">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="h-3.5 w-3.5 text-white"
                                />
                              </span>
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {service.name}
                            </p>

                            <p className="mt-1.5 line-clamp-2 text-xs leading-4 text-slate-500">
                              {service.subtitle}
                            </p>

                            <p className="mt-2.5 text-xs font-semibold text-teal-700">
                              {service.price}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Link
                to={getPartyCreatePath(selectedOttService.slug)}
                className="group rounded-3xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur-sm transition hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {renderOttLogo({
                      image: selectedOttService.image,
                      alt: selectedOttService.name,
                      slug: selectedOttService.slug,
                      defaultImageClassName:
                        selectedOttService.imageClassName ??
                        "h-5 w-5 object-contain",
                      outerClassName: "h-10 w-10 shrink-0",
                    })}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">
                        현재 선택한 OTT
                      </p>
                      <p className="truncate text-sm font-bold text-slate-900">
                        {selectedOttService.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-main">
                    <span>서비스 시작하기</span>
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="h-5 w-5 transition group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <RecruitSection
          badge="파티장 모집중"
          title="파티장을 찾고 있는 파티"
          description="기존 운영 공백으로 비어 있는 파티장 모집 현황만 모아봤어요."
          viewAllPath={getPartyRecruitListPath("HOST")}
          parties={hostParties}
          actionLabel="파티장 참여"
        />

        <RecruitSection
          badge="파티원 모집중"
          title="지금 참여 가능한 파티"
          description="현재 바로 참여할 수 있는 파티원 모집 현황만 모아봤어요."
          viewAllPath={getPartyRecruitListPath("MEMBER")}
          parties={memberParties}
          actionLabel="파티원 참여"
        />

        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-lg shadow-slate-900/5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
              <Icon icon="solar:calendar-bold" className="h-4 w-4" />월 이용권
              기반 운영 방식
            </div>

            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Submate는 이렇게 운영됩니다
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  결제일 기준 1개월 이용
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  오늘 결제하면 다음 결제일 전날까지 이용할 수 있는 월 이용권
                  방식입니다.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  해지해도 남은 기간 사용
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  다음 달에는 이용하지 않더라도 이미 결제한 기간은 끝까지 사용할
                  수 있습니다.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  빈자리는 새 인원으로 모집
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  파티장 또는 파티원이 빠지면 빈자리를 새로운 모집으로 채워
                  파티를 계속 운영합니다.
                </p>
              </div>
            </div>

            <div className="mt-1">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-main transition hover:text-blue-700"
              >
                서비스 소개 자세히 보기
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
