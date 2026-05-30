export type EventStatus = "진행중" | "예정" | "종료임박";

export type EventItem = {
  id: number;
  title: string;
  description: string;
  reward: string;
  condition: string;
  period: string;
  status: EventStatus;
  image: string;
  icon: string;
  detailTitle: string;
  detailDescription: string;
  steps: string[];
  notices: string[];
};

export const events: EventItem[] = [
  {
    id: 1,
    title: "첫 이용 고객 플랫폼 머니 지급",
    description:
      "처음 파티에 참여하거나 파티를 생성하면 플랫폼 머니를 지급합니다.",
    reward: "10,000원",
    condition: "첫 파티 참여 또는 첫 파티 생성",
    period: "2026.03.25 - 2026.04.30",
    status: "진행중",
    image: "/images/events/event-welcome.png",
    icon: "solar:confetti-minimalistic-bold-duotone",
    detailTitle: "Submate 첫 이용을 시작하면 리워드를 드립니다",
    detailDescription:
      "처음으로 파티원 참여를 완료하거나 파티장으로 파티를 생성한 고객에게 플랫폼 머니를 지급하는 웰컴 이벤트입니다.",
    steps: [
      "Submate에 가입하고 기본 정보를 설정합니다.",
      "파티원으로 참여하거나 파티장으로 파티를 생성합니다.",
      "참여 또는 생성 완료 후 리워드 지급 대상 여부가 확인됩니다.",
    ],
    notices: [
      "계정당 1회만 지급됩니다.",
      "이벤트 기간 내 완료된 참여 또는 생성 건만 대상입니다.",
      "부정 참여가 확인되면 지급이 취소될 수 있습니다.",
    ],
  },
  {
    id: 2,
    title: "친구 초대 리워드",
    description:
      "친구가 초대 링크로 가입하고 첫 참여를 완료하면 양쪽 모두 리워드를 받습니다.",
    reward: "5,000원",
    condition: "초대받은 친구의 첫 참여 완료",
    period: "상시",
    status: "진행중",
    image: "/images/events/event-invite.png",
    icon: "solar:share-circle-bold-duotone",
    detailTitle: "친구와 함께 시작하면 둘 다 리워드를 받습니다",
    detailDescription:
      "내 초대 링크로 가입한 친구가 첫 파티 참여를 완료하면 초대한 사람과 친구 모두에게 플랫폼 머니를 지급합니다.",
    steps: [
      "내 초대 링크를 친구에게 공유합니다.",
      "친구가 초대 링크로 가입합니다.",
      "친구가 첫 파티 참여를 완료하면 양쪽 리워드가 지급됩니다.",
    ],
    notices: [
      "초대 링크를 통한 가입만 인정됩니다.",
      "동일인 또는 중복 계정 초대는 지급 대상에서 제외됩니다.",
      "친구의 첫 참여가 취소되면 리워드 지급도 취소될 수 있습니다.",
    ],
  },
  {
    id: 3,
    title: "파티장 첫 정산 보너스",
    description:
      "첫 정산까지 정상적으로 완료한 파티장에게 운영 시작 보너스를 지급합니다.",
    reward: "3,000원",
    condition: "첫 파티 운영 및 정산 완료",
    period: "2026.03.25 - 2026.04.15",
    status: "예정",
    image: "/images/events/event-host.png",
    icon: "solar:crown-star-bold-duotone",
    detailTitle: "첫 정산까지 운영한 파티장에게 보너스를 드립니다",
    detailDescription:
      "파티장으로 첫 파티를 운영하고 정산까지 정상 완료하면 운영 시작 보너스를 지급합니다.",
    steps: [
      "파티장으로 참여하거나 새 파티를 생성합니다.",
      "파티원 모집과 이용 정보 등록을 완료합니다.",
      "첫 정산이 정상 완료되면 보너스 지급 대상이 됩니다.",
    ],
    notices: [
      "정산 계좌 등록이 완료되어야 합니다.",
      "파티 해체 또는 운영 위반 이력이 있으면 제외될 수 있습니다.",
      "정산 완료 시점 기준으로 대상 여부를 판단합니다.",
    ],
  },
  {
    id: 4,
    title: "자동결제 등록 혜택",
    description:
      "파티원이 자동결제 등록을 완료하면 다음 결제 주기에 사용할 머니를 지급합니다.",
    reward: "10,000원",
    condition: "자동결제 카드 등록 완료",
    period: "2026.03.25 - 2026.04.10",
    status: "종료임박",
    image: "/images/events/event-billing.png",
    icon: "solar:card-transfer-bold-duotone",
    detailTitle: "자동결제 등록을 완료하면 추가 혜택을 드립니다",
    detailDescription:
      "파티원 참여 과정에서 자동결제 카드를 등록하고 참여를 완료하면 다음 결제 주기에 사용할 수 있는 플랫폼 머니를 지급합니다.",
    steps: [
      "파티원으로 참여할 파티를 선택합니다.",
      "자동결제 약관에 동의하고 결제 카드를 등록합니다.",
      "참여가 완료되면 리워드 지급 대상 여부가 확인됩니다.",
    ],
    notices: [
      "카드 등록만 하고 참여가 완료되지 않으면 지급되지 않습니다.",
      "결제 실패 또는 참여 취소 시 리워드가 회수될 수 있습니다.",
      "이벤트 기간 내 최초 등록 건만 대상입니다.",
    ],
  },
];

export function getStatusClassName(status: EventStatus) {
  if (status === "진행중") {
    return "bg-emerald-50 text-[#00875A] ring-[#A9E6C9]";
  }

  if (status === "예정") {
    return "bg-blue-50 text-brand-main ring-blue-100";
  }

  return "bg-amber-50 text-amber-700 ring-amber-100";
}
