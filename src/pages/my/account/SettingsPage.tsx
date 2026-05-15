import { Icon } from "@iconify/react";

const settingItems = [
  {
    id: 1,
    title: "알림 설정",
    description: "결제일, 파티 변경, 이벤트 혜택 알림을 관리합니다.",
    icon: "solar:bell-bing-bold",
    enabled: true,
  },
  {
    id: 2,
    title: "마케팅 수신 동의",
    description: "이벤트 및 혜택 정보를 받아볼지 설정합니다.",
    icon: "solar:letter-bold",
    enabled: false,
  },
  {
    id: 3,
    title: "서비스 이용 설정",
    description: "자동결제, 기본 결제 방식 등의 선호도를 관리합니다.",
    icon: "solar:settings-bold",
    enabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
      <div className="divide-y divide-slate-100">
        {settingItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-5 transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-100">
              <Icon icon={item.icon} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-base font-extrabold text-slate-950">
                {item.title}
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              aria-pressed={item.enabled}
              className={[
                "relative h-7 w-12 shrink-0 rounded-full transition",
                item.enabled ? "bg-slate-900" : "bg-slate-200",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
                  item.enabled ? "left-6" : "left-1",
                ].join(" ")}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
