export type ProductOperationType = string;
export type ProductStatus = string;
export type ProductCategory =
  | "NETFLIX"
  | "TVING"
  | "WATCHA"
  | "DISNEY_PLUS"
  | "APPLE_TV"
  | "WAVVE"
  | "LAFTEL"
  | string;

export interface ProductListItem {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: ProductOperationType;
  category: ProductCategory;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
