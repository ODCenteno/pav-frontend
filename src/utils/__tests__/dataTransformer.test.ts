import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformSheetDataToNested } from '../dataTransformer';

// Mock navigation module
vi.mock('../navigation', () => ({
  navigation: {
    siteDetail: vi.fn((slug: string, locale: string) =>
      locale === 'en' ? `/en/sitios/${slug}` : `/sitios/${slug}`
    ),
  },
}));

describe('dataTransformer', () => {
  describe('transformSheetDataToNested', () => {
    it('should transform flat data to nested Listing array', () => {
      const input = [
        {
          id: 'exp-01',
          type: 'poi',
          slug: 'tour-isla-catalana',
          name_es: 'Tour Isla Catalana',
          name_en: 'Catalina Island Tour',
          short_desc_es: 'Excursion a la isla',
          short_desc_en: 'Island excursion',
          long_desc_es: 'Una experiencia inolvidable',
          long_desc_en: 'An unforgettable experience',
          category_id: 'experiences',
          tags_es: 'snorkel, playa',
          tags_en: 'snorkel, beach',
          price: '$60 USD',
          is_featured: true,
          status: 'published',
          lat: 25.123,
          lng: -110.456,
          address_es: 'Isla Catalana, BCS',
          address_en: 'Catalina Island, BCS',
          locality: 'Puerto Agua Verde',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exp-01');
      expect(result[0].type).toBe('poi');
      expect(result[0].slug).toBe('tour-isla-catalana');
      expect(result[0].name).toEqual({ es: 'Tour Isla Catalana', en: 'Catalina Island Tour' });
      expect(result[0].shortDescription).toEqual({ es: 'Excursion a la isla', en: 'Island excursion' });
      expect(result[0].description).toEqual({ es: 'Una experiencia inolvidable', en: 'An unforgettable experience' });
      expect(result[0].categoryId).toBe('experiences');
      expect(result[0].isFeatured).toBe(true);
      expect(result[0].status).toBe('published');
    });

    it('should parse tags as LocalizedString arrays', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          tags_es: 'snorkel, playa, kayak',
          tags_en: 'snorkel, beach, kayak',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].tags).toHaveLength(3);
      expect(result[0].tags?.[0]).toEqual({ es: 'snorkel', en: 'snorkel' });
      expect(result[0].tags?.[1]).toEqual({ es: 'playa', en: 'beach' });
      expect(result[0].tags?.[2]).toEqual({ es: 'kayak', en: 'kayak' });
    });

    it('should handle missing tags gracefully', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].tags).toBeUndefined();
    });

    it('should parse location when lat/lng exist', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          lat: 25.123,
          lng: -110.456,
          address_es: 'Test Address',
          address_en: 'Test Address EN',
          locality: 'Locality Name',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].location).toBeDefined();
      expect(result[0].location?.lat).toBe(25.123);
      expect(result[0].location?.lng).toBe(-110.456);
      expect(result[0].location?.address).toEqual({ es: 'Test Address', en: 'Test Address EN' });
      expect(result[0].location?.locality).toBe('Locality Name');
    });

    it('should not include location when lat/lng missing', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].location).toBeUndefined();
    });

    it('should parse contact info with all fields', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          whatsapp: '521234567890',
          phone: '6121234567',
          email: 'test@example.com',
          website: 'https://test.com',
          instagram: 'test_account',
          facebook: 'test.facebook',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].contact).toEqual({
        whatsapp: '521234567890',
        phone: '6121234567',
        email: 'test@example.com',
        website: 'https://test.com',
        instagram: 'test_account',
        facebook: 'test.facebook',
      });
    });

    it('should not include contact when all fields missing', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].contact).toBeUndefined();
    });

    it('should parse pricing with min/max/currency', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          price_min: 100,
          price_max: 200,
          currency: 'USD',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].pricing).toEqual({
        min: 100,
        max: 200,
        currency: 'USD',
      });
    });

    it('should parse media with mainImageUrl and galleryUrls', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          main_image_url: '/images/main.jpg',
          gallery_urls: '/images/g1.jpg, /images/g2.jpg, /images/g3.jpg',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].media).toEqual({
        mainImageUrl: '/images/main.jpg',
        galleryUrls: ['/images/g1.jpg', '/images/g2.jpg', '/images/g3.jpg'],
      });
    });

    it('should parse organizationMeta when type is organization', () => {
      const input = [
        {
          id: 'test-01',
          type: 'organization',
          slug: 'coop-test',
          name_es: 'Cooperativa Test',
          name_en: 'Test Cooperative',
          org_type: 'cooperativa',
          org_scope_es: 'Local',
          org_scope_en: 'Local scope',
          org_contact_person: 'Juan Perez',
          org_meeting_schedule_es: 'Lunes 9am',
          org_meeting_schedule_en: 'Monday 9am',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].organizationMeta).toEqual({
        orgType: 'cooperativa',
        scope: { es: 'Local', en: 'Local scope' },
        contactPerson: 'Juan Perez',
        meetingSchedule: { es: 'Lunes 9am', en: 'Monday 9am' },
      });
    });

    it('should not include organizationMeta for non-organization types', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].organizationMeta).toBeUndefined();
    });

    it('should generate href for both locales', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].href).toEqual({
        es: '/sitios/test-site',
        en: '/en/sitios/test-site',
      });
    });

    it('should handle empty input array', () => {
      const result = transformSheetDataToNested([]);
      expect(result).toHaveLength(0);
    });

    it('should handle missing name fields gracefully', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: '',
          name_en: '',
        },
      ];

      const result = transformSheetDataToNested(input);

      // When both name_es and name_en are empty strings, toLocalizedString returns undefined
      // because !'' && !'' is true. So name will be undefined.
      expect(result[0].name).toBeUndefined();
    });

    it('should handle mismatched tag lengths', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          tags_es: 'uno, dos, tres',
          tags_en: 'one',
        },
      ];

      const result = transformSheetDataToNested(input);

      // Should use max length (3) and fill missing with empty string
      expect(result[0].tags).toHaveLength(3);
      expect(result[0].tags?.[0]).toEqual({ es: 'uno', en: 'one' });
      expect(result[0].tags?.[1]).toEqual({ es: 'dos', en: '' });
      expect(result[0].tags?.[2]).toEqual({ es: 'tres', en: '' });
    });

    it('should parse galleryUrls with different separators and whitespace', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          gallery_urls: '/img1.jpg, /img2.jpg , /img3.jpg',
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].media?.galleryUrls).toEqual(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
    });

    it('should handle numeric whatsapp/phone (convert to string)', () => {
      const input = [
        {
          id: 'test-01',
          type: 'poi',
          slug: 'test-site',
          name_es: 'Test',
          name_en: 'Test EN',
          whatsapp: 521234567890 as unknown as string,
          phone: 6121234567 as unknown as string,
        },
      ];

      const result = transformSheetDataToNested(input);

      expect(result[0].contact?.whatsapp).toBe('521234567890');
      expect(result[0].contact?.phone).toBe('6121234567');
    });
  });
});