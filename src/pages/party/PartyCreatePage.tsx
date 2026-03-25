// src/pages/party/PartyCreatePage.tsx

import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import { getOttDetail } from "@/mocks/ott";

export default function PartyCreatePage() {
  const { ottSlug = "" } = useParams();

  const ottDetail = getOttDetail(ottSlug);

  if (!ottDetail) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Icon
                icon="solar:danger-circle-bold"
                className="h-7 w-7 text-slate-500"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              페이지를 찾을 수 없습니다
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              아직 준비되지 않은 OTT이거나 잘못된 경로입니다.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-blue-900 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 원형 대상
  const isRounded =
    ottDetail.slug === "netflix" ||
    ottDetail.slug === "tving" ||
    ottDetail.slug === "disney-plus";

  const originalPrice = ottDetail.originalPriceText;
  const finalPrice = ottDetail.platformPriceText;
  const priceCards = ottDetail.priceCards ?? [];
  const splitPrice = priceCards[1]?.value ?? "9,000원";
  const feeText = priceCards[2]?.helper ?? "수수료 포함";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="flex items-start gap-4">
            {/* 🔥 OTT 로고 영역 (수정됨) */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-slate-100">
              {isRounded ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
                    <img
                      src={ottDetail.image}
                      alt={ottDetail.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={ottDetail.image}
                  alt={ottDetail.name}
                  className={
                    ottDetail.imageClassName ?? "h-10 w-10 object-contain"
                  }
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
                {ottDetail.badge}
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {ottDetail.name}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                프리미엄 · 최고화질 · 3인 파티
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-3xl bg-slate-50 p-5 sm:p-6">
            <p className="text-sm font-semibold text-slate-500">월 결제 금액</p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {finalPrice}
              </span>
              <span className="pb-1 text-sm font-medium text-slate-400">
                / 월
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-400 line-through">
                {originalPrice}
              </span>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-700">
                3인 분담
              </span>
              <span className="text-slate-500">{feeText}</span>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon icon="solar:wallet-money-linear" className="h-4 w-4" />
              정가
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
              {originalPrice}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon
                icon="solar:users-group-rounded-linear"
                className="h-4 w-4"
              />
              1인 분담금
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
              {splitPrice}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon icon="solar:ticket-linear" className="h-4 w-4" />
              최종 금액
            </div>
            <p className="mt-3 text-xl font-bold text-blue-900 sm:text-2xl">
              {finalPrice}
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">핵심 정보</h2>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">이용 상품</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                넷플릭스 프리미엄
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">파티 인원</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                3인 파티
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">결제 방식</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                월 이용권 결제
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">운영 방식</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                플랫폼 자동 정산
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 pb-2">
          <button className="inline-flex h-13 w-full items-center justify-center rounded-2xl bg-blue-900 px-6 text-base font-semibold text-white transition hover:bg-blue-800">
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
