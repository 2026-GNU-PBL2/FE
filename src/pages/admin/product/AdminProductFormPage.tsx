import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

type OperationType = "INVITE_CODE" | "ACCOUNT_SHARE";

type ProductCategory =
  | "NETFLIX"
  | "TVING"
  | "WATCHA"
  | "DISNEY_PLUS"
  | "APPLE_TV"
  | "WAVVE"
  | "LAFTEL";

type ProductStatus = "ACTIVE" | "INACTIVE" | "ENDED" | string;

type AdminProduct = {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string | null;
  operationType: OperationType;
  category: ProductCategory;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

type ProductRequestData = {
  serviceName: string;
  description: string;
  operationType: OperationType;
  category: ProductCategory;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
};

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  payload?: T;
};

const categoryOptions: ProductCategory[] = [
  "NETFLIX",
  "TVING",
  "WATCHA",
  "DISNEY_PLUS",
  "APPLE_TV",
  "WAVVE",
  "LAFTEL",
];

const operationTypeOptions: Array<{
  label: string;
  description: string;
  value: OperationType;
}> = [
  {
    label: "초대 코드형",
    description: "초대 링크 또는 초대 코드로 참여하는 방식입니다.",
    value: "INVITE_CODE",
  },
  {
    label: "계정 공유형",
    description: "공유 계정 정보로 파티원이 이용하는 방식입니다.",
    value: "ACCOUNT_SHARE",
  },
];

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

function formatCurrency(value: string) {
  const numberValue = Number(value);
  if (!value || Number.isNaN(numberValue)) return "0";

  return new Intl.NumberFormat("ko-KR").format(numberValue);
}

function getOperationTypeLabel(value: OperationType | string) {
  const labels: Record<string, string> = {
    INVITE_CODE: "초대 코드형",
    ACCOUNT_SHARE: "계정 공유형",
  };

  return labels[value] ?? value;
}

function getCategoryLabel(value: ProductCategory | string) {
  const labels: Record<string, string> = {
    NETFLIX: "넷플릭스",
    TVING: "티빙",
    WATCHA: "왓챠",
    DISNEY_PLUS: "디즈니+",
    APPLE_TV: "애플TV+",
    WAVVE: "웨이브",
    LAFTEL: "라프텔",
  };

  return labels[value] ?? value;
}

export default function AdminProductFormPage() {
  const navigate = useNavigate();
  const { productId, id } = useParams();

  const selectedProductId = productId ?? id ?? "";
  const isEditMode = Boolean(selectedProductId);

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [operationType, setOperationType] =
    useState<OperationType>("INVITE_CODE");
  const [category, setCategory] = useState<ProductCategory>("NETFLIX");
  const [maxMemberCount, setMaxMemberCount] = useState("4");
  const [basePrice, setBasePrice] = useState("");
  const [pricePerMember, setPricePerMember] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewInitial = useMemo(() => {
    return (serviceName.trim() || "SM").slice(0, 2).toUpperCase();
  }, [serviceName]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(
          `/api/v1/admin/products/${selectedProductId}`,
        );

        const product = unwrapResponse<AdminProduct>(response.data);

        if (!product) {
          toast.error("상품 정보를 찾을 수 없습니다.");
          navigate("/admin/products", { replace: true });
          return;
        }

        setServiceName(product.serviceName);
        setDescription(product.description);
        setOperationType(product.operationType);
        setCategory(product.category);
        setMaxMemberCount(String(product.maxMemberCount));
        setBasePrice(String(product.basePrice));
        setPricePerMember(String(product.pricePerMember));
        setCurrentThumbnailUrl(product.thumbnailUrl ?? "");
        setImagePreviewUrl(product.thumbnailUrl ?? "");
      } catch (error) {
        console.error(error);
        toast.error("상품 정보를 불러오지 못했습니다.");
        navigate("/admin/products", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [isEditMode, navigate, selectedProductId]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImagePreviewUrl(currentThumbnailUrl);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedMaxMemberCount = Number(maxMemberCount);
    const parsedBasePrice = Number(basePrice);
    const parsedPricePerMember = Number(pricePerMember);

    if (!serviceName.trim()) {
      toast.error("서비스명을 입력해 주세요.");
      return;
    }

    if (!description.trim()) {
      toast.error("상품 설명을 입력해 주세요.");
      return;
    }

    if (
      Number.isNaN(parsedMaxMemberCount) ||
      Number.isNaN(parsedBasePrice) ||
      Number.isNaN(parsedPricePerMember)
    ) {
      toast.error("숫자 항목을 올바르게 입력해 주세요.");
      return;
    }

    if (parsedMaxMemberCount < 1) {
      toast.error("최대 인원은 1명 이상이어야 합니다.");
      return;
    }

    if (parsedBasePrice < 1 || parsedPricePerMember < 1) {
      toast.error("금액은 1원 이상이어야 합니다.");
      return;
    }

    const data: ProductRequestData = {
      serviceName: serviceName.trim(),
      description: description.trim(),
      operationType,
      category,
      maxMemberCount: parsedMaxMemberCount,
      basePrice: parsedBasePrice,
      pricePerMember: parsedPricePerMember,
    };

    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify(data)], {
        type: "application/json",
      }),
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setIsSubmitting(true);

      const response = isEditMode
        ? await api.put(
            `/api/v1/admin/products/${selectedProductId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          )
        : await api.post("/api/v1/admin/products", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

      const savedProduct = unwrapResponse<AdminProduct>(response.data);

      toast.success(
        isEditMode ? "상품 정보가 수정되었습니다." : "상품이 등록되었습니다.",
      );

      navigate(`/admin/products/${savedProduct?.id ?? selectedProductId}`, {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        isEditMode ? "상품 수정에 실패했습니다." : "상품 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
          <Icon icon="solar:refresh-bold" className="h-5 w-5 animate-spin" />
          상품 정보를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#1E3A8A]">Admin Product</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {isEditMode ? "상품 수정" : "상품 등록"}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              상품 정보와 이미지를 등록하면 파티 생성 화면에 반영됩니다.
            </p>
          </div>

          <Link
            to="/admin/products"
            className="hidden h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:inline-flex"
          >
            목록으로
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          <section className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] ring-1 ring-slate-100">
              <h2 className="text-xl font-black text-slate-950">기본 정보</h2>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    서비스명
                  </label>
                  <input
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                    placeholder="예: 넷플릭스 프리미엄"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    상품 설명
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    placeholder="상품 설명을 입력해 주세요."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    상품 이미지
                  </label>

                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-[#38BDF8] hover:bg-sky-50">
                    <Icon
                      icon="solar:upload-minimalistic-bold-duotone"
                      className="h-8 w-8 text-[#1E3A8A]"
                    />
                    <p className="mt-3 text-sm font-black text-slate-900">
                      이미지를 업로드하세요
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      PNG, JPG, WEBP 파일을 사용할 수 있습니다.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] ring-1 ring-slate-100">
              <h2 className="text-xl font-black text-slate-950">운영 설정</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {operationTypeOptions.map((option) => {
                  const isSelected = operationType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOperationType(option.value)}
                      className={[
                        "rounded-3xl border p-5 text-left transition",
                        isSelected
                          ? "border-[#38BDF8] bg-sky-50 ring-4 ring-[#38BDF8]/10"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-950">
                          {option.label}
                        </p>
                        {isSelected ? (
                          <Icon
                            icon="solar:check-circle-bold"
                            className="h-6 w-6 text-[#1E3A8A]"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    카테고리
                  </label>
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as ProductCategory)
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20"
                  >
                    {categoryOptions.map((item) => (
                      <option key={item} value={item}>
                        {getCategoryLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    최대 인원
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxMemberCount}
                    onChange={(event) => setMaxMemberCount(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] ring-1 ring-slate-100">
              <h2 className="text-xl font-black text-slate-950">결제 정보</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    기본 요금
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={basePrice}
                    onChange={(event) => setBasePrice(event.target.value)}
                    placeholder="예: 17000"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    1인당 금액
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pricePerMember}
                    onChange={(event) => setPricePerMember(event.target.value)}
                    placeholder="예: 4250"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20"
                  />
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[32px] bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] ring-1 ring-slate-100">
              <h2 className="text-lg font-black text-slate-950">미리보기</h2>

              <div className="mt-5 overflow-hidden rounded-[28px] bg-[#F8FAFC] ring-1 ring-slate-100">
                <div className="relative aspect-video bg-slate-100">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="상품 미리보기"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1E3A8A] text-3xl font-black text-white">
                      {previewInitial}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#2DD4BF]/10 px-3 py-1 text-xs font-black text-[#0F766E]">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="rounded-full bg-[#38BDF8]/10 px-3 py-1 text-xs font-black text-[#0369A1]">
                      {getOperationTypeLabel(operationType)}
                    </span>
                  </div>

                  <p className="mt-4 text-xl font-black text-slate-950">
                    {serviceName || "상품명"}
                  </p>

                  <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-500">
                    {description || "상품 설명이 여기에 표시됩니다."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-bold text-slate-400">
                        기본 요금
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {formatCurrency(basePrice)}원
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-bold text-slate-400">1인당</p>
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {formatCurrency(pricePerMember)}원
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold text-slate-400">
                      최대 인원
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {maxMemberCount || 0}명
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 rounded-2xl bg-[#1E3A8A] text-sm font-black text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "저장 중..."
                    : isEditMode
                      ? "수정 완료"
                      : "상품 등록"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="h-14 rounded-2xl bg-slate-100 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  취소
                </button>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
