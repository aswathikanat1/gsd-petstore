export interface Category {
  id?: number;
  name?: string;
}

export type PetStatus = "available" | "pending" | "sold";

export interface UploadMetadata {
  contentType: string;
  size: number;
  additionalMetadata?: string;
  uploadedAt: string;
}

export interface Pet {
  id?: number;
  name: string;
  category?: Category;
  photoUrls: string[];
  status?: PetStatus;
  uploadedImages?: UploadMetadata[];
}
