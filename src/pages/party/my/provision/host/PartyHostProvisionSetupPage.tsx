import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import type { OttSlug } from "@/types/ott";
import type { ProductCategory } from "@/types/product";

type ProductOperationType = "INVITE_CODE" | "ACCOUNT_SHARE" | string;

type ProductResponse = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: ProductOperationType;
  category: ProductCategory;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type UserResponse = {
  submateEmail?: string | null;
};

type ProvisionSetupLocationState = {
  productId?: string;
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

function getOperationTypeLabel(operationType?: ProductOperationType) {
  if (operationType === "ACCOUNT_SHARE") return "계정 공유형";
  if (operationType === "INVITE_CODE") return "초대 코드형";
  return operationType ?? "-";
}

const ACCOUNT_SHARE_PROVISION_GUIDE =
  "공유 계정으로 로그인한 뒤 본인 프로필을 만들어 이용해주세요. 계정 정보가 변경되면 파티장이 새 정보를 다시 안내합니다.";

type OttAccountLink = {
  serviceNames: string[];
  title: string;
  description: string;
  url: string;
  buttonLabel: string;
  note?: string;
};

const OTT_ACCOUNT_LINKS: OttAccountLink[] = [
  {
    serviceNames: ["넷플릭스", "netflix"],
    title: "넷플릭스 계정 준비",
    description: "파티에 사용할 넷플릭스 계정을 먼저 준비해주세요.",
    url: "https://www.netflix.com/signup",
    buttonLabel: "넷플릭스 바로가기",
  },
  {
    serviceNames: ["디즈니플러스", "디즈니+", "disney", "disneyplus"],
    title: "디즈니플러스 계정 준비",
    description: "파티에 사용할 디즈니플러스 계정을 먼저 준비해주세요.",
    url: "https://www.disneyplus.com",
    buttonLabel: "디즈니플러스 바로가기",
  },
  {
    serviceNames: ["유튜브", "youtube"],
    title: "유튜브 Premium 계정 준비",
    description: "파티에 사용할 유튜브 Premium 계정을 먼저 준비해주세요.",
    url: "https://www.youtube.com/paid_memberships",
    buttonLabel: "유튜브 바로가기",
  },
  {
    serviceNames: ["애플티비", "애플tv", "apple", "appletv"],
    title: "Apple TV+ 계정 준비",
    description: "파티에 사용할 Apple TV+ 계정을 먼저 준비해주세요.",
    url: "https://tv.apple.com",
    buttonLabel: "Apple TV+ 바로가기",
  },
  {
    serviceNames: ["티빙", "tving"],
    title: "티빙 계정 준비",
    description: "파티에 사용할 티빙 계정을 먼저 준비해주세요.",
    url: "https://www.tving.com",
    buttonLabel: "티빙 바로가기",
  },
  {
    serviceNames: ["웨이브", "wavve", "wave"],
    title: "웨이브 계정 준비",
    description: "파티에 사용할 웨이브 계정을 먼저 준비해주세요.",
    url: "https://www.wavve.com",
    buttonLabel: "웨이브 바로가기",
  },
  {
    serviceNames: ["왓챠", "watcha"],
    title: "왓챠 계정 준비",
    description: "파티에 사용할 왓챠 계정을 먼저 준비해주세요.",
    url: "https://watcha.com",
    buttonLabel: "왓챠 바로가기",
  },
  {
    serviceNames: ["라프텔", "laftel"],
    title: "라프텔 계정 준비",
    description: "파티에 사용할 라프텔 계정을 먼저 준비해주세요.",
    url: "https://laftel.net",
    buttonLabel: "라프텔 바로가기",
  },
];

function normalizeServiceName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[+＋]/g, "plus")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function getOttAccountLink(serviceName: string) {
  const normalizedServiceName = normalizeServiceName(serviceName);

  return OTT_ACCOUNT_LINKS.find((link) =>
    link.serviceNames.some((serviceNameCandidate) =>
      normalizedServiceName.includes(
        normalizeServiceName(serviceNameCandidate),
      ),
    ),
  );
}

function resolveOttSlugByCategory(
  category?: ProductCategory | null,
): OttSlug | null {
  const normalizedCategory = String(category ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");

  if (normalizedCategory === "NETFLIX") return "netflix";
  if (normalizedCategory === "TVING") return "tving";
  if (normalizedCategory === "WATCHA") return "watcha";
  if (
    normalizedCategory === "DISNEY_PLUS" ||
    normalizedCategory === "DISNEYPLUS"
  ) {
    return "disney-plus";
  }
  if (normalizedCategory === "APPLE_TV" || normalizedCategory === "APPLETV") {
    return "apple-tv";
  }
  if (normalizedCategory === "WAVVE" || normalizedCategory === "WAVE") {
    return "wavve";
  }
  if (normalizedCategory === "LAFTEL") return "laftel";

  return null;
}

function getProductLogoFillClassName(slug: OttSlug) {
  if (slug === "watcha") {
    return "h-full w-full scale-105 object-cover";
  }

  if (slug === "apple-tv") {
    return "h-full w-full scale-125 object-cover";
  }

  if (slug === "netflix") {
    return "h-full w-full scale-125 object-cover";
  }

  if (slug === "wavve") {
    return "h-full w-full object-cover";
  }

  return "h-full w-full object-cover";
}

function ProductLogo({
  image,
  alt,
  category,
}: {
  image?: string | null;
  alt: string;
  category?: ProductCategory | null;
}) {
  const slug = resolveOttSlugByCategory(category);

  if (slug && image) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          <img
            src={image}
            alt={alt}
            className={getProductLogoFillClassName(slug)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
      {image ? (
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Icon
          icon="solar:play-circle-bold"
          className="h-7 w-7 text-brand-main"
        />
      )}
    </div>
  );
}

export default function PartyHostProvisionSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { partyId, productId: productIdParam } = useParams<{
    partyId: string;
    productId: string;
  }>();
  const locationState = location.state as ProvisionSetupLocationState | null;
  const productId = productIdParam ?? locationState?.productId;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [sharedAccountEmail, setSharedAccountEmail] = useState("");
  const [sharedAccountPassword, setSharedAccountPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAccountShare = product?.operationType === "ACCOUNT_SHARE";
  const isFormValid = useMemo(() => {
    return (
      sharedAccountEmail.trim().length > 0 &&
      sharedAccountPassword.trim().length > 0
    );
  }, [sharedAccountEmail, sharedAccountPassword]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        toast.error("상품 정보를 확인할 수 없습니다.");
        navigate("/myparty", { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const response = await api.get<
          ProductResponse | ApiEnvelope<ProductResponse>
        >(`/api/v1/products/${productId}`);
        const data = unwrapResponse<ProductResponse>(response.data);

        if (!data) {
          toast.error("상품 정보를 불러오지 못했습니다.");
          navigate("/myparty", { replace: true });
          return;
        }

        if (data.operationType === "INVITE_CODE" && partyId) {
          navigate(`/myparty/${partyId}/provision/invite-setup/${data.id}`, {
            replace: true,
            state: {
              productId: data.id,
            },
          });
          return;
        }

        setProduct(data);

        try {
          const userResponse = await api.get<
            UserResponse | ApiEnvelope<UserResponse>
          >("/api/v1/user");
          const userData = unwrapResponse<UserResponse>(userResponse.data);
          setSharedAccountEmail(userData?.submateEmail?.trim() ?? "");
        } catch (userError) {
          console.error(userError);
          toast.error("사용자 이메일 정보를 불러오지 못했습니다.");
          setSharedAccountEmail("");
        }
      } catch (error) {
        console.error(error);
        toast.error("상품 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [navigate, partyId, productId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!partyId || !product) {
      toast.error("파티 정보를 확인할 수 없습니다.");
      return;
    }

    if (!isAccountShare) {
      toast.error("공유계정형 상품만 등록할 수 있습니다.");
      return;
    }

    if (!isFormValid) {
      toast.error("계정 아이디와 비밀번호를 확인해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post(`/api/v1/parties/${partyId}/provision`, {
        provisionType: "ACCOUNT_SHARE",
        inviteValue: null,
        sharedAccountEmail: sharedAccountEmail.trim(),
        sharedAccountPassword: sharedAccountPassword.trim(),
        provisionGuide: ACCOUNT_SHARE_PROVISION_GUIDE,
      });

      toast.success("이용 정보가 등록되었습니다.");
      navigate(`/myparty/${partyId}/provision/adult-check/${product.id}`, {
        state: {
          productName: product.serviceName,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("이용 정보 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-brand-main"
            />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              상품 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const ottAccountLink = getOttAccountLink(product.serviceName);

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/6 ring-1 ring-slate-100">
          <div className="bg-white px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <ProductLogo
                  image={product.thumbnailUrl}
                  alt={product.serviceName}
                  category={product.category}
                />

                <div className="min-w-0">
                  <p className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-brand-main ring-1 ring-blue-100">
                    {getOperationTypeLabel(product.operationType)}
                  </p>
                  <h1 className="mt-2 truncate text-[25px] font-extrabold tracking-tight text-slate-950 sm:text-[29px]">
                    {product.serviceName}
                  </h1>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400 sm:text-right">
                파티장 이용 정보 등록
              </p>
            </div>
          </div>

          {isAccountShare ? (
            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-100 px-5 py-6 sm:px-8 sm:py-7"
            >
              {ottAccountLink && (
                <section className="mb-6 rounded-[24px] bg-white px-5 py-5 ring-1 ring-slate-100">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-main ring-1 ring-blue-100">
                        <Icon icon="solar:login-3-bold" className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                          {ottAccountLink.title}
                        </h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                          {ottAccountLink.description}
                        </p>
                        {ottAccountLink.note && (
                          <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">
                            {ottAccountLink.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={ottAccountLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-main px-4 text-sm font-bold text-white shadow-md shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800"
                    >
                      {ottAccountLink.buttonLabel}
                      <Icon
                        icon="solar:arrow-right-up-linear"
                        className="h-5 w-5"
                      />
                    </a>
                  </div>
                </section>
              )}

              <div className="mb-6 rounded-[24px] bg-blue-50 px-5 py-5 ring-1 ring-blue-100">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-main ring-1 ring-blue-100">
                    <Icon icon="solar:shield-check-bold" className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-950">
                      입력한 계정 정보는 이 파티의 파티원에게만 공개됩니다
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      비밀번호는 화면에서 기본으로 가려지며, 잘못 입력해도 이후
                      언제든지 다시 수정할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    계정 아이디
                  </span>
                  <div className="mt-2 flex h-14 items-center rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100">
                    <Icon
                      icon="solar:letter-bold-duotone"
                      className="mr-3 h-5 w-5 shrink-0 text-brand-main"
                    />
                    <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-900">
                      {sharedAccountEmail ||
                        "계정 아이디를 불러오지 못했습니다"}
                    </p>
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    계정 비밀번호
                  </span>
                  <div className="mt-2 flex h-14 items-center rounded-2xl bg-slate-50 pl-4 pr-2 ring-1 ring-slate-100 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                    <Icon
                      icon="solar:lock-password-bold"
                      className="mr-3 h-5 w-5 shrink-0 text-slate-400"
                    />
                    <input
                      value={sharedAccountPassword}
                      onChange={(event) =>
                        setSharedAccountPassword(event.target.value)
                      }
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="비밀번호를 입력해주세요"
                      className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setIsPasswordVisible((currentValue) => !currentValue)
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-brand-main"
                      aria-label={
                        isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 표시"
                      }
                    >
                      <Icon
                        icon={
                          isPasswordVisible
                            ? "solar:eye-closed-bold"
                            : "solar:eye-bold"
                        }
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="mt-7 flex h-14 w-full items-center justify-center rounded-full bg-brand-main text-base font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {isSubmitting ? "등록 중" : "다음"}
              </button>
            </form>
          ) : (
            <div className="border-t border-slate-100 px-6 py-12 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                <Icon icon="solar:danger-circle-bold" className="h-9 w-9" />
              </div>
              <h2 className="mt-5 text-xl font-extrabold text-slate-950">
                지원하지 않는 상품 방식입니다
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-500">
                상품 정보를 다시 확인해주세요.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
