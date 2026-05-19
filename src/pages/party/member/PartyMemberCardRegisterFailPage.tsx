import { Icon } from "@iconify/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getRedirectFromSearchParams,
  withRedirect,
} from "@/pages/party/vacancy/vacancyFlow";

export default function PartyMemberCardRegisterFailPage() {
  const { productId = "" } = useParams();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code") ?? "";
  const redirectPath = getRedirectFromSearchParams(searchParams);
  const message =
    searchParams.get("message") ?? "카드 등록이 취소되었거나 실패했습니다.";

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[520px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white text-center shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="px-6 py-10 sm:px-8">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
              <Icon icon="solar:close-circle-bold" className="h-10 w-10" />
            </div>

            <div className="mt-6">
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 ring-1 ring-rose-100">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                카드 등록
              </div>

              <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[30px]">
                카드 등록에 실패했습니다
              </h1>

              <p className="mt-3 text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                {message}
              </p>
            </div>

            {code ? (
              <div className="mt-6 rounded-[24px] bg-slate-50 px-4 py-4 text-left ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-400">오류 코드</p>
                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  {code}
                </p>
              </div>
            ) : null}

            <div className="mt-7 grid gap-3">
              <Link
                to={
                  productId
                    ? withRedirect(
                        `/party/create/${productId}/member/card-register`,
                        redirectPath,
                      )
                    : "/parties/members"
                }
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#14B8A6] text-[15px] font-bold text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-[#0D9488]"
              >
                다시 등록하기
                <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
              </Link>

              <Link
                to="/parties/members"
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-white text-[15px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
              >
                파티 목록으로 이동
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
