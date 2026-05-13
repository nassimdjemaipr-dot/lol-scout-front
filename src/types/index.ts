// Types globaux du projet LoL Scout
// Reflète les entités côté API Symfony (lol-scout-api)

export type UserRole = 'ROLE_PLAYER' | 'ROLE_CLUB' | 'ROLE_ADMIN';

export type PlayerRole = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export type ApplicationStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';


export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}


export interface Player {
  id: number;
  pseudo: string;
  firstName?: string;
  lastName?: string;
  gameRole: PlayerRole;
  isAvailable: boolean;
  bio?: string;
  riotAccount?: RiotAccount;
  stats?: PlayerStats;
}


export interface RiotAccount {
  id: number;
  summonerName: string;
  puuid: string;
  region: string;
  lastSyncAt?: string;
}


export interface PlayerStats {
  id: number;
  tier: string;
  winrate: string;
  averageKda: string;
  csPerMinute: string;
  visionScore: string;
  rankedGamesCount: number;
  topChampions?: PlayedChampion[];
}


export interface PlayedChampion {
  id: number;
  championName: string;
  gamesPlayed: number;
  winrate: string;
  kda: string;
}


export interface Club {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isVerified: boolean;
}


export interface Offer {
  id: number;
  title: string;
  description: string;
  wantedRole: PlayerRole;
  minimumRank: string;
  publishedAt: string;
  expiresAt?: string;
  isActive: boolean;
  club: Club;
}


export interface Application {
  id: number;
  message?: string;
  status: ApplicationStatus;
  appliedAt: string;
  player?: Player;
  offer?: Offer;
}


/* ─── Réponses d'authentification ────────────────────────── */
export interface LoginResponse {
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
}


/* ─── Constantes utiles ──────────────────────────────────── */
export const PLAYER_ROLES: PlayerRole[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

export const RANKS = [
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Emerald',
  'Diamond',
  'Master',
  'Grandmaster',
  'Challenger',
] as const;

export type Rank = (typeof RANKS)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
};
