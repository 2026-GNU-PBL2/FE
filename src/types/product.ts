export type ProductOperationType = string;
export type ProductStatus = string;

export interface ProductListItem {
  id: string;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  operationType: ProductOperationType;
  maxMemberCount: number;
  basePrice: number;
  pricePerMember: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
