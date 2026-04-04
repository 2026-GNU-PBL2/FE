export type AdminProductStatus = "ACTIVE" | "INACTIVE";
export type AdminOperationType = "ACCOUNT_SHARE" | "INVITE";
export type AdminUserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type AdminUserRole = "CUSTOMER" | "HOST" | "ADMIN";
export type AdminPartyStatus = "RECRUITING" | "FULL" | "PAUSED" | "ENDED";

export type AdminProduct = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: AdminOperationType;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: AdminProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductCreateRequest = {
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: AdminOperationType;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
};

export type AdminProductUpdateRequest = {
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
  totalPayments: number;
  ownedPartyCount: number;
};

export type AdminPartyMember = {
  id: string;
  name: string;
  role: "HOST" | "MEMBER";
  paymentStatus: "PAID" | "PENDING" | "FAILED";
};

export type AdminParty = {
  id: string;
  productId: string;
  productName: string;
  hostUserId: string;
  hostName: string;
  currentMembers: number;
  maxMembers: number;
  monthlyAmount: number;
  status: AdminPartyStatus;
  nextSettlementDate: string;
  createdAt: string;
  members: AdminPartyMember[];
};

export type AdminRecentEvent = {
  id: string;
  type: "PRODUCT" | "USER" | "PARTY" | "PAYMENT";
  title: string;
  actor: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  time: string;
};

type AdminSeedData = {
  products: AdminProduct[];
  users: AdminUser[];
  parties: AdminParty[];
  events: AdminRecentEvent[];
};

const STORAGE_KEY = "submate-admin-mock-db";

function nowIso() {
  return new Date().toISOString();
}

