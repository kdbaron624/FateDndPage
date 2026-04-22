// ── USER / PROFILE ──────────────────────────────────────────────
export interface Profile {
  id: string;
  username: string;
  character_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// ── DnD CHARACTER SHEET ─────────────────────────────────────────
export interface CharacterSheet {
  id?: string;
  user_id: string;
  character_name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  max_hp: number;
  current_hp: number;
  armor_class: number;
  speed: number;
  inspiration: boolean;
  proficiency_bonus: number;
  saving_throws: string[];
  skill_proficiencies: string[];
  experience_points: number;
  notes: string | null;
}

export interface DndStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export const STAT_LABELS: Record<keyof DndStats, string> = {
  strength: 'Fuerza',
  dexterity: 'Destreza',
  constitution: 'Constitución',
  intelligence: 'Inteligencia',
  wisdom: 'Sabiduría',
  charisma: 'Carisma'
};

export const DND_SKILLS = [
  { name: 'Acrobacias', stat: 'dexterity' },
  { name: 'Arcanos', stat: 'intelligence' },
  { name: 'Atletismo', stat: 'strength' },
  { name: 'Engaño', stat: 'charisma' },
  { name: 'Historia', stat: 'intelligence' },
  { name: 'Intimidación', stat: 'charisma' },
  { name: 'Investigación', stat: 'intelligence' },
  { name: 'Juego de Manos', stat: 'dexterity' },
  { name: 'Medicina', stat: 'wisdom' },
  { name: 'Naturaleza', stat: 'intelligence' },
  { name: 'Percepción', stat: 'wisdom' },
  { name: 'Persuasión', stat: 'charisma' },
  { name: 'Religión', stat: 'intelligence' },
  { name: 'Sigilo', stat: 'dexterity' },
  { name: 'Supervivencia', stat: 'wisdom' },
  { name: 'Trato con Animales', stat: 'wisdom' },
];

// ── SERVANT ──────────────────────────────────────────────────────
export type ServantClass =
  | 'Saber' | 'Archer' | 'Lancer' | 'Rider'
  | 'Caster' | 'Assassin' | 'Berserker' | 'Ruler'
  | 'Avenger' | 'Moon Cancer' | 'Shielder' | 'Foreigner';

export interface ServantStat {
  rank: string;   // E / D / C / B / A / A+ / EX
  value: number;
}

export interface ServantSkill {
  name: string;
  description: string;
  rank: string;
  locked_until: number; // friendship level 1-5
}

export interface NoblePhantasm {
  name: string;
  true_name: string;         // se revela en amistad 4
  type: string;
  rank: string;
  description: string;       // se revela en amistad 2
  true_description: string;  // se revela en amistad 5
}

export interface Servant {
  id?: string;
  user_id: string;
  class_name: ServantClass;
  alias: string;         // nombre que se muestra con poca amistad
  true_name: string;     // se revela en amistad 3
  avatar_url: string | null;
  friendship_level: number; // 1 a 5
  strength: ServantStat;
  endurance: ServantStat;
  agility: ServantStat;
  mana: ServantStat;
  luck: ServantStat;
  np: ServantStat;
  skills: ServantSkill[];
  noble_phantasm: NoblePhantasm;
  alignment: string;     // se revela en amistad 2
  origin: string;        // se revela en amistad 3
  lore: string;          // se revela en amistad 4
  true_lore: string;     // se revela en amistad 5
  bond_episode: string;  // se revela en amistad 5
}

// ── POSTS ────────────────────────────────────────────────────────
export interface Post {
  id?: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at?: string;
  profiles?: Profile;
}

// ── COMENTARIOS ──────────────────────────────────────────────
export interface PostComment {
  id?: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  profiles?: Profile;
}

// ── REACCIONES ───────────────────────────────────────────────
export interface PostReaction {
  id?: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at?: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean; // si el usuario actual ya reaccionó
}

export const REACTION_EMOJIS = ['⚔️', '✨', '🔥', '💙', '👑', '🌙'];