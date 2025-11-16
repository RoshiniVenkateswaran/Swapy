// Predefined price table for item categories
export const PRICE_TABLE: Record<string, { min: number; max: number }> = {
  chair: { min: 15, max: 50 },
  backpack: { min: 20, max: 60 },
  table: { min: 30, max: 120 },
  headphones: { min: 10, max: 150 },
  monitor: { min: 80, max: 300 },
  laptop: { min: 200, max: 1500 },
  phone: { min: 100, max: 1000 },
  tablet: { min: 150, max: 800 },
  keyboard: { min: 15, max: 200 },
  mouse: { min: 10, max: 80 },
  desk: { min: 50, max: 300 },
  lamp: { min: 10, max: 50 },
  book: { min: 5, max: 100 },
  calculator: { min: 10, max: 150 },
  bicycle: { min: 50, max: 500 },
  skateboard: { min: 30, max: 200 },
  microwave: { min: 30, max: 150 },
  fan: { min: 15, max: 80 },
  clothing: { min: 5, max: 100 },
  shoes: { min: 20, max: 200 },
  textbook: { min: 20, max: 300 },
  furniture: { min: 20, max: 500 },
  electronics: { min: 20, max: 1000 },
  sports_equipment: { min: 10, max: 300 },
  kitchen: { min: 10, max: 150 },
  bedding: { min: 15, max: 100 },
  decorations: { min: 5, max: 80 },
  other: { min: 10, max: 100 },
};

// Item categories (matching price table structure)
export const ITEM_CATEGORIES = [
  'electronics',
  'furniture',
  'books',
  'kitchen',
  'appliances',
  'clothing',
  'bags',
  'sports',
  'accessories',
];

// Trade status
export const TRADE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Item status
export const ITEM_STATUS = {
  AVAILABLE: 'available',
  PENDING: 'pending',
  TRADED: 'traded',
} as const;

// Allowed email domains (can be loaded from env)
export const ALLOWED_DOMAINS = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(',') || ['.edu'];

