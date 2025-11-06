export type Stat = {
  type: string;
  value: number | string;
};

export type RelicPart = 'head' | 'hands' | 'body' | 'feet' | 'sphere' | 'rope';

export type RelicsState = {
  [key in RelicPart]: {
    mainStat: Stat;
  };
};

export const RELIC_PARTS: RelicPart[] = ['head', 'hands', 'body', 'feet', 'sphere', 'rope'];

export const RELIC_PART_NAMES: Record<RelicPart, string> = {
  head: '頭部',
  hands: '手部',
  body: '胴体',
  feet: '脚部',
  sphere: '次元界オーブ',
  rope: '連結縄',
};

export const MAIN_STATS: Record<RelicPart, string[]> = {
  head: ['HP'],
  hands: ['攻撃力'],
  body: ['HP%', '攻撃力%', '防御力%', '会心率', '会心ダメージ', '治癒量', '効果命中'],
  feet: ['HP%', '攻撃力%', '防御力%', '速度'],
  sphere: ['HP%', '攻撃力%', '防御力%', '物理与ダメージ', '炎与ダメージ', '氷与ダメージ', '雷与ダメージ', '風与ダメージ', '量子与ダメージ', '虚数与ダメージ'],
  rope: ['HP%', '攻撃力%', '防御力%', '撃破特効', 'EP回復効率'],
};

export const SUB_STATS: string[] = [
  'HP', '攻撃力', '防御力', 'HP%', '攻撃力%', '防御力%', '速度', '会心率', '会心ダメージ', '効果命中', '効果抵抗', '撃破特効'
];

export const MAIN_STAT_MAX_VALUES: { [key: string]: number } = {
  'HP': 705,
  '攻撃力': 352,
  '速度': 25,
  'HP%': 43.2,
  '攻撃力%': 43.2,
  '効果命中': 43.2,
  '防御力%': 54.0,
  '会心率': 32.4,
  '会心ダメージ': 64.8,
  '撃破特効': 64.8,
  '治癒量': 34.5,
  '物理与ダメージ': 38.8,
  '炎与ダメージ': 38.8,
  '氷与ダメージ': 38.8,
  '雷与ダメージ': 38.8,
  '風与ダメージ': 38.8,
  '量子与ダメージ': 38.8,
  '虚数与ダメージ': 38.8,
  'EP回復効率': 19.4,
};

/**
 * 遺物のメインステータスの中で、特殊な効果（属性与ダメージなど）を持つものをEffectとして定義します。
 * これにより、計算ロジック側でメインステータスを特別扱いする必要がなくなり、
 * Effectシステムに統合して一貫した処理が可能になります。
 */
