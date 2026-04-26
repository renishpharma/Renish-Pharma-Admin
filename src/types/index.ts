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
  dimensions?: string;
  sizes?: string;
  additionalInfo?: string;
  specialCare?: string;
  dosage?: string; // Kept for UI compatibility if needed, though not in schema
  status: "active" | "inactive";
  media: Array<{
    url: string;
    public_id: string;
    type: "image" | "video";
  }>;
  createdAt: string;
  updatedAt: string;
}
