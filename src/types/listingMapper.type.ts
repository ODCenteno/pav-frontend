import type { Listing } from './listing.type';
import type { ListingRowRaw } from './api.type';

export function mapListingRow(raw: ListingRowRaw): Listing {
  const toBool = (v?: string) => v?.toUpperCase() === 'TRUE';
  const toNum = (v?: string) => (v ? Number(v) : undefined);
  const splitUrls = (v?: string) =>
    v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];

  return {
    id: raw.id,
    type: raw.type,
    slug: raw.slug,

    name: { es: raw.name_es, en: raw.name_en },
    shortDescription: {
      es: raw.short_desc_es ?? '',
      en: raw.short_desc_en ?? '',
    },
    description: {
      es: raw.long_desc_es ?? '',
      en: raw.long_desc_en ?? '',
    },

    categoryId: raw.category_id,
    // category se puede inyectar luego

    tags: [
      {
        es: raw.tags_es ?? '',
        en: raw.tags_en ?? '',
      },
    ],

    location: raw.lat && raw.lng
      ? {
          lat: Number(raw.lat),
          lng: Number(raw.lng),
          address: {
            es: raw.address_es ?? '',
            en: raw.address_en ?? '',
          },
          locality: raw.locality,
        }
      : undefined,

    contact: {
      whatsapp: raw.whatsapp,
      phone: raw.phone,
      email: raw.email,
      website: raw.website,
      instagram: raw.instagram,
      facebook: raw.facebook,
    },

    pricing: {
      min: toNum(raw.price_min),
      max: toNum(raw.price_max),
      currency: raw.currency as 'MXN' | 'USD' | undefined,
    },

    media: {
      mainImageUrl: raw.main_image_url,
      galleryUrls: splitUrls(raw.gallery_urls),
    },

    isFeatured: toBool(raw.is_featured),
    status: (raw.status as 'published' | 'draft') ?? 'published',

    organizationMeta: raw.type === 'organization'
      ? {
          orgType: raw.org_type as any,
          scope: {
            es: raw.org_scope_es ?? '',
            en: raw.org_scope_en ?? '',
          },
          contactPerson: raw.org_contact_person,
          meetingSchedule: {
            es: raw.org_meeting_schedule_es ?? '',
            en: raw.org_meeting_schedule_en ?? '',
          },
        }
      : undefined,
  };
}
