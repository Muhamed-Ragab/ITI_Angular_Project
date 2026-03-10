import { describe, it, expect } from 'vitest';
import { Banner } from '../banner.dto';

describe('BannerDto - Comprehensive Unit Tests', () => {
  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - Valid Banner', () => {
    it('should create valid banner with all required properties', () => {
      const banner: Banner = {
        id: 'banner-123',
        section: 'homepage',
        title: 'Summer Sale',
        content: 'Get 50% off on all items',
        image_url: 'https://example.com/banner.jpg',
        link: 'https://example.com/summer-sale',
        order: 1,
        active: true,
      };

      expect(banner.id).toBe('banner-123');
      expect(banner.section).toBe('homepage');
      expect(banner.title).toBe('Summer Sale');
      expect(banner.content).toBe('Get 50% off on all items');
      expect(banner.image_url).toBe('https://example.com/banner.jpg');
      expect(banner.link).toBe('https://example.com/summer-sale');
      expect(banner.order).toBe(1);
      expect(banner.active).toBe(true);
    });

    it('should handle banner with all properties', () => {
      const banner: Banner = {
        id: 'banner-456',
        section: 'hero',
        title: 'Winter Collection',
        content: 'Explore our new winter collection',
        image_url: 'https://example.com/winter.jpg',
        link: 'https://example.com/winter',
        order: 2,
        active: false,
      };

      expect(banner.id).toBe('banner-456');
      expect(banner.section).toBe('hero');
      expect(banner.title).toBe('Winter Collection');
      expect(banner.active).toBe(false);
    });

    it('should handle different sections', () => {
      const sections = ['homepage', 'hero', 'sidebar', 'footer', 'promo'];
      
      sections.forEach((section) => {
        const banner: Banner = {
          id: 'banner-test',
          section,
          title: 'Test Banner',
          content: 'Test Content',
          image_url: 'https://example.com/test.jpg',
          link: 'https://example.com/test',
          order: 1,
          active: true,
        };
        expect(banner.section).toBe(section);
      });
    });
  });

  // ============================================
  // NULL/EMPTY INPUT TESTS
  // ============================================

  describe('Null/Empty Input Tests', () => {
    it('should handle empty string id', () => {
      const banner: Banner = {
        id: '',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com/link',
        order: 1,
        active: true,
      };

      expect(banner.id).toBe('');
    });

    it('should handle empty string title', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: '',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com/link',
        order: 1,
        active: true,
      };

      expect(banner.title).toBe('');
    });

    it('should handle empty string content', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: '',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com/link',
        order: 1,
        active: true,
      };

      expect(banner.content).toBe('');
    });

    it('should handle empty string image_url', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: '',
        link: 'https://example.com/link',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toBe('');
    });

    it('should handle empty string link', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: '',
        order: 1,
        active: true,
      };

      expect(banner.link).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      const banner: Banner = {
        id: '   ',
        section: '   ',
        title: '   ',
        content: '   ',
        image_url: '   ',
        link: '   ',
        order: 1,
        active: true,
      };

      expect(banner.id).toBe('   ');
      expect(banner.section).toBe('   ');
      expect(banner.title).toBe('   ');
    });
  });

  // ============================================
  // EDGE CASES - Image URL
  // ============================================

  describe('Edge Cases - Image URL', () => {
    it('should handle valid HTTPS URL', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://secure.example.com/image.png',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toBe('https://secure.example.com/image.png');
    });

    it('should handle HTTP URL', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'http://insecure.example.com/image.png',
        link: 'http://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toBe('http://insecure.example.com/image.png');
    });

    it('should handle URL with query parameters', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg?width=800&height=600',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toContain('?width=800');
    });

    it('should handle URL with special characters', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/images/banner%20image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toContain('%20');
    });

    it('should handle data URL for inline images', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toContain('data:image/png');
    });

    it('should handle relative URL', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: '/assets/banners/banner1.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toBe('/assets/banners/banner1.jpg');
    });

    it('should handle invalid URL format (not a real URL)', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'not-a-valid-url',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.image_url).toBe('not-a-valid-url');
    });
  });

  // ============================================
  // EDGE CASES - Order Values
  // ============================================

  describe('Edge Cases - Order Values', () => {
    it('should handle zero order', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 0,
        active: true,
      };

      expect(banner.order).toBe(0);
    });

    it('should handle negative order', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: -1,
        active: true,
      };

      expect(banner.order).toBe(-1);
    });

    it('should handle very large order', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 999999999,
        active: true,
      };

      expect(banner.order).toBe(999999999);
    });

    it('should handle decimal order (should be truncated or kept as number)', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1.5 as unknown as number,
        active: true,
      };

      // Note: TypeScript will allow this but it may be cast
      expect(typeof banner.order).toBe('number');
    });
  });

  // ============================================
  // EDGE CASES - Boolean Active
  // ============================================

  describe('Edge Cases - Active Flag', () => {
    it('should handle active set to false', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: false,
      };

      expect(banner.active).toBe(false);
    });

    it('should handle active set to true', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.active).toBe(true);
    });
  });

  // ============================================
  // EDGE CASES - Special Characters
  // ============================================

  describe('Edge Cases - Special Characters', () => {
    it('should handle unicode characters in title', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: ' summer sale 🏖️',
        content: 'Содержание на русском',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.title).toContain('🏖️');
      expect(banner.content).toContain('русском');
    });

    it('should handle HTML content', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: '<strong>Bold Title</strong>',
        content: '<p>Paragraph content</p>',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(banner.title).toContain('<strong>');
      expect(banner.content).toContain('<p>');
    });

    it('should handle special characters in link', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com/search?q=test&category=sale',
        order: 1,
        active: true,
      };

      expect(banner.link).toContain('&');
    });
  });

  // ============================================
  // SERIALIZATION TESTS
  // ============================================

  describe('Serialization Tests', () => {
    it('should serialize to JSON correctly', () => {
      const banner: Banner = {
        id: 'banner-123',
        section: 'homepage',
        title: 'Summer Sale',
        content: 'Get 50% off',
        image_url: 'https://example.com/banner.jpg',
        link: 'https://example.com/sale',
        order: 1,
        active: true,
      };

      const json = JSON.stringify(banner);
      expect(json).toContain('"id":"banner-123"');
      expect(json).toContain('"section":"homepage"');
      expect(json).toContain('"title":"Summer Sale"');
      expect(json).toContain('"order":1');
      expect(json).toContain('"active":true');
    });

    it('should deserialize from JSON correctly', () => {
      const json = '{"id":"banner-456","section":"hero","title":"Winter","content":"Sale","image_url":"https://example.com/winter.jpg","link":"https://example.com","order":2,"active":false}';
      const banner: Banner = JSON.parse(json);

      expect(banner.id).toBe('banner-456');
      expect(banner.section).toBe('hero');
      expect(banner.title).toBe('Winter');
      expect(banner.order).toBe(2);
      expect(banner.active).toBe(false);
    });

    it('should handle JSON serialization with special characters', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Test "quoted" title',
        content: 'Content with <html>',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com?param="value"',
        order: 1,
        active: true,
      };

      const json = JSON.stringify(banner);
      const parsed = JSON.parse(json);
      expect(parsed.title).toBe('Test "quoted" title');
      expect(parsed.link).toContain('"value"');
    });

    it('should handle empty banner serialization', () => {
      const banner: Banner = {
        id: '',
        section: '',
        title: '',
        content: '',
        image_url: '',
        link: '',
        order: 0,
        active: false,
      };

      const json = JSON.stringify(banner);
      expect(json).toContain('"active":false');
    });
  });

  // ============================================
  // TYPE SAFETY TESTS
  // ============================================

  describe('Type Safety Tests', () => {
    it('should enforce string type for id', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(typeof banner.id).toBe('string');
      expect(typeof banner.section).toBe('string');
      expect(typeof banner.title).toBe('string');
      expect(typeof banner.content).toBe('string');
      expect(typeof banner.image_url).toBe('string');
      expect(typeof banner.link).toBe('string');
    });

    it('should enforce number type for order', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(typeof banner.order).toBe('number');
    });

    it('should enforce boolean type for active', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      expect(typeof banner.active).toBe('boolean');
    });
  });

  // ============================================
  // CLONING/MUTATION TESTS
  // ============================================

  describe('Cloning/Mutation Tests', () => {
    it('should create a shallow copy of the object', () => {
      const original: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Original Title',
        content: 'Original Content',
        image_url: 'https://example.com/original.jpg',
        link: 'https://example.com/original',
        order: 1,
        active: true,
      };

      const copy = { ...original };
      copy.title = 'Modified Title';
      copy.active = false;

      expect(original.title).toBe('Original Title');
      expect(original.active).toBe(true);
      expect(copy.title).toBe('Modified Title');
      expect(copy.active).toBe(false);
    });

    it('should preserve original object when mutating copy', () => {
      const original: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Original',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      const copy = JSON.parse(JSON.stringify(original));
      copy.order = 999;
      copy.active = false;

      expect(original.order).toBe(1);
      expect(original.active).toBe(true);
      expect(copy.order).toBe(999);
      expect(copy.active).toBe(false);
    });

    it('should handle Object.assign correctly', () => {
      const original: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'https://example.com',
        order: 1,
        active: true,
      };

      const copy = Object.assign({}, original);
      copy.title = 'New Title';

      expect(original.title).toBe('Banner');
      expect(copy.title).toBe('New Title');
    });
  });

  // ============================================
  // EDGE CASES - Link URL
  // ============================================

  describe('Edge Cases - Link URL', () => {
    it('should handle various link protocols', () => {
      const protocols = [
        'https://example.com',
        'http://example.com',
        'mailto:user@example.com',
        'tel:+1234567890',
      ];

      protocols.forEach((link) => {
        const banner: Banner = {
          id: 'banner-1',
          section: 'homepage',
          title: 'Banner',
          content: 'Content',
          image_url: 'https://example.com/image.jpg',
          link,
          order: 1,
          active: true,
        };
        expect(banner.link).toBe(link);
      });
    });

    it('should handle relative links', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: '/products/category/sale',
        order: 1,
        active: true,
      };

      expect(banner.link).toBe('/products/category/sale');
    });

    it('should handle anchor links', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: '#top',
        order: 1,
        active: true,
      };

      expect(banner.link).toBe('#top');
    });

    it('should handle javascript links', () => {
      const banner: Banner = {
        id: 'banner-1',
        section: 'homepage',
        title: 'Banner',
        content: 'Content',
        image_url: 'https://example.com/image.jpg',
        link: 'javascript:void(0)',
        order: 1,
        active: true,
      };

      expect(banner.link).toBe('javascript:void(0)');
    });
  });
});
