import type { Listing, ListingType } from '@/types/listing.type';
import type { LocalizedString } from '@/types/i18n.type';
import type { Location, ContactInfo, Pricing, Media } from '@/types/common.type';
import type { OrganizationMeta, OrganizationType } from '@/types/organization.type';


// Based on the provided example data from Google Sheets
interface FlatSheetData {
  id: string;
  type: string; // Will need to be cast to ListingType
  slug: string;

  name_es: string;
  name_en: string;
  short_desc_es?: string;
  short_desc_en?: string;
  long_desc_es?: string;
  long_desc_en?: string;

  category_id: string;
  tags_es?: string; // Comma-separated string
  tags_en?: string; // Comma-separated string

  price?: string; // Will be mapped to Pricing.range if needed, otherwise simplified here
  price_min?: number;
  price_max?: number;
  currency?: string; // Will be mapped to Pricing.currency as 'MXN' | 'USD'
  is_featured?: boolean;
  status?: 'published' | 'draft';

  lat?: number;
  lng?: number;
  address_es?: string;
  address_en?: string;
  locality?: string;
  whatsapp?: number | string; // Can be number or string
  phone?: number | string;    // Can be number or string
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  main_image_url?: string;
  gallery_urls?: string; // Comma-separated string

  org_type?: string; // Will be cast to OrganizationType
  org_scope_es?: string;
  org_scope_en?: string;
  org_contact_person?: string;
  org_meeting_schedule_es?: string;
  org_meeting_schedule_en?: string;
}

export function transformSheetDataToNested(data: FlatSheetData[]): Listing[] {
  return data.map(item => {
    // Helper to create LocalizedString, handling undefined fields gracefully
    const toLocalizedString = (es_field: string | undefined, en_field: string | undefined): LocalizedString | undefined => {
      if (!es_field && !en_field) return undefined;
      return { es: es_field || '', en: en_field || '' };
    };

    // Helper to create LocalizedString array from comma-separated strings
    // Assumes 1:1 correspondence and same order/count of tags between languages
    const toLocalizedStringArray = (es_tags_str: string | undefined, en_tags_str: string | undefined): LocalizedString[] | undefined => {
      const esTags = es_tags_str?.split(',').map(s => s.trim()).filter(Boolean) || [];
      const enTags = en_tags_str?.split(',').map(s => s.trim()).filter(Boolean) || [];

      if (esTags.length === 0 && enTags.length === 0) return undefined;

      const localizedTags: LocalizedString[] = [];
      const maxLength = Math.max(esTags.length, enTags.length);

      for (let i = 0; i < maxLength; i++) {
        localizedTags.push({
          es: esTags[i] || '',
          en: enTags[i] || '',
        });
      }
      return localizedTags;
    };

    const location: Location | undefined = (item.lat && item.lng) ? {
      lat: item.lat,
      lng: item.lng,
      address: toLocalizedString(item.address_es, item.address_en)!, // address is required in Location
      locality: item.locality,
    } : undefined;

    const contact: ContactInfo | undefined = (item.whatsapp || item.phone || item.email || item.website || item.instagram || item.facebook) ? {
      whatsapp: item.whatsapp ? String(item.whatsapp) : undefined,
      phone: item.phone ? String(item.phone) : undefined,
      email: item.email,
      website: item.website,
      instagram: item.instagram,
      facebook: item.facebook,
    } : undefined;

    const pricing: Pricing | undefined = (item.price_min || item.price_max || item.currency) ? {
      min: item.price_min,
      max: item.price_max,
      currency: item.currency as 'MXN' | 'USD' || undefined, // Cast to expected union type
    } : undefined;

    const media: Media | undefined = (item.main_image_url || item.gallery_urls) ? {
      mainImageUrl: item.main_image_url,
      galleryUrls: item.gallery_urls?.split(',').map(url => url.trim()).filter(Boolean) || [],
    } : undefined;

    const organizationMeta: OrganizationMeta | undefined = (item.org_type || item.org_contact_person || item.org_scope_es || item.org_scope_en || item.org_meeting_schedule_es || item.org_meeting_schedule_en) ? {
      orgType: item.org_type as OrganizationType || undefined, // Cast to expected union type
      scope: toLocalizedString(item.org_scope_es, item.org_scope_en),
      contactPerson: item.org_contact_person,
      meetingSchedule: toLocalizedString(item.org_meeting_schedule_es, item.org_meeting_schedule_en),
    } : undefined;


    return {
      id: item.id,
      type: item.type as ListingType,
      slug: item.slug,
      name: toLocalizedString(item.name_es, item.name_en)!, // Name is required
      shortDescription: toLocalizedString(item.short_desc_es, item.short_desc_en),
      description: toLocalizedString(item.long_desc_es, item.long_desc_en),
      categoryId: item.category_id,
      tags: toLocalizedStringArray(item.tags_es, item.tags_en),
      
      isFeatured: item.is_featured,
      status: item.status,

      location: location,
      contact: contact,
      pricing: pricing,
      media: media,
      organizationMeta: organizationMeta,
    };
  });
}