export const MAIN_STAT_EFFECTS: { [key: string]: Effect } = {
  '物理与ダメージ': { id: 'main_stat_physical_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '物理与ダメージ': MAIN_STAT_MAX_VALUES['物理与ダメージ'] } },
  '炎与ダメージ': { id: 'main_stat_fire_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '炎与ダメージ': MAIN_STAT_MAX_VALUES['炎与ダメージ'] } },
  '氷与ダメージ': { id: 'main_stat_ice_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '氷与ダメージ': MAIN_STAT_MAX_VALUES['氷与ダメージ'] } },
  '雷与ダメージ': { id: 'main_stat_lightning_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '雷与ダメージ': MAIN_STAT_MAX_VALUES['雷与ダメージ'] } },
  '風与ダメージ': { id: 'main_stat_wind_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '風与ダメージ': MAIN_STAT_MAX_VALUES['風与ダメージ'] } },
  '量子与ダメージ': { id: 'main_stat_quantum_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '量子与ダメージ': MAIN_STAT_MAX_VALUES['量子与ダメージ'] } },
  '虚数与ダメージ': { id: 'main_stat_imaginary_dmg', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '虚数与ダメージ': MAIN_STAT_MAX_VALUES['虚数与ダメージ'] } },
  '治癒量': { id: 'main_stat_healing_boost', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '治癒量': MAIN_STAT_MAX_VALUES['治癒量'] } },
  '効果命中': { id: 'main_stat_effect_hit_rate', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': MAIN_STAT_MAX_VALUES['効果命中'] } },
  '撃破特効': { id: 'main_stat_break_effect', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': MAIN_STAT_MAX_VALUES['撃破特効'] } },
  'EP回復効率': { id: 'main_stat_ep_regen', source: 'メインステータス', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': MAIN_STAT_MAX_VALUES['EP回復効率'] } },
};

export interface RelicSetEffect {
  description: string;
  stats?: {
    [key: string]: number;
  };
  conditional?: {
    stat: 'spd' | 'critRate';
    threshold: number;
    bonus: { [key: string]: number };
  }[];
  // 将来的に他の特殊効果を実装するためのプロパティ
  special?: any;
  effects?: Effect[];
}

// --- Generic Effect System for Combat Simulation ---

export type EffectTarget = 'SELF' | 'ALLIES' | 'ENEMIES';

export type EffectType =
  | 'STAT_MOD'        // ステータス修飾 (ATK%, CRIT Rate, etc.)
  | 'DMG_BOOST'       // 与ダメージアップ
  | 'DEF_SHRED'       // 防御ダウン/無視
  | 'RES_PEN'         // 全属性耐性貫通
  | 'HEAL_BOOST'      // 治癒量アップ
  | 'DMG_TAKEN_INCREASE' // 被ダメージアップ
  | 'BREAK_EFFICIENCY_BOOST' // 弱点撃破効率アップ
  | 'SPECIAL_EFFECT'; // EP回復、行動順加速など、シミュレーションロジックで特別な処理が必要な効果

export type ActionType = 'ALL' | 'BASIC' | 'SKILL' | 'ULTIMATE' | 'FOLLOW_UP' | 'DOT';

export type EffectCondition = {
  type: 'HP_BELOW' | 'IN_STATE' | 'HAS_SUMMON' | 'IS_PARTY_MEMBER' | 'HAS_SHIELD_FROM_SOURCE';
  value?: number | string;
} | {
  type: 'STAT_GTE'; // Stat Greater Than or Equal
  stat: 'spd' | 'critRate' | 'effectRes' | 'atk' | 'hp';
  value: number;
}

export interface Effect {
  id: string; // A unique ID for this effect to be used in state
  source: string; // e.g., "追加能力：霊息浸しの鋼"
  target: EffectTarget;
  type: EffectType;
  // For STAT_MOD, the key is the stat name (e.g., '攻撃力%')
  // For DMG_BOOST, the key is the action type (e.g., 'ALL', 'ULTIMATE')
  // For others, it might be a generic key like 'value'
  value: number | { [key: string]: number };
  duration?: number; // in turns
  maxStacks?: number;
  currentStacks?: number;
  sourceActorIndex?: number; // Who applied this buff/debuff
  // Optional conditions for the effect to be active
  conditions?: EffectCondition[];
  // Is this effect togglable by the user in the UI?
  isToggleable?: boolean;
  defaultOn?: boolean;
  dotScaling?: {
    stat: 'atk';
    multiplier: number;
  };
}

export interface RelicSet {
  id: string;
  name:string;
  effects: {
    2?: RelicSetEffect;
    4?: RelicSetEffect;
  }
}

export interface PlanarOrnament extends RelicSet {
  effects: {
    2: RelicSetEffect;
  }
}

export const RELIC_SETS: RelicSet[] = [
  {
    id: 'musketeer_of_wild_wheat',
    name: '草の穂ガンマン',
    effects: {
      2: {
        description: '攻撃力+12%。',
        effects: [{ id: 'musketeer_2pc_atk', source: '草の穂ガンマン', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラの速度+6%、通常攻撃の与ダメージ+10%。',
        effects: [
          { id: 'musketeer_4pc_spd', source: '草の穂ガンマン', target: 'SELF', type: 'STAT_MOD', value: { '速度': 6 }, duration: Infinity },
          { id: 'musketeer_4pc_basic_dmg', source: '草の穂ガンマン', target: 'SELF', type: 'DMG_BOOST', value: { 'BASIC': 10 }, duration: Infinity }
        ]
      }
    }
  },
  {
    id: 'messenger_traversing_hackerspace',
    name: '仮想空間を漫遊するメッセンジャー',
    effects: {
      2: {
        description: '速度+6%。',
        effects: [{ id: 'messenger_2pc_spd', source: '仮想空間を漫遊するメッセンジャー', target: 'SELF', type: 'STAT_MOD', value: { '速度': 6 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラが味方に対して必殺技を発動した時、味方全体の速度+12%、1ターン継続。この効果は累積できない。',
        effects: [{ id: 'messenger_4pc_party_spd', source: '仮想空間を漫遊するメッセンジャー', target: 'ALLIES', type: 'STAT_MOD', value: { '速度': 12 }, duration: 1 }]
      }
    }
  },
  {
    id: 'genius_of_brilliant_stars',
    name: '星の如く輝く天才',
    effects: {
      2: {
        description: '量子属性ダメージ+10%。',
        effects: [{ id: 'genius_2pc_quantum_dmg', source: '星の如く輝く天才', target: 'SELF', type: 'STAT_MOD', value: { '量子与ダメージ': 10 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラが敵にダメージを与えた時、敵の防御力を10%無視する。',
        effects: [{ id: 'genius_def_shred', source: '星の如く輝く天才', target: 'SELF', type: 'DEF_SHRED', value: 10 }]
      }
    }
  },
  {
    id: 'eagle_of_twilight_line',
    name: '昼夜の狭間を翔ける鷹',
    effects: {
      2: {
        description: '風属性ダメージ+10%。',
        effects: [{ id: 'eagle_2pc_wind_dmg', source: '昼夜の狭間を翔ける鷹', target: 'SELF', type: 'STAT_MOD', value: { '風与ダメージ': 10 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラが必殺技を発動した後、行動順が25%早まる。',
        // シミュレーションロジックで実装が必要
      }
    }
  },
  {
    id: 'thief_of_shooting_meteor',
    name: '流星の跡を追う怪盗',
    effects: {
      2: {
        description: '撃破特効+16%。',
        effects: [{ id: 'thief_2pc_break', source: '流星の跡を追う怪盗', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 16 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラの撃破特効+16%。装備キャラが敵を弱点撃破した後、EPを3回復する。',
        effects: [
          { id: 'thief_4pc_break', source: '流星の跡を追う怪盗', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 16 }, duration: Infinity }
        ]
      }
    }
  },
  {
    id: 'longevous_disciple',
    name: '宝命長存の蒔者',
    effects: {
      2: {
        description: '最大HP+12%。',
        effects: [{ id: 'longevous_2pc_hp', source: '宝命長存の蒔者', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 12 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラが攻撃を受ける、または味方によってHPを消費させられた後、会心率+8%、2ターン継続。この効果は最大で2層累積できる。',
        effects: [{ id: 'longevous_crit_rate', source: '宝命長存の蒔者', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: 2, maxStacks: 2 }]
      }
    }
  },
  {
    id: 'the_grand_duke_incinerate',
    name: '灰燼を燃やし尽くす大公',
    effects: {
      2: {
        description: '追加攻撃の与ダメージ+20%。',
        effects: [{ id: 'grand_duke_followup_dmg', source: '灰燼を燃やし尽くす大公', target: 'SELF', type: 'DMG_BOOST', value: { 'FOLLOW_UP': 20 } }]
      },
      4: {
        description: '装備キャラが追加攻撃を行った時、追加攻撃のヒット数に応じて、ダメージを与えるたびに装備者の攻撃力+6%、最大8回まで累積でき、3ターン継続。この効果は、装備キャラが次の追加攻撃を行った時に解除される。',
        effects: [{ id: 'grand_duke_atk_stack', source: '灰燼を燃やし尽くす大公', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 6 }, duration: 3, maxStacks: 8 }]
      }
    }
  },
  {
    id: 'prisoner_in_deep_confinement',
    name: '深い牢獄の囚人',
    effects: {
      2: {
        description: '攻撃力+12%。',
        effects: [{ id: 'prisoner_2pc_atk', source: '深い牢獄の囚人', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity }]
      },
      4: {
        description: '敵に付与された持続ダメージ系デバフが1つにつき、装備キャラがその敵にダメージを与える時に防御力を6%無視する。持続ダメージ系デバフは最大で3つまでカウントされる。',
        effects: [{ id: 'prisoner_def_shred', source: '深い牢獄の囚人', target: 'SELF', type: 'DEF_SHRED', value: 6 }] // 1スタックあたりの値。スタック数はシミュレーションで計算
      }
    }
  },
  {
    id: 'priest_of_hardship',
    name: '再び苦難の道を歩む司祭',
    effects: {
      2: {
        description: '速度+6%。',
        effects: [{ id: 'priest_2pc_spd', source: '再び苦難の道を歩む司祭', target: 'SELF', type: 'STAT_MOD', value: { '速度': 6 }, duration: Infinity }]
      },
      4: {
        description: '味方単体に対して戦闘スキルまたは必殺技を発動する時、スキルターゲットの会心ダメージ+18%、2ターン継続。この効果は最大で2層累積できる。',
        effects: [{ id: 'priest_crit_dmg', source: '再び苦難の道を歩む司祭', target: 'ALLIES', type: 'STAT_MOD', value: { '会心ダメージ': 18 }, duration: 2, maxStacks: 2 }]
      }
    }
  },
  {
    id: 'scholar_in_the_sea_of_knowledge',
    name: '知識の海に溺れる学者',
    effects: {
      2: {
        description: '会心率+8%。',
        effects: [{ id: 'scholar_2pc_crit_rate', source: '知識の海に溺れる学者', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: Infinity }]
      },
      4: {
        description: '戦闘スキルおよび必殺技によるダメージ+20%。必殺技を発動した後、次に戦闘スキルを発動する時、与ダメージがさらに+25%。',
        effects: [
          { id: 'scholar_4pc_skill_ult_dmg', source: '知識の海に溺れる学者', target: 'SELF', type: 'DMG_BOOST', value: { 'SKILL': 20, 'ULTIMATE': 20 }, duration: Infinity },
          { id: 'scholar_4pc_next_skill_buff', source: '知識の海に溺れる学者 (次スキル)', target: 'SELF', type: 'DMG_BOOST', value: { 'SKILL': 25 }, duration: 1 }
        ]
      }
    }
  },
  {
    id: 'poet_of_a_lost_nation',
    name: '亡国の悲哀を詠う詩人',
    effects: {
      2: {
        description: '量子属性ダメージ+10%。',
        effects: [{ id: 'poet_2pc_quantum_dmg', source: '亡国の悲哀を詠う詩人', target: 'SELF', type: 'STAT_MOD', value: { '量子与ダメージ': 10 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラの速度-8%。戦闘に入る前、装備キャラの速度が110/95を下回る時、装備キャラの会心率+20%/32％。この効果は装備キャラの記憶の精霊にも有効。',
        effects: [
          { id: 'poet_4pc_spd_debuff', source: '亡国の悲哀を詠う詩人', target: 'SELF', type: 'STAT_MOD', value: { '速度': -8 }, duration: Infinity },
          { id: 'poet_4pc_crit_rate_buff', source: '亡国の悲哀を詠う詩人', target: 'SELF', type: 'STAT_MOD', value: {}, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'spd', value: 0 }] } // Placeholder, value set in sim
        ]
      }
    }
  },
  {
    id: 'war_god_of_sun_and_thunder',
    name: '烈陽と雷鳴の武神',
    effects: {
      2: {
        description: '速度+6%。',
        effects: [{ id: 'war_god_2pc_spd', source: '烈陽と雷鳴の武神', target: 'SELF', type: 'STAT_MOD', value: { '速度': 6 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラまたは記憶の精霊が、装備キャラおよびその記憶の精霊以外の味方を治癒した後、装備キャラは「慈雨」を獲得する。この効果は1ターンに最大1回まで発動でき、2ターン継続する。また、装備キャラが「慈雨」を持っている場合、速度+6%、味方全体の会心ダメージ+15%、この効果は累積できない。',
        effects: [{ id: 'war_god_4pc_ciyu_trigger', source: '慈雨', target: 'SELF', type: 'STAT_MOD', value: {}, duration: 2 },
        { id: 'war_god_4pc_ciyu_active_spd', source: '慈雨 (発動中)', target: 'SELF', type: 'STAT_MOD', value: { '速度': 6 }, duration: Infinity, conditions: [{ type: 'IN_STATE', value: '慈雨' }] },
        { id: 'war_god_4pc_ciyu_active_crit_dmg', source: '慈雨 (発動中)', target: 'ALLIES', type: 'STAT_MOD', value: { '会心ダメージ': 15 }, duration: Infinity, conditions: [{ type: 'IN_STATE', value: '慈雨' }] }]
      }
    }
  },
  {
    id: 'hermit_who_hides_the_starlight',
    name: '星の光を隠した隠者',
    effects: {
      2: {
        description: '付与するバリアの耐久値+10%。',
        effects: [{ id: 'hermit_2pc_shield_boost', source: '星の光を隠した隠者', target: 'SELF', type: 'STAT_MOD', value: { 'バリア耐久値%': 10 }, duration: Infinity }]
      },
      4: {
        description: '装備キャラが付与するバリアの耐久値+12%。装備キャラが付与したバリアを持つ味方の会心ダメージ+15%。',
        effects: [{ id: 'hermit_4pc_shield_boost', source: '星の光を隠した隠者', target: 'SELF', type: 'STAT_MOD', value: { 'バリア耐久値%': 12 }, duration: Infinity }, { id: 'hermit_4pc_crit_dmg_buff', source: '星の光を隠した隠者', target: 'ALLIES', type: 'STAT_MOD', value: { '会心ダメージ': 15 }, duration: Infinity, conditions: [{ type: 'HAS_SHIELD_FROM_SOURCE' }] }]
      }
    }
  }
];

export const PLANAR_ORNAMENTS: PlanarOrnament[] = [
  {
    id: 'space_sealing_station',
    name: '宇宙封印ステーション',
    effects: {
      2: {
        description: '攻撃力+12%。装備キャラの速度が120以上の場合、さらに攻撃力+12%。',
        effects: [
          { id: 'space_station_2pc_atk_base', source: '宇宙封印ステーション', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity },
          { id: 'space_station_2pc_atk_conditional', source: '宇宙封印ステーション (条件)', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'spd', value: 120 }] }
        ],
      }
    }
  },
  {
    id: 'fleet_of_the_ageless',
    name: '老いぬ者の仙舟',
    effects: {
      2: {
        description: '最大HP+12%。装備キャラの速度が120以上の場合、味方全体の攻撃力+8%。',
        effects: [
          { id: 'fleet_2pc_hp', source: '老いぬ者の仙舟', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 12 }, duration: Infinity },
          { id: 'fleet_2pc_party_atk', source: '老いぬ者の仙舟', target: 'ALLIES', type: 'STAT_MOD', value: { '攻撃力%': 8 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'spd', value: 120 }] }
        ],
      }
    }
  },
  {
    id: 'inert_salsotto',
    name: '自転が止まったサルソット',
    effects: {
      2: {
        description: '会心率+8%。装備キャラの会心率が50%以上の場合、必殺技と追加攻撃の与ダメージ+15%。',
        effects: [
          { id: 'salsotto_2pc_crit_rate', source: '自転が止まったサルソotto', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: Infinity },
          { id: 'salsotto_2pc_dmg_boost', source: '自転が止まったサルソット', target: 'SELF', type: 'DMG_BOOST', value: { 'ULTIMATE': 15, 'FOLLOW_UP': 15 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'critRate', value: 50 }] }
        ],
      }
    }
  },
  {
    id: 'live_giving_wenge',
    name: '生命のウェンワーク',
    effects: {
      2: {
        description: '装備キャラのEP回復効率+5%。装備キャラの速度が120以上の場合、戦闘に入る時、行動順が40%早まる。',
        effects: [{ id: 'wenge_2pc_ep_regen', source: '生命のウェンワーク', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 5 }, duration: Infinity }],
        // 行動順短縮はシミュレーションロジックで実装が必要
      }
    }
  },
  {
    id: 'arena_of_the_stars',
    name: '星々の競技場',
    effects: {
      2: {
        description: '装備キャラの会心率+8%。装備キャラの会心率が70%以上の時、通常攻撃と戦闘スキルの与ダメージ+20%。',
        effects: [
          { id: 'arena_2pc_crit_rate', source: '星々の競技場', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: Infinity },
          { id: 'arena_dmg_boost', source: '星々の競技場', target: 'SELF', type: 'DMG_BOOST', value: { 'BASIC': 20, 'SKILL': 20 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'critRate', value: 70 }] }
        ]
      }
    }
  },
  {
    id: 'broken_keel',
    name: '折れた竜骨',
    effects: {
      2: {
        description: '装備キャラの効果抵抗+10%。装備キャラの効果抵抗が30%以上の時、味方全体の会心ダメージ+10%。',
        effects: [
          { id: 'keel_2pc_eff_res', source: '折れた竜骨', target: 'SELF', type: 'STAT_MOD', value: { '効果抵抗': 10 }, duration: Infinity },
          { id: 'keel_crit_dmg_party', source: '折れた竜骨', target: 'ALLIES', type: 'STAT_MOD', value: { '会心ダメージ': 10 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'effectRes', value: 30 }] }
        ]
      }
    }
  },
  {
    id: 'rusalka_submerged_in_the_sea',
    name: '海に沈んだルサカ',
    effects: {
      2: {
        description: '装備キャラのEP回復効率+5%。装備キャラがパーティの1枠目のキャラでない場合、1枠目のキャラの攻撃力+12%。',
        effects: [
          { id: 'rusalka_2pc_ep_regen', source: '海に沈んだルサカ', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 5 }, duration: Infinity },
          { id: 'rusalka_atk_buff_party1', source: '海に沈んだルサカ', target: 'ALLIES', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity, conditions: [{ type: 'IS_PARTY_MEMBER', value: 0 }] } // 1番目のキャラに適用
        ],
      }
    }
  },
  {
    id: 'vanadice_of_the_bizarre',
    name: '奇想天外のバナダイス',
    effects: {
      2: {
        description: '装備キャラの会心ダメージ+16%。装備キャラが召喚したターゲットがフィールド上にいる場合、さらに会心ダメージ+32%。',
        effects: [
          { id: 'vanadice_2pc_crit_dmg_base', source: '奇想天外のバナダイス', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 16 }, duration: Infinity },
          { id: 'vanadice_2pc_crit_dmg_conditional', source: '奇想天外のバナダイス (召喚物)', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 32 }, duration: Infinity, conditions: [{ type: 'HAS_SUMMON' }] }
        ],
      }
    }
  },
  {
    id: 'great_tree_immersed_in_deep_thought',
    name: '深慮に浸る巨樹',
    effects: {
      2: {
        description: '装備キャラの速度+6%。装備キャラの速度が135/180以上の時、装備キャラ及びその記憶の精霊の治癒量+12%/20%。',
        effects: [
          { id: 'great_tree_2pc_spd', source: '深慮に浸る巨樹', target: 'SELF', type: 'STAT_MOD', value: { '速度': 6 }, duration: Infinity },
          { id: 'great_tree_heal_boost_1', source: '深慮に浸る巨樹', target: 'SELF', type: 'HEAL_BOOST', value: 12, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'spd', value: 135 }] },
          { id: 'great_tree_heal_boost_2', source: '深慮に浸る巨樹', target: 'SELF', type: 'HEAL_BOOST', value: 8, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'spd', value: 180 }] } // 12%にさらに8%追加で20%
        ],
      }
    }
  },
  {
    id: 'sea_of_drunkenness',
    name: '酩酊の海域',
    effects: {
      2: {
        description: '装備キャラの攻撃力+12%。装備キャラの攻撃力が2,400/3,600以上の場合、与える持続ダメージ+12%/24%。',
        effects: [
          { id: 'drunkenness_2pc_atk', source: '酩酊の海域', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity },
          { id: 'drunkenness_dot_dmg_1', source: '酩酊の海域', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 12 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'atk', value: 2400 }] },
          { id: 'drunkenness_dot_dmg_2', source: '酩酊の海域', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 12 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'atk', value: 3600 }] } // 12%にさらに12%追加で24%
        ],
      }
    }
  },
  {
    id: 'serene_ossuary',
    name: '静謐な拾骨地',
    effects: {
      2: {
        description: '装備キャラの最大HP+12%。装備キャラの最大HPが5,000以上の時、装備キャラおよびその記憶の精霊の会心ダメージ+28%。',
        effects: [
          { id: 'serene_ossuary_2pc_hp', source: '静謐な拾骨地', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 12 }, duration: Infinity },
          { id: 'serene_ossuary_2pc_crit_dmg', source: '静謐な拾骨地', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 28 }, duration: Infinity, conditions: [{ type: 'STAT_GTE', stat: 'hp', value: 5000 }] }
        ]
      }
    }
  }
];
