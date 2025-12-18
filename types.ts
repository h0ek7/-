
export type CityKey = 'BEIJING' | 'SHANGHAI' | 'CHENGDU' | 'HARBIN' | 'XIAN' | 'GUANGZHOU' | 'WUHAN' | 'CHONGQING';

export interface CityData {
  id: CityKey;
  name: string;
  description: string;
  initialRV: string;
  initialWeapon: string;
  bonusItem: string;
  terrain: string;
}

export interface Stats {
  health: number;
  hunger: number;
  thirst: number;
  sanity: number;
}

export interface RVStats {
  level: number;
  power: number;
  defense: number;
  storage: number;
  medical: boolean;
  waterPurifier: boolean;
}

export interface Weapon {
  name: string;
  type: 'melee' | 'firearm';
  damage: number;
  level: number;
}

export interface GameState {
  day: number;
  distance: number;
  totalDistance: number;
  city: CityKey;
  stats: Stats;
  rv: RVStats;
  weapon: Weapon;
  materials: number;
  inventory: {
    food: number;
    water: number;
    meds: number;
    samples: number;
  };
  log: string[];
  isGameOver: boolean;
  ending: string | null;
}

export enum EndingType {
  REBUILD_HOPE = "重建希望",
  LONELY_TRAVELER = "孤独行者",
  ULTIMATE_REDEMPTION = "最终救赎"
}
