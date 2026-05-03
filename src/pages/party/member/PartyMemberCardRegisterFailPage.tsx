import { Icon } from "@iconify/react";
import { Link, useParams, useSearchParams } from "react-router-dom";

export default function PartyMemberCardRegisterFailPage() {
  const { productId = "" } = useParams();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code") ?? "";
  const message =
    searchParams.get("message") ?? "카드 등록이 취소되었거나 실패했습니다.";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-120 items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white px-5 py-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.22)] sm:px-8 sm:py-8">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Icon icon="solar:close-circle-bold" className="h-9 w-9" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-semibold tracking-[0.14em] text-rose-500">
              BILLING FAILED
            </p>

            <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950 sm:text-[32px]">
              카드 등록에 실패했습니다
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              {message}
            </p>
          </div>

          <div className="mt-8 space-y-3 rounded-[28px] bg-slate-50 px-5 py-5">
            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
                ERROR CODE
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {code || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to={
                productId
                  ? `/party/create/${productId}/member/card-register`
                  : "/party"
              }
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-semibold tracking-tight text-white shadow-[0_18px_36px_-20px_rgba(30,58,138,0.45)] transition-all duration-300 hover:bg-[#1A347B] hover:shadow-[0_22px_42px_-22px_rgba(30,58,138,0.52)]"
            >
              다시 등록하기
            </Link>

            <Link
              to="/party"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold tracking-tight text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
            >
              파티 목록으로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