function createSeedData(): AdminSeedData {
  const products: AdminProduct[] = [
    {
      id: "PDT-001",
      serviceName: "넷플릭스 프리미엄",
      description:
        "가장 수요가 높은 대표 상품입니다. 4인 파티 기준으로 운영되는 프리미엄 플랜입니다.",
      thumbnailUrl: "",
      operationType: "ACCOUNT_SHARE",
      maxMemberCount: 4,
      basePrice: 17000,
      pricePerMember: 4250,
      status: "ACTIVE",
      createdAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-30T13:20:00.000Z",
    },
    {
      id: "PDT-002",
      serviceName: "유튜브 프리미엄 패밀리",
      description:
        "광고 제거 수요가 높아 신규 유입이 빠른 상품입니다. 5인 기준 파티 운영입니다.",
      thumbnailUrl: "",
      operationType: "INVITE",
      maxMemberCount: 5,
      basePrice: 14900,
      pricePerMember: 2980,
      status: "ACTIVE",
      createdAt: "2026-03-18T09:00:00.000Z",
      updatedAt: "2026-03-29T09:30:00.000Z",
    },
    {
      id: "PDT-003",
      serviceName: "디즈니 플러스 스탠다드",
      description:
        "가족 단위 수요가 꾸준한 상품입니다. 현재 신규 파티 모집에 사용됩니다.",
      thumbnailUrl: "",
      operationType: "ACCOUNT_SHARE",
      maxMemberCount: 4,
      basePrice: 9900,
      pricePerMember: 2475,
      status: "ACTIVE",
      createdAt: "2026-03-15T08:30:00.000Z",
      updatedAt: "2026-03-28T19:00:00.000Z",
    },
    {
      id: "PDT-004",
      serviceName: "티빙 스탠다드",
      description:
        "국내 예능/드라마 수요 대응용 상품입니다. 테스트용 비활성 상태입니다.",
      thumbnailUrl: "",
      operationType: "ACCOUNT_SHARE",
      maxMemberCount: 4,
      basePrice: 13500,
      pricePerMember: 3375,
      status: "INACTIVE",
      createdAt: "2026-03-12T11:00:00.000Z",
      updatedAt: "2026-03-26T14:40:00.000Z",
    },
  ];

  const users: AdminUser[] = [
    {
      id: "USR-001",
      name: "김하진",
      email: "hajin@example.com",
      phone: "010-2222-1111",
      role: "HOST",
      status: "ACTIVE",
      joinedAt: "2026-03-18T13:00:00.000Z",
      totalPayments: 68400,
      ownedPartyCount: 2,
    },
    {
      id: "USR-002",
      name: "박민수",
      email: "minsuu@example.com",
      phone: "010-3333-2222",
      role: "CUSTOMER",
      status: "ACTIVE",
      joinedAt: "2026-03-20T14:20:00.000Z",
      totalPayments: 29800,
      ownedPartyCount: 0,
    },
    {
      id: "USR-003",
      name: "이지원",
      email: "jiwon@example.com",
      phone: "010-4444-9999",
      role: "CUSTOMER",
      status: "PENDING",
      joinedAt: "2026-03-29T09:40:00.000Z",
      totalPayments: 0,
      ownedPartyCount: 0,
    },
    {
      id: "USR-004",
      name: "정도윤",
      email: "doyoon@example.com",
      phone: "010-7777-1212",
      role: "HOST",
      status: "ACTIVE",
      joinedAt: "2026-03-19T12:20:00.000Z",
      totalPayments: 45100,
      ownedPartyCount: 1,
    },
    {
      id: "USR-005",
      name: "한세라",
      email: "sera@example.com",
      phone: "010-1212-8989",
      role: "CUSTOMER",
      status: "SUSPENDED",
      joinedAt: "2026-03-16T15:00:00.000Z",
      totalPayments: 12900,
      ownedPartyCount: 0,
    },
  ];

  const parties: AdminParty[] = [
    {
      id: "PTY-001",
      productId: "PDT-001",
      productName: "넷플릭스 프리미엄",
      hostUserId: "USR-001",
      hostName: "김하진",
      currentMembers: 3,
      maxMembers: 4,
      monthlyAmount: 4250,
      status: "RECRUITING",
      nextSettlementDate: "2026-04-05T00:00:00.000Z",
      createdAt: "2026-03-22T10:00:00.000Z",
      members: [
        {
          id: "USR-001",
          name: "김하진",
          role: "HOST",
          paymentStatus: "PAID",
        },
        {
          id: "USR-002",
          name: "박민수",
          role: "MEMBER",
          paymentStatus: "PAID",
        },
        {
          id: "USR-003",
          name: "이지원",
          role: "MEMBER",
          paymentStatus: "PENDING",
        },
      ],
    },
    {
      id: "PTY-002",
      productId: "PDT-002",
      productName: "유튜브 프리미엄 패밀리",
      hostUserId: "USR-004",
      hostName: "정도윤",
      currentMembers: 5,
      maxMembers: 5,
      monthlyAmount: 2980,
      status: "FULL",
      nextSettlementDate: "2026-04-08T00:00:00.000Z",
      createdAt: "2026-03-24T10:40:00.000Z",
      members: [
        {
          id: "USR-004",
          name: "정도윤",
          role: "HOST",
          paymentStatus: "PAID",
        },
        {
          id: "USR-002",
          name: "박민수",
          role: "MEMBER",
          paymentStatus: "PAID",
        },
        {
          id: "USR-005",
          name: "한세라",
          role: "MEMBER",
          paymentStatus: "FAILED",
        },
        {
          id: "USR-001",
          name: "김하진",
          role: "MEMBER",
          paymentStatus: "PAID",
        },
        {
          id: "USR-003",
          name: "이지원",
          role: "MEMBER",
          paymentStatus: "PENDING",
        },
      ],
    },
    {
      id: "PTY-003",
      productId: "PDT-003",
      productName: "디즈니 플러스 스탠다드",
      hostUserId: "USR-001",
      hostName: "김하진",
      currentMembers: 2,
      maxMembers: 4,
      monthlyAmount: 2475,
      status: "PAUSED",
      nextSettlementDate: "2026-04-10T00:00:00.000Z",
      createdAt: "2026-03-27T16:00:00.000Z",
      members: [
        {
          id: "USR-001",
          name: "김하진",
          role: "HOST",
          paymentStatus: "PAID",
        },
        {
          id: "USR-002",
          name: "박민수",
          role: "MEMBER",
          paymentStatus: "FAILED",
        },
      ],
    },
  ];

  const events: AdminRecentEvent[] = [
    {
      id: "EVT-001",
      type: "PARTY",
      title: "미입금 파티원이 있는 파티가 2건 있습니다.",
      actor: "정산 모니터링",
      status: "WARNING",
      time: "오늘 · 오전 11:25",
    },
    {
      id: "EVT-002",
      type: "PRODUCT",
      title: "디즈니 플러스 상품 정보가 수정되었습니다.",
      actor: "관리자",
      status: "SUCCESS",
      time: "오늘 · 오전 09:54",
    },
    {
      id: "EVT-003",
      type: "USER",
      title: "정지 회원 1건에 대한 검토가 필요합니다.",
      actor: "회원 관리",
      status: "WARNING",
      time: "오늘 · 오전 08:39",
    },
    {
      id: "EVT-004",
      type: "PAYMENT",
      title: "실패 결제 4건이 감지되었습니다.",
      actor: "결제 모니터링",
      status: "FAILED",
      time: "오늘 · 오전 07:12",
    },
  ];

  return {
    products,
    users,
    parties,
    events,
  };
}

