import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type AdminUserRole = "CUSTOMER" | "ADMIN" | string;

type AdminUserStatus =
  | "PENDING_SIGNUP"
  | "ACTIVE"
  | "INACTIVE"
  | "DELETED"
  | string;

type AdminUser = {
  userId: number;
  displayUserId: string;
  nickname: string;
  email: string;
  phoneNumber: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

function unwrapResponse<T>(
  value: T | ApiEnvelope<T> | undefined | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null) {
    const maybeEnvelope = value as ApiEnvelope<T>;

    if (maybeEnvelope.data) return maybeEnvelope.data;
    if (maybeEnvelope.result) return maybeEnvelope.result;
    if (maybeEnvelope.payload) return maybeEnvelope.payload;
  }

  return value as T;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getRoleLabel(role: AdminUserRole) {
  switch (role) {
    case "CUSTOMER":
      return "일반 회원";
    case "ADMIN":
      return "관리자";
    default:
      return role || "-";
  }
}

function getRoleClassName(role: AdminUserRole) {
  switch (role) {
    case "ADMIN":
      return "bg-[#1E3A8A]/10 text-[#1E3A8A] ring-[#1E3A8A]/15";
    case "CUSTOMER":
      return "bg-[#38BDF8]/10 text-sky-700 ring-[#38BDF8]/20";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getStatusLabel(status: AdminUserStatus) {
  switch (status) {
    case "PENDING_SIGNUP":
      return "회원가입 진행 중";
    case "ACTIVE":
      return "이용중";
    case "INACTIVE":
      return "비활성";
    case "DELETED":
      return "탈퇴";
    default:
      return status || "-";
  }
}

function getStatusClassName(status: AdminUserStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-[#2DD4BF]/10 text-teal-700 ring-[#2DD4BF]/20";
    case "PENDING_SIGNUP":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "INACTIVE":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case "DELETED":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export default function AdminUserListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalCount = users.length;

  const activeCount = useMemo(
    () => users.filter((user) => user.status === "ACTIVE").length,
    [users],
  );

  const pendingCount = useMemo(
    () => users.filter((user) => user.status === "PENDING_SIGNUP").length,
    [users],
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchAdminUsers() {
      try {
        setIsLoading(true);

        const response = await api.get<AdminUser[] | ApiEnvelope<AdminUser[]>>(
          "/api/v1/admin/users",
        );

        const data = unwrapResponse<AdminUser[]>(response.data);

        if (!isMounted) return;

        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("회원 목록을 불러오지 못했습니다.");

        if (isMounted) {
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAdminUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">전체 회원</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalCount.toLocaleString()}명
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">이용중</p>
          <p className="mt-2 text-2xl font-bold text-[#1E3A8A]">
            {activeCount.toLocaleString()}명
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-sm font-medium text-slate-500">가입 진행 중</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {pendingCount.toLocaleString()}명
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">회원 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              관리자 페이지에서 전체 회원 정보를 조회합니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Icon icon="line-md:loading-twotone-loop" className="h-5 w-5" />
              회원 목록을 불러오는 중입니다.
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Icon
                icon="solar:users-group-rounded-outline"
                className="h-7 w-7 text-slate-400"
              />
            </div>
            <p className="mt-4 font-semibold text-slate-900">
              조회된 회원이 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              회원이 가입하면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[1.7fr_1.5fr_1fr_1.1fr_1fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <span>회원</span>
                <span>연락처</span>
                <span>역할</span>
                <span>상태</span>
                <span>가입일</span>
                <span>상세</span>
              </div>

              {users.map((user) => (
                <div
                  key={user.userId}
                  className="grid grid-cols-[1.7fr_1.5fr_1fr_1.1fr_1fr_0.7fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm transition hover:bg-slate-50/80 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {user.nickname || "-"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.displayUserId || user.userId}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-slate-700">
                      {user.email || "-"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.phoneNumber || "-"}
                    </p>
                  </div>

                  <div>
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                        getRoleClassName(user.role),
                      ].join(" ")}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  <div>
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                        getStatusClassName(user.status),
                      ].join(" ")}
                    >
                      {getStatusLabel(user.status)}
                    </span>
                  </div>

                  <div className="text-slate-600">
                    {formatDateTime(user.createdAt)}
                  </div>

                  <div>
                    <Link
                      to={`/admin/users/${user.userId}`}
                      className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#38BDF8]/60 hover:bg-[#38BDF8]/5 hover:text-[#1E3A8A]"
                    >
                      보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
