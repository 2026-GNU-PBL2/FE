const settingItems = [
  {
    id: 1,
    title: "알림 설정",
    description: "결제일, 파티 변경, 이벤트 혜택 알림을 관리합니다.",
  },
  {
    id: 2,
    title: "마케팅 수신 동의",
    description: "이벤트 및 혜택 정보를 받아볼지 설정합니다.",
  },
  {
    id: 3,
    title: "서비스 이용 설정",
    description: "자동결제, 기본 결제 방식 등의 선호도를 관리합니다.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {settingItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-[18px] bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              관리하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
