// src/config/tracked-products.ts
import { ValidationRule } from '../interfaces/trackedProduct';

// Type for product configuration without runtime-assigned fields
export type ProductConfig = {
  sku: string;
  name: string;
  validationRules: ValidationRule;
};

export const bestBuyProducts: ProductConfig[] = [
  {
    sku: '6525421',
    name: 'iPhone 15 Pro Max',
    validationRules: {
      exactNameMatch: 'iPhone 15 Pro Max',
      priceRange: { min: 900, max: 1500 },
      requiredTerms: ['256GB', 'Unlocked'],
      excludedTerms: ['case', 'refurbished']
    }
  },
  {
    sku: '6559694',
    name: 'Ring Video Doorbell Pro 2',
    validationRules: {
      exactNameMatch: 'Ring Video Doorbell Pro 2',
      priceRange: { min: 150, max: 300 },
      excludedTerms: ['refurbished', 'renewed']
    }
  },
  {
    sku: '6514647',
    name: 'LG C3 65" OLED TV',
    validationRules: {
      exactNameMatch: 'LG - 65" Class C3 Series OLED 4K UHD Smart webOS TV',
      priceRange: { min: 1500, max: 2500 },
      requiredTerms: ['OLED', '4K'],
      excludedTerms: ['open-box', 'refurbished']
    }
  },
  {
    sku: '6524736',
    name: 'Sony WH-1000XM5 Headphones',
    validationRules: {
      exactNameMatch: 'Sony - WH-1000XM5 Wireless Noise Cancelling Headphones',
      priceRange: { min: 300, max: 450 },
      excludedTerms: ['renewed', 'refurbished']
    }
  },
  {
    sku: '6522642',
    name: 'PlayStation 5 Slim',
    validationRules: {
      exactNameMatch: 'PlayStation 5 Slim Console',
      priceRange: { min: 450, max: 600 },
      excludedTerms: ['digital', 'bundle', 'refurbished']
    }
  },
  {
    sku: '6509757',
    name: 'Sonos Arc Soundbar',
    validationRules: {
      exactNameMatch: 'Sonos - Arc Soundbar with Dolby Atmos',
      priceRange: { min: 800, max: 1000 },
      requiredTerms: ['Dolby Atmos'],
      excludedTerms: ['refurbished', 'open-box']
    }
  },
  {
    sku: '6447172',
    name: 'MacBook Air M2',
    validationRules: {
      exactNameMatch: 'MacBook Air 15" Laptop - Apple M2 chip',
      priceRange: { min: 1000, max: 1500 },
      requiredTerms: ['M2', '15"'],
      excludedTerms: ['refurbished', 'renewed']
    }
  },
  {
    sku: '6534605',
    name: 'Samsung Galaxy S24 Ultra',
    validationRules: {
      exactNameMatch: 'Samsung Galaxy S24 Ultra 256GB',
      priceRange: { min: 1000, max: 1400 },
      requiredTerms: ['256GB', 'Unlocked'],
      excludedTerms: ['case', 'refurbished']
    }
  },
  {
    sku: '6537666',
    name: 'Apple Watch Series 9',
    validationRules: {
      exactNameMatch: 'Apple Watch Series 9 GPS 45mm',
      priceRange: { min: 350, max: 500 },
      requiredTerms: ['GPS', '45mm'],
      excludedTerms: ['cellular', 'refurbished']
    }
  },
  {
    sku: '6448632',
    name: 'Nintendo Switch OLED',
    validationRules: {
      exactNameMatch: 'Nintendo Switch OLED Model',
      priceRange: { min: 300, max: 400 },
      requiredTerms: ['OLED'],
      excludedTerms: ['lite', 'refurbished']
    }
  },
  {
    sku: '6522911',
    name: 'Bose QuietComfort Ultra',
    validationRules: {
      exactNameMatch: 'Bose QuietComfort Ultra Headphones',
      priceRange: { min: 350, max: 500 },
      excludedTerms: ['earbuds', 'refurbished']
    }
  },
  {
    sku: '6509513',
    name: 'Samsung Frame TV 55"',
    validationRules: {
      exactNameMatch: 'Samsung - 55" Class The Frame QLED 4K Smart TV',
      priceRange: { min: 1200, max: 1800 },
      requiredTerms: ['QLED', '4K'],
      excludedTerms: ['refurbished', 'open-box']
    }
  },
  {
    sku: '6534663',
    name: 'iPad Air M1',
    validationRules: {
      exactNameMatch: 'Apple iPad Air (5th Generation) with M1 Chip',
      priceRange: { min: 500, max: 750 },
      requiredTerms: ['M1', 'WiFi'],
      excludedTerms: ['cellular', 'refurbished']
    }
  },
  {
    sku: '6502251',
    name: 'Ring Floodlight Cam Pro',
    validationRules: {
      exactNameMatch: 'Ring Floodlight Cam Pro',
      priceRange: { min: 200, max: 350 },
      excludedTerms: ['battery', 'refurbished']
    }
  },
  {
    sku: '6518625',
    name: 'Dyson Gen5detect Vacuum',
    validationRules: {
      exactNameMatch: 'Dyson Gen5detect Absolute Vacuum',
      priceRange: { min: 700, max: 1000 },
      excludedTerms: ['refurbished', 'renewed']
    }
  },
  {
    sku: '6517332',
    name: 'LG C3 42" OLED Gaming TV',
    validationRules: {
      exactNameMatch: 'LG - 42" Class C3 Series OLED 4K Gaming TV',
      priceRange: { min: 800, max: 1300 },
      requiredTerms: ['OLED', '4K'],
      excludedTerms: ['refurbished', 'open-box']
    }
  },
  {
    sku: '6534758',
    name: 'ASUS ROG Gaming Monitor',
    validationRules: {
      exactNameMatch: 'ASUS ROG Swift 27" Gaming Monitor',
      priceRange: { min: 600, max: 900 },
      requiredTerms: ['HDR', '1ms'],
      excludedTerms: ['refurbished']
    }
  },
  {
    sku: '6505727',
    name: 'Sony A80L 65" OLED',
    validationRules: {
      exactNameMatch: 'Sony - 65" Class BRAVIA XR A80L OLED 4K TV',
      priceRange: { min: 1800, max: 2800 },
      requiredTerms: ['OLED', '4K'],
      excludedTerms: ['refurbished', 'open-box']
    }
  },
  {
    sku: '6522987',
    name: 'Samsung Galaxy Watch 6',
    validationRules: {
      exactNameMatch: 'Samsung Galaxy Watch 6 Classic',
      priceRange: { min: 300, max: 450 },
      requiredTerms: ['45mm', 'Bluetooth'],
      excludedTerms: ['LTE', 'refurbished']
    }
  },
  {
    sku: '6509463',
    name: 'Sonos Sub Gen 3',
    validationRules: {
      exactNameMatch: 'Sonos - Sub (Gen 3) Wireless Subwoofer',
      priceRange: { min: 600, max: 850 },
      excludedTerms: ['refurbished', 'open-box']
    }
  }
];