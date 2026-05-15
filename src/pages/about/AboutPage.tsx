import { Icon } from "@iconify/react";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const problemCards = [
  {
    title: "누가 결제했는지 불명확",
    description:
      "공동구독은 함께 쓰지만 실제 결제와 송금은 개인 간 수동 처리라 책임과 흐름이 자주 꼬입니다.",
    icon: "solar:card-bold",
  },
  {
    title: "중도 이탈 시 정산이 복잡",
    description:
      "탈퇴 시점마다 일할 계산과 환불, 남은 인원 재정산이 필요해 운영 피로가 크게 생깁니다.",
    icon: "solar:refresh-circle-bold",
  },
  {
    title: "기록 부재로 분쟁 발생",
    description:
      "결제 성공, 실패, 정산, 운영 이행 같은 이벤트가 남지 않으면 나중에 책임을 따지기 어렵습니다.",
    icon: "solar:document-text-bold",
  },
];

const solutionCards = [
  {
    step: "01",
    title: "파티장은 구독을 운영합니다",
    description:
      "파티장은 실제 OTT를 관리하고, 플랫폼에는 정산 계좌를 등록해 정산을 받는 구조입니다.",
  },
  {
    step: "02",
    title: "파티원은 자동결제로 참여합니다",
    description:
      "파티원은 카드 등록과 자동결제 동의를 거쳐 같은 결제일 기준으로 이용 주기를 공유합니다.",
  },
  {
    step: "03",
    title: "플랫폼이 결제와 정산을 중개합니다",
    description:
      "플랫폼이 결제 상태와 정산 데이터를 관리해 파티 운영을 개인 송금이 아닌 시스템으로 바꿉니다.",
  },
];

const roleCards = [
  {
    role: "파티장",
    summary: "자동결제 대상이 아니라 정산을 받는 운영자",
    points: [
      "정산 계좌 등록이 필요합니다.",
      "파티 생성과 운영 책임을 가집니다.",
      "초대코드 또는 계정공유 방식으로 운영할 수 있습니다.",
      "운영 완료 여부와 상태를 관리합니다.",
    ],
    badgeClassName: "bg-blue-50 text-blue-700 ring-blue-100",
    icon: "solar:crown-bold",
  },
  {
    role: "파티원",
    summary: "자동결제로 참여하는 이용자",
    points: [
      "자동결제 동의와 카드 등록이 필요합니다.",
      "빌링키 발급 후 참여가 완료됩니다.",
      "파티 공통 결제일 기준으로 이용합니다.",
      "결제 성공 시 다음 주기 이용이 유지됩니다.",
    ],
    badgeClassName: "bg-teal-50 text-teal-700 ring-teal-100",
    icon: "solar:user-bold",
  },
];

const highlightStats = [
  {
    label: "역할",
    value: "파티장 / 파티원",
    icon: "solar:users-group-rounded-bold-duotone",
  },
  {
    label: "결제",
    value: "자동결제",
    icon: "solar:card-bold-duotone",
  },
  {
    label: "정산",
    value: "플랫폼 관리",
    icon: "solar:wallet-money-bold-duotone",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function MotionSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-main" />
        {eyebrow}
      </div>

      <div>
        <h2 className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-full bg-brand-bg">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <MotionSection className="overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
          <div className="px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100"
                >
                  <Icon icon="solar:info-circle-bold" className="h-4 w-4" />
                  서비스 소개
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl"
                >
                  공동구독 운영을
                  <br />
                  더 쉽게
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base"
                >
                  Submate는 파티장을 운영자, 파티원을 자동결제 참여자로
                  분리하고, 결제일 기준의 동일한 이용 주기와 정산 흐름을
                  시스템으로 관리합니다. 개인 간 송금과 수동 정산에 의존하던
                  공동구독을 더 안정적으로 운영하기 위한 구조입니다.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                >
                  {highlightStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      animate={{ y: [0, index % 2 === 0 ? -3 : 3, 0] }}
                      transition={{
                        duration: 3.8 + index * 0.35,
                        repeat: Infinity,
                        ease: [0.42, 0, 0.58, 1],
                      }}
                      className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100"
                    >
                      <Icon
                        icon={stat.icon}
                        className="h-5 w-5 text-brand-main"
                      />
                      <p className="mt-2 text-[11px] font-bold text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold text-slate-950">
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-7 flex flex-wrap gap-3"
                >
                  <Link
                    to="/"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-brand-main px-5 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-800 active:scale-95"
                  >
                    홈으로 가기
                  </Link>

                  <Link
                    to="/myparty"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-slate-50 px-5 text-sm font-bold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100 active:scale-95"
                  >
                    나의 파티 보기
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.15,
                }}
                className="relative mx-auto w-full max-w-[420px]"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: [0.42, 0, 0.58, 1],
                  }}
                  className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        핵심 운영 원리
                      </p>
                      <p className="mt-2 text-lg font-extrabold text-slate-950">
                        월 이용권 + 자동결제 + 정산 중개
                      </p>
                    </div>
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-main shadow-sm ring-1 ring-blue-100">
                      <Icon
                        icon="solar:wallet-money-bold"
                        className="h-5 w-5"
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        자동결제
                      </span>
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        파티원만
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        정산 대상
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        파티장
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        결원 처리
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        재모집
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{
                    duration: 5.4,
                    repeat: Infinity,
                    ease: [0.42, 0, 0.58, 1],
                  }}
                  className="absolute -left-2 top-12 rounded-2xl bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"
                >
                  <p className="text-[11px] font-bold text-slate-400">
                    결제 성공
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4"
                      />
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      이용 주기 유지
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: [0.42, 0, 0.58, 1],
                  }}
                  className="absolute -right-2 bottom-4 rounded-2xl bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"
                >
                  <p className="text-[11px] font-bold text-slate-400">
                    정산 상태
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-brand-main">
                      <Icon icon="solar:hand-money-bold" className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      플랫폼 머니 적립
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </MotionSection>

        <MotionSection className="rounded-[32px] bg-white px-5 py-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:px-8 sm:py-8">
          <SectionHeader
            eyebrow="왜 필요한가요"
            title="운영은 생각보다 번거롭습니다"
            description="사람을 모으는 것보다, 그 이후의 결제와 정산을 계속 관리하는 일이 더 어렵습니다."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {problemCards.map((card) => (
              <motion.article
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.2 }}
                className="group rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-main shadow-sm transition group-hover:scale-105">
                  <Icon icon={card.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </MotionSection>

        <MotionSection className="rounded-[32px] bg-white px-5 py-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:px-8 sm:py-8">
          <SectionHeader
            eyebrow="Submate의 방식"
            title="역할과 돈의 흐름을 나눕니다"
            description="파티장과 파티원의 역할을 명확히 나누고, 플랫폼이 결제와 정산 상태를 관리합니다."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="mt-7 grid grid-cols-1 gap-3 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100 md:grid-cols-3"
          >
            {["파티 생성", "자동결제", "정산 관리"].map((step, index) => (
              <motion.div
                key={step}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: index * 0.35,
                    ease: [0.42, 0, 0.58, 1],
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-brand-main"
                >
                  {index + 1}
                </motion.div>
                <p className="mt-3 text-sm font-extrabold text-slate-950">
                  {step}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {index === 0
                    ? "파티 조건을 정합니다."
                    : index === 1
                      ? "참여자는 결제로 시작합니다."
                      : "플랫폼이 흐름을 기록합니다."}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            {solutionCards.map((card) => (
              <motion.article
                key={card.step}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.015 }}
                className="rounded-[24px] bg-slate-50 p-6 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
              >
                <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-brand-main">
                  {card.step}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </MotionSection>

        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-7 lg:grid-cols-2"
        >
          {roleCards.map((card) => (
            <motion.section
              key={card.role}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-[32px] bg-white px-5 py-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition hover:shadow-[0_16px_44px_rgba(15,23,42,0.08)] sm:px-8 sm:py-8"
            >
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${card.badgeClassName}`}
              >
                <Icon icon={card.icon} className="h-4 w-4" />
                {card.role}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {card.summary}
              </h2>

              <div className="mt-5 space-y-3">
                {card.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-main shadow-sm">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4"
                      />
                    </span>
                    <p className="text-sm leading-6 text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.section>

        <MotionSection className="overflow-hidden rounded-[32px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
          <div className="px-5 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-main ring-1 ring-blue-100">
                  <Icon icon="solar:rocket-2-bold" className="h-4 w-4" />한 줄
                  정리
                </div>

                <h2 className="mt-4 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
                  연결보다 중요한 건
                  <br />
                  운영과 정산입니다
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  사람을 모은 뒤의 운영 부담까지 시스템으로 관리하는 것이
                  Submate의 핵심입니다.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  to="/parties"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-brand-main px-5 text-sm font-bold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-800 active:scale-95"
                >
                  파티 보러가기
                </Link>

                <Link
                  to="/event"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-50 px-5 text-sm font-bold text-slate-700 ring-1 ring-slate-100 transition hover:bg-slate-100 active:scale-95"
                >
                  이벤트 보기
                </Link>
              </div>
            </div>
          </div>
        </MotionSection>
      </section>
    </div>
  );
}