function ensureData(): AdminSeedData {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (!existing) {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  return JSON.parse(existing) as AdminSeedData;
}

function saveData(data: AdminSeedData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAdminMockData() {
  const seed = createSeedData();
  saveData(seed);
}

export function getAdminDb() {
  return ensureData();
}

export function getDashboardSummary() {
  const db = ensureData();

  const activeProducts = db.products.filter(
    (product) => product.status === "ACTIVE",
  ).length;

  const activeUsers = db.users.filter(
    (user) => user.status === "ACTIVE",
  ).length;

  const recruitingParties = db.parties.filter(
    (party) => party.status === "RECRUITING",
  ).length;

  const pendingUsers = db.users.filter(
    (user) => user.status === "PENDING",
  ).length;

  const failedPayments = db.parties.reduce((acc, party) => {
    return (
      acc +
      party.members.filter((member) => member.paymentStatus === "FAILED").length
    );
  }, 0);

  return {
    totalProducts: db.products.length,
    activeProducts,
    totalUsers: db.users.length,
    activeUsers,
    totalParties: db.parties.length,
    recruitingParties,
    pendingUsers,
    failedPayments,
    recentEvents: db.events,
  };
}

export function getAdminProducts() {
  const db = ensureData();
  return [...db.products].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getAdminProductsResponseMock() {
  return getAdminProducts();
}

export function getAdminProductById(productId: string) {
  const db = ensureData();
  return db.products.find((product) => product.id === productId) ?? null;
}

export function getAdminProductDetailResponseMock(productId: string) {
  const product = getAdminProductById(productId);

  if (!product) {
    return [];
  }

  return [product];
}

export function createAdminProduct(payload: AdminProductCreateRequest) {
  const db = ensureData();

  const newProduct: AdminProduct = {
    id: `PDT-${String(db.products.length + 1).padStart(3, "0")}`,
    serviceName: payload.serviceName,
    description: payload.description,
    thumbnailUrl: payload.thumbnailUrl,
    operationType: payload.operationType,
    maxMemberCount: payload.maxMemberCount,
    basePrice: payload.basePrice,
    pricePerMember: payload.pricePerMember,
    status: "ACTIVE",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  db.products.unshift(newProduct);
  db.events.unshift({
    id: `EVT-${Date.now()}`,
    type: "PRODUCT",
    title: `${newProduct.serviceName} 상품이 새로 등록되었습니다.`,
    actor: "관리자",
    status: "SUCCESS",
    time: "방금 전",
  });

  saveData(db);
  return newProduct;
}

export function updateAdminProduct(
  productId: string,
  payload: AdminProductUpdateRequest,
) {
  const db = ensureData();
  const existingIndex = db.products.findIndex((item) => item.id === productId);

  if (existingIndex < 0) {
    return null;
  }

  const current = db.products[existingIndex];

  db.products[existingIndex] = {
    ...current,
    serviceName: payload.serviceName,
    description: payload.description,
    thumbnailUrl: payload.thumbnailUrl,
    maxMemberCount: payload.maxMemberCount,
    basePrice: payload.basePrice,
    pricePerMember: payload.pricePerMember,
    updatedAt: nowIso(),
  };

  db.events.unshift({
    id: `EVT-${Date.now()}`,
    type: "PRODUCT",
    title: `${db.products[existingIndex].serviceName} 상품 정보가 수정되었습니다.`,
    actor: "관리자",
    status: "SUCCESS",
    time: "방금 전",
  });

  saveData(db);
  return db.products[existingIndex];
}

export function deleteAdminProduct(productId: string) {
  const db = ensureData();
  db.products = db.products.filter((product) => product.id !== productId);
  saveData(db);
}

export function getAdminUsers() {
  const db = ensureData();
  return [...db.users].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

export function getAdminUserById(userId: string) {
  const db = ensureData();
  return db.users.find((user) => user.id === userId) ?? null;
}

export function getUserOwnedParties(userId: string) {
  const db = ensureData();
  return db.parties.filter((party) => party.hostUserId === userId);
}

export function getAdminParties() {
  const db = ensureData();
  return [...db.parties].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAdminPartyById(partyId: string) {
  const db = ensureData();
  return db.parties.find((party) => party.id === partyId) ?? null;
}

export function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "운영 중";
    case "INACTIVE":
      return "비활성";
    case "PENDING":
      return "대기";
    case "SUSPENDED":
      return "정지";
    case "RECRUITING":
      return "모집 중";
    case "FULL":
      return "모집 완료";
    case "PAUSED":
      return "일시 중지";
    case "ENDED":
      return "종료";
    case "PAID":
      return "결제 완료";
    case "FAILED":
      return "결제 실패";
    case "SUCCESS":
      return "성공";
    case "WARNING":
      return "주의";
    default:
      return "보류";
  }
}

export function getStatusClassName(status: string) {
  switch (status) {
    case "ACTIVE":
    case "PAID":
    case "SUCCESS":
    case "FULL":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "INACTIVE":
    case "ENDED":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    case "PENDING":
    case "RECRUITING":
    case "WARNING":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "FAILED":
    case "SUSPENDED":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
    case "PAUSED":
      return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export function getOperationTypeLabel(operationType: string) {
  switch (operationType) {
    case "ACCOUNT_SHARE":
      return "계정 공유형";
    case "INVITE":
      return "초대형";
    default:
      return operationType || "-";
  }
}

export function getOperationTypeClassName(operationType: string) {
  switch (operationType) {
    case "ACCOUNT_SHARE":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200";
    case "INVITE":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}
