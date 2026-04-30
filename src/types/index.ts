export interface User {
  _id: string;
  userId: string;
  name: string;
  email?: string;
  role: "admin" | "manager";
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  shortDescription?: string;
  packaging?: string;
  composition?: string;
  featured?: boolean;
  additionalInfo?: string;
  specialCare?: string;
  status: "active" | "inactive";
  media: Array<{
    url: string;
    public_id: string;
    type: "image" | "video";
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface HeroImage {
  _id: string;
  url: string;
  public_id: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
