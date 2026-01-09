export enum ToolCategory {
  DAILY = 'DAILY',
  CHINESE = 'CHINESE',
  WESTERN = 'WESTERN',
  VISION = 'VISION',
  INTERACTIVE = 'INTERACTIVE'
}

export enum FeatureId {
  // Daily
  ALMANAC = 'ALMANAC',
  DAILY_DRAW = 'DAILY_DRAW',
  DAILY_FORTUNE_CN = 'DAILY_FORTUNE_CN',
  DAILY_GUIDANCE_WEST = 'DAILY_GUIDANCE_WEST',

  // Chinese
  BAZI = 'BAZI',
  BAZI_COMPATIBILITY = 'BAZI_COMPATIBILITY',
  ZIWEI = 'ZIWEI',
  NAMING = 'NAMING',
  LIUYAO = 'LIUYAO',
  QIMEN = 'QIMEN',
  FENGSHUI = 'FENGSHUI',
  
  // Western
  ASTROLOGY = 'ASTROLOGY',
  TAROT = 'TAROT',
  NUMEROLOGY = 'NUMEROLOGY',
  RUNES = 'RUNES',
  KABBALAH = 'KABBALAH',

  // Vision
  FACE_READING = 'FACE_READING',
  PALM_READING = 'PALM_READING',
}

export interface MenuItem {
  id: FeatureId;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  isVip?: boolean;
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  isVip: boolean;
}