// src/api/mockServer.ts

type DashboardData = {
  summary: {
    totalMonthlySpend: number;
    yearlySpend: number;
    activeSubs: number;
    rewardPoints: number;
    deltaFromLastMonth: number;
  };
  lineData: { month: string; amount: number }[];
  pieData: { name: string; value: number; color: string }[];
  subscriptions: {
    name: string;
    category: string;
    cost: number;
    date: string;
    icon: string;
  }[];
};

type SmartSwapData = {
  hero: {
    title: string;
    subtitle: string;
    savePerMonth: number;
    matchRateUp: number;
    newTitles: number;
    yearlySave: number;
  };
  radarData: {
    subject: string;
    A: number;
    B: number;
    C: number;
    fullMark: number;
  }[];
  otherRecs: {
    name: string;
    match: number;
    save: number;
    tag: string;
    color: "blue" | "slate" | "indigo";
  }[];
};

type PartyData = {
  header: {
    title: string;
    plan: string;
    nextPaymentDate: string;
    myShare: number;
  };
  members: {
    name: string;
    role: "Leader" | "Member";
    status: "Paid" | "Pending";
    time: string;
    amount: number;
    initials: string;
    color: string;
  }[];
  history: {
    date: string;
    status: "Complete" | "Failed";
    participants: number;
    amount: number;
  }[];
  lastSyncedLabel: string;
};

type ChallengeData = {
  challenge: {
    startDateISO: string;
    currentMonth: number;
    monthlyAmount: number;
  };
  paymentHistory: {
    id: number;
    month: number;
    date: string;
    amount: number;
    status: "Paid" | "Pending";
    method: string;
  }[];
  // ✅ saved(누적 적립 금액)만 유지
  benefitChart: { month: string; saved: number }[];
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockServer = {
  async getDashboard(): Promise<DashboardData> {
    await delay(250);

    return {
      summary: {
        totalMonthlySpend: 55700,
        yearlySpend: 670000,
        activeSubs: 5,
        rewardPoints: 12500,
        deltaFromLastMonth: -3000,
      },
      lineData: [
        { month: "Jan", amount: 45000 },
        { month: "Feb", amount: 52000 },
        { month: "Mar", amount: 48000 },
        { month: "Apr", amount: 56000 },
        { month: "May", amount: 51000 },
        { month: "Jun", amount: 49000 },
      ],
      pieData: [
        { name: "OTT", value: 42900, color: "#8b5cf6" },
        { name: "Music", value: 10900, color: "#ec4899" },
        { name: "Cloud", value: 5900, color: "#3b82f6" },
        { name: "Other", value: 8900, color: "#10b981" },
      ],
      subscriptions: [
        {
          name: "Netflix",
          category: "OTT",
          cost: 13500,
          date: "2026-02-15",
          icon: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=50&h=50&fit=crop",
        },
        {
          name: "YouTube Premium",
          category: "OTT",
          cost: 11900,
          date: "2026-02-10",
          icon: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=50&h=50&fit=crop",
        },
        {
          name: "Spotify",
          category: "Music",
          cost: 10900,
          date: "2026-02-20",
          icon: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=50&h=50&fit=crop",
        },
        {
          name: "Disney+",
          category: "OTT",
          cost: 9900,
          date: "2026-02-18",
          icon: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=50&h=50&fit=crop",
        },
        {
          name: "Tving",
          category: "OTT",
          cost: 9500,
          date: "2026-02-12",
          icon: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=50&h=50&fit=crop",
        },
      ],
    };
  },

  async getSmartSwap(): Promise<SmartSwapData> {
    await delay(250);

    return {
      hero: {
        title: "Swap to Disney+ and save",
        subtitle:
          "You prefer Marvel/Hero genres, which have more new releases on Disney+ than Netflix this month.",
        savePerMonth: 3600,
        matchRateUp: 7,
        newTitles: 10,
        yearlySave: 67200,
      },
      radarData: [
        { subject: "Action", A: 100, B: 80, C: 40, fullMark: 100 },
        { subject: "SF/Fantasy", A: 90, B: 70, C: 60, fullMark: 100 },
        { subject: "Romance", A: 30, B: 90, C: 80, fullMark: 100 },
        { subject: "Comedy", A: 40, B: 60, C: 70, fullMark: 100 },
        { subject: "Drama", A: 60, B: 50, C: 90, fullMark: 100 },
        { subject: "Documentary", A: 70, B: 40, C: 50, fullMark: 100 },
      ],
      otherRecs: [
        {
          name: "Disney+",
          match: 95,
          save: 3600,
          tag: "Best for Marvel Fans",
          color: "blue",
        },
        {
          name: "Apple TV+",
          match: 78,
          save: 3600,
          tag: "Sci-Fi Originals",
          color: "slate",
        },
        {
          name: "Wavve",
          match: 72,
          save: 5600,
          tag: "K-Drama & Variety",
          color: "indigo",
        },
      ],
    };
  },

  async oneClickSwap(): Promise<{ ok: true }> {
    await delay(500);
    return { ok: true };
  },

  async getParty(): Promise<PartyData> {
    await delay(250);

    return {
      header: {
        title: "Netflix 4K Premium Party",
        plan: "Premium (Shared by 4)",
        nextPaymentDate: "2026-02-15",
        myShare: 4250,
      },
      lastSyncedLabel: "12:18:59 PM",
      members: [
        {
          name: "Kim Chul-soo",
          role: "Leader",
          status: "Paid",
          time: "2026-02-01 09:15",
          amount: 4250,
          initials: "KC",
          color: "bg-indigo-500",
        },
        {
          name: "Lee Young-hee",
          role: "Member",
          status: "Paid",
          time: "2026-02-01 14:30",
          amount: 4250,
          initials: "LY",
          color: "bg-pink-500",
        },
        {
          name: "Park Min-soo",
          role: "Member",
          status: "Paid",
          time: "2026-02-02 12:18",
          amount: 4250,
          initials: "PM",
          color: "bg-blue-500",
        },
        {
          name: "Jung Su-jin",
          role: "Member",
          status: "Paid",
          time: "2026-02-02 12:18",
          amount: 4250,
          initials: "JS",
          color: "bg-emerald-500",
        },
      ],
      history: [
        {
          date: "2026-01-15",
          status: "Complete",
          participants: 4,
          amount: 17000,
        },
        {
          date: "2025-12-15",
          status: "Complete",
          participants: 4,
          amount: 17000,
        },
        {
          date: "2025-11-15",
          status: "Complete",
          participants: 4,
          amount: 17000,
        },
        {
          date: "2025-10-15",
          status: "Complete",
          participants: 4,
          amount: 17000,
        },
      ],
    };
  },

  async getChallenge(): Promise<ChallengeData> {
    await delay(250);

    const currentMonth = 3;
    const monthlyAmount = 12000;

    // ✅ Start + M1..M{currentMonth} (현재 진행 상황과 1:1로 맞춤)
    const benefitChart: { month: string; saved: number }[] = [
      { month: "Start", saved: 0 },
      ...Array.from({ length: currentMonth }, (_, i) => {
        const m = i + 1;
        return { month: `M${m}`, saved: monthlyAmount * m };
      }),
    ];

    return {
      challenge: {
        startDateISO: new Date(
          new Date().setMonth(new Date().getMonth() - currentMonth),
        ).toISOString(),
        currentMonth,
        monthlyAmount,
      },
      paymentHistory: [
        {
          id: 1,
          month: 3,
          date: "2026-02-01",
          amount: monthlyAmount,
          status: "Paid",
          method: "Kakao Pay",
        },
        {
          id: 2,
          month: 2,
          date: "2026-01-01",
          amount: monthlyAmount,
          status: "Paid",
          method: "Kakao Pay",
        },
        {
          id: 3,
          month: 1,
          date: "2025-12-01",
          amount: monthlyAmount,
          status: "Paid",
          method: "Kakao Pay",
        },
      ],
      benefitChart,
    };
  },
};

export type { DashboardData, SmartSwapData, PartyData, ChallengeData };
