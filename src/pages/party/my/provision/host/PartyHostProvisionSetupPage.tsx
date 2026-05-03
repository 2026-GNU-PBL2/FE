import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type ProductOperationType = "INVITE_CODE" | "ACCOUNT_SHARE" | string;

type ProductResponse = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: ProductOperationType;
  category: string;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: string;
  createdAt: string;
  updatedAt: string;
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
      toast.error("아이디와 비밀번호를 입력해주세요.");
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
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-96 w-full max-w-2xl items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="text-center">
            <Icon
              icon="solar:refresh-circle-bold"
              className="mx-auto h-11 w-11 animate-spin text-blue-900"
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.serviceName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon icon="solar:play-circle-bold" className="h-7 w-7" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-sky-600">
                  {getOperationTypeLabel(product.operationType)}
                </p>
                <h1 className="mt-1 truncate text-2xl font-extrabold text-slate-950">
                  {product.serviceName}
                </h1>
              </div>
            </div>
          </div>

          {isAccountShare ? (
            <form onSubmit={handleSubmit} className="px-6 py-7 sm:px-8">
              <div className="mb-6 rounded-3xl bg-sky-50 px-5 py-5 ring-1 ring-sky-100">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 ring-1 ring-sky-100">
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
                  <input
                    value={sharedAccountEmail}
                    onChange={(event) =>
                      setSharedAccountEmail(event.target.value)
                    }
                    type="email"
                    placeholder="submate@example.com"
                    className="mt-2 h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    계정 비밀번호
                  </span>
                  <div className="mt-2 flex h-13 items-center rounded-2xl border border-slate-200 bg-white pr-2 transition focus-within:border-blue-900 focus-within:ring-4 focus-within:ring-blue-900/10">
                    <input
                      value={sharedAccountPassword}
                      onChange={(event) =>
                        setSharedAccountPassword(event.target.value)
                      }
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="비밀번호를 입력해주세요"
                      className="h-full min-w-0 flex-1 rounded-2xl bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setIsPasswordVisible((currentValue) => !currentValue)
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-900"
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
                className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-blue-900 text-base font-bold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "등록 중" : "다음"}
              </button>
            </form>
          ) : (
            <div className="px-6 py-12 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
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
