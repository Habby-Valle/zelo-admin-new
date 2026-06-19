export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Media {
  id: string;
  url: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface Address {
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}
