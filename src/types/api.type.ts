export interface ListingRowRaw {
  id: string;
  type: 'commerce' | 'service' | 'poi' | 'organization';
  slug: string;

  name_es: string;
  name_en: string;
  short_desc_es?: string;
  short_desc_en?: string;
  long_desc_es?: string;
  long_desc_en?: string;

  category_id: string;
  tags_es?: string;
  tags_en?: string;

  price_min?: string;  // viene como texto, la parseamos
  price_max?: string;
  currency?: string;

  is_featured?: string; // 'TRUE' / 'FALSE'
  status?: string;

  lat?: string;
  lng?: string;
  address_es?: string;
  address_en?: string;
  locality?: string;

  whatsapp?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;

  main_image_url?: string;
  gallery_urls?: string;

  org_type?: string;
  org_scope_es?: string;
  org_scope_en?: string;
  org_contact_person?: string;
  org_meeting_schedule_es?: string;
  org_meeting_schedule_en?: string;
}
