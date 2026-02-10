
export enum GameTab {
  HOME = 'home',
  CREATOR = 'creator',
  QUESTS = 'quests',
  LIVE = 'live',
  STUDIO = 'studio'
}

export type Language = 'en' | 'pt';

export interface CharacterStats {
  power: number;
  agility: number;
  magic: number;
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  stats: CharacterStats;
  createdAt: number;
}

export interface Quest {
  id: string;
  title: string;
  type: 'search' | 'maps' | 'puzzle';
  status: 'active' | 'completed';
}
