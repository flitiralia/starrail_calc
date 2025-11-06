import type { Effect, ScalingComponent } from './relics'; export type { ScalingComponent };

export interface TraceTalent {
  id: string;
  name: string;
  description: string;
  effects?: Effect[];
}

export interface Eidolon {
  id: string;
  level: number;
  name: string;
  description: string;
  effects?: Effect[];
}

export interface CharacterTraces {
  // 全開放時の合計ステータスボーナス
  totalStats: { [key: string]: number };
  talents: TraceTalent[];
}

export interface Action {
  name: string;
  description?: string;
  targetType: 'single' | 'blast' | 'aoe';
  damageScaling?: {
    main: ScalingComponent[];
    adjacent?: ScalingComponent[];
  };
  toughnessDamage?: {
    main: number;
    adjacent?: number;
  };
  healScaling?: {
    main: ScalingComponent[];
    adjacent?: ScalingComponent[];
  };
  epRecovery?: number;
  effects?: Effect[];
  isAttack?: boolean;
  isSpiritSkill?: boolean; // New flag for spirit skills
}

export type ActionTypeKey = 'basic' | 'skill' | 'ultimate' | 'follow_up' | 'enhanced_basic' | 'spirit_skill' | 'enhanced_spirit_skill' | 'spirit_talent'; // Modified

export interface Character {
  id: string;
  name: string;
  path: string;
  combatType: '物理' | '炎' | '氷' | '雷' | '風' | '量子' | '虚数';
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  maxEp?: number;
  baseHpMultiplier?: number; // For spirits like Icarun
  traces?: CharacterTraces;
  eidolons?: Eidolon[];
  actions?: {
    [key in ActionTypeKey]?: Action;
  };
  isTargetableSpirit?: boolean; // For spirits like Icarun that have HP and can be targeted.
  isUntargetableSpirit?: boolean; // For spirits like Dragon Spirit that are untargetable gimmicks.
  summonedSpiritId?: string; // Links summoner to spirit.
  summonerId?: string; // Links spirit to summoner.
  technique?: Action;
  talent?: Action;
}

export const characters: Character[] = [
  {
    id: "blade",
    name: "刃",
    path: "壊滅",
    combatType: "風",
    baseHp: 1358,
    baseAtk: 543,
    baseDef: 485,
    baseSpd: 97,
    maxEp: 130,
    traces: {
      totalStats: {
        'HP%': 28, // No change
        '会心率': 12,
        '効果抵抗': 10,
      },
      talents: [
        { id: 'blade-talent-new-1', name: '無尽形寿', description: '刃が必殺技を発動する時、クリアされる失ったHPの累計値が50%になる。' },
        { id: 'blade-talent-new-2', name: '百死耐忍', description: '治癒を受ける時の回復量+20%。治癒を受けた後、治癒量の25％分が必殺技で参照する失ったHPの累計値に加算される。', effects: [
          { id: 'blade-heal-boost', source: '百死耐忍', target: 'SELF', type: 'HEAL_BOOST', value: 20 }
        ]},
        { id: 'blade-talent-new-3', name: '壊劫滅亡', description: '天賦による追加攻撃の与ダメージ+20%、さらにEPを15回復する。', effects: [
          { id: 'blade-followup-boost', source: '壊劫滅亡', target: 'SELF', type: 'DMG_BOOST', value: { 'FOLLOW_UP': 20 } }
        ]},
        // 旧・霊息浸しの鋼の効果は戦闘スキルに統合
        { id: 'blade-skill-effect', name: '地獄変 (戦闘スキル)', description: '自身の与ダメージ+40%', effects: [
          { id: 'blade-dmg-boost-hell', source: '地獄変', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 40 }, conditions: [{ type: 'IN_STATE', value: '地獄変' }], isToggleable: true, defaultOn: true }
        ]}
      ]
    },
    eidolons: [
      { id: 'blade-e1', level: 1, name: '奈落の底に落ちても、業を斬り続ける剣', description: '必殺技が敵単体に与えるダメージが、刃の失ったHP150%分アップする。', effects: [] },
      { id: 'blade-e2', level: 2, name: '支離滅裂な誓い、支離滅裂な願い', description: '「地獄変」状態の時、会心率+15%。', effects: [
        { id: 'blade-e2-crit-rate', source: '星魂2', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 15 }, conditions: [{ type: 'IN_STATE', value: '地獄変' }] }
      ]},
      { id: 'blade-e3', level: 3, name: '鋼の如き十の王の裁き', description: '必殺技のLv.+2、最大Lv.15まで。天賦のLv.+2、最大Lv.15まで。', effects: [] },
      { id: 'blade-e4', level: 4, name: '生死を問わず、斬る', description: 'HPが50%を下回った時、自身の最大HP+20%。この効果は最大で2層累積できる。', effects: [] },
      { id: 'blade-e5', level: 5, name: '十の王の霊威、五つの苦しみの身', description: '戦闘スキルのLv.+2、最大Lv.15まで。通常攻撃のLv.+1、最大Lv.10まで。', effects: [] },
      { id: 'blade-e6', level: 6, name: '生まれ変わり、死に戻り', description: '被ダメージ後、天賦のチャージが最大になった時、チャージを1層消費し、すぐに追加攻撃を1回発動する。さらに、追加攻撃の与ダメージ+50%。', effects: [
        { id: 'blade-e6-followup-boost', source: '星魂6', target: 'SELF', type: 'DMG_BOOST', value: { 'FOLLOW_UP': 50 } }
      ]}
    ],
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体に刃の最大HP50%分の風属性ダメージを与える。ep20',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'hp', multiplier: 50 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '刃のHPを最大HP30%分消費して「地獄変」状態に入る。「地獄変」状態では戦闘スキルを発動できず、自身の与ダメージ+40%、敵に攻撃される確率が大幅に上がり、通常攻撃「支離剣」が「無間剣樹」に強化される、3ターン継続。',
        targetType: 'single', // No damage, just enters state
        damageScaling: {
          main: [],
        },
        isAttack: false,
        epRecovery: 0,
      },
      enhanced_basic: {
        name: '強化通常攻撃',
        description: '刃のHPを最大HP10%分消費し、指定した敵単体に刃の最大HP130%分の風属性ダメージを与え、隣接する敵に刃の最大HP52%分の風属性ダメージを与える。SPを回復できない。ep30',
        targetType: 'blast',
        damageScaling: {
          main: [
            { stat: 'hp', multiplier: 130 },
          ],
          adjacent: [
            { stat: 'hp', multiplier: 52 },
          ]
        },
        toughnessDamage: {
          main: 20,
          adjacent: 10,
        },
        isAttack: true,
        epRecovery: 30,
      },
      ultimate: {
        name: '必殺技',
        description: '刃の残りHPを最大HPの50%にし、敵単体に刃の最大HP150%+戦闘中失ったHPの累計120%分の風属性ダメージを与え、隣接する敵に刃の最大HP60%+戦闘中失ったHPの累計60%分の風属性ダメージを与える。戦闘中失ったHPの累計のカウントは刃の最大HPの90%を超えず、必殺技を発動した後にリセットされる。ep5',
        targetType: 'blast',
        damageScaling: {
          main: [
            { stat: 'hp', multiplier: 150.0 },
            { stat: 'lostHp', multiplier: 120.0 },
          ],
          adjacent: [
            { stat: 'hp', multiplier: 60.0 },
            { stat: 'lostHp', multiplier: 60.0 },
          ]
        },
        toughnessDamage: {
          main: 20,
          adjacent: 20,
        },
        isAttack: true,
        epRecovery: 5,
      },
      follow_up: {
        name: '天賦(追加攻撃)',
        description: '刃がダメージを受ける、またはHPを消費した時、チャージを1層獲得する。チャージは最大で5層累積できる。この効果は攻撃を1回受ける度に1層まで累積できる。チャージが上限に達した時、敵全体に追加攻撃を1回行い、刃の最大HP130%分の風属性ダメージを与え、刃の最大HP25%分のHPを回復する。追加攻撃を行った後、すべてのチャージを消費する。ep10',
        targetType: 'aoe',
        damageScaling: {
          main: [
            { stat: 'hp', multiplier: 130 },
          ]
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 10,
      },
    },
    technique: {
      name: '秘技',
      description: '敵を攻撃。戦闘に入った後、刃の最大HP20%分のHPを消費し、敵全体に刃の最大HP40%分の風属性ダメージを与える。残りHPが足りない場合、秘技を発動した時、刃の残りHPが1になる。',
      targetType: 'aoe',
      isAttack: true,
      damageScaling: {
        main: [{ stat: 'hp', multiplier: 40 }],
      }
    }
  },
  {
    id: "toribii",
    name: "トリビー",
    path: "調和",
    combatType: "量子",
    baseHp: 1047,
    baseAtk: 524,
    baseDef: 728,
    baseSpd: 96,
    maxEp: 120,
    traces: {
      totalStats: {
        '会心ダメージ': 37.3,
        '会心率': 12,
        'HP%': 10,
      },
      talents: [
        { id: 'toribii-talent1', name: '壁の外の子羊…', description: '天賦の追加攻撃を行った後、トリビーの与ダメージ+72%。この効果は最大で3層累積できる、3ターン継続する。', effects: [
          { id: 'toribii-dmg-boost-stack', source: '壁の外の子羊…', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 72 }, duration: 3, maxStacks: 3 }
        ]},
        { id: 'toribii-talent2', name: '羽の生えたガラス玉！', description: '結界が展開されている間、トリビーの最大HPが味方全体の最大HP合計値9%分アップする。', effects: [
          { id: 'toribii-hp-buff-from-party', source: '羽の生えたガラス玉！', target: 'SELF', type: 'STAT_MOD', value: {} }
        ]},
        { id: 'toribii-talent3', name: '分かれ道の傍の小石？', description: '戦闘開始時、トリビーがEPを30回復する。トリビー以外の味方が攻撃を行った後、命中した敵1体につき、トリビーがEPを1.5回復する。' },
      ]
    },
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体にトリビーの最大HP27%分の量子属性ダメージを与え、隣接する敵にトリビーの最大HP13%分の量子属性ダメージを与える。ep20',
        targetType: 'blast',
        damageScaling: {
          main: [{ stat: 'hp', multiplier: 27 }],
          adjacent: [{ stat: 'hp', multiplier: 13 }],
        },
        toughnessDamage: {
          main: 10,
          adjacent: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '「神の啓示」を獲得する。3ターン継続。自身のターンが回ってくるたびに、「神の啓示」の継続時間-1ターン。\nトリビーに「神の啓示」がある時、味方全体の全属性耐性貫通+24%。ep30',
        targetType: 'single', // Buff action, no damage
        damageScaling: {
          main: [],
        },
        isAttack: false,
        epRecovery: 30,
        effects: [
          { id: 'toribii-skill-res-pen', source: '神の啓示', target: 'ALLIES', type: 'RES_PEN', value: 24, duration: 3 }
        ]
      },
      ultimate: {
        name: '必殺技',
        description: '結界を展開し、敵全体にトリビーの最大HP30%分の量子属性ダメージを与える。結界が展開されている間、敵の受けるダメージ+30%。\n敵が味方の攻撃を受けた後、攻撃を受けた敵1体につき、その敵の中で残りHPが最も高い敵に、トリビーの最大HP12%分の量子属性付加ダメージを1回与える。\n結界は2ターン継続。自身のターンが回ってくるたびに、「結界」の継続時間-1ターン。ep5',
        targetType: 'aoe',
        damageScaling: {
          main: [{ stat: 'hp', multiplier: 30 }],
        },
        toughnessDamage: {
          main: 20,
        },
        isAttack: true,
        epRecovery: 5,
        effects: [
          { id: 'toribii-ult-vuln', source: '結界', target: 'ENEMIES', type: 'DMG_TAKEN_INCREASE', value: 30, duration: 2 }
        ]
      },
      follow_up: {
        name: '天賦(追加攻撃)',
        description: '自身以外の味方キャラが必殺技を発動した後、トリビーが追加攻撃を行い、敵全体にトリビーの最大HPの18%分の量子属性ダメージを与える。\nこの効果はトリビーを除いた味方キャラ1人につき1回のみ発動でき、トリビーが必殺技を発動するとこの回数がリセットされる。\n追加攻撃を行う前に、ターゲットがすでに倒された場合、新たに登場した敵に追加攻撃を発動する。ep5',
        targetType: 'aoe',
        damageScaling: {
          main: [{ stat: 'hp', multiplier: 18 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 5,
      },
    },
    technique: {
      name: '秘技',
      description: '秘技を使用した後、戦闘に入る時に「神の啓示」を獲得する。3ターン継続。',
      targetType: 'single', // Buff
      isAttack: false,
      damageScaling: { main: [] },
      effects: [
        { id: 'toribii-skill-res-pen', source: '神の啓示 (秘技)', target: 'ALLIES', type: 'RES_PEN', value: 24, duration: 3 }
      ]
    }
  },
  {
    id: "archer",
    name: "アーチャー",
    path: "巡狩",
    combatType: "量子",
    baseHp: 1164,
    baseAtk: 620,
    baseDef: 485,
    baseSpd: 105,
    maxEp: 220,
    traces: {
      totalStats: {
        '量子与ダメージ': 22.4,
        '会心率': 6.7,
        '攻撃力%': 18,
      },
      talents: [
        { id: 'archer-talent1', name: '投影魔術', description: 'アーチャーがフィールド上にいる時、最大SP+2。' },
        { id: 'archer-talent2', name: '正義の味方', description: 'アーチャーが戦闘に入る時、チャージを1獲得する。' },
        { id: 'archer-talent3', name: '守護者', description: '味方がSPを獲得した後、SPが4以上の場合、アーチャーの会心ダメージ+120%、1ターン継続。', effects: [
          { id: 'archer-guardian-crit-dmg', source: '守護者', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 120 }, duration: 1 }
        ]},
      ]
    },
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体にアーチャーの攻撃力100%分の量子属性ダメージを与える。ep20',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 100 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '「回路接続」状態に入る。指定した敵単体にアーチャーの攻撃力360%分の量子属性ダメージを与える。「回路接続」状態の時、戦闘スキルを発動してもターンは終了しない。また、アーチャーの戦闘スキルによるダメージ+100%、この効果は「回路接続」状態が解除されるまで最大で2層累積できる。戦闘スキルを5回発動した後、またはSPが不足し、再度戦闘スキルを発動できなくなった時、「回路接続」状態は解除される。また、各ウェーブの敵がすべて倒された後も、「回路接続」状態は解除される。ep30',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 360 }],
        },
        toughnessDamage: {
          main: 20,
        },
        isAttack: true,
        epRecovery: 30,
        effects: [
          { id: 'archer-skill-state', source: '回路接続', target: 'SELF', type: 'DMG_BOOST', value: { 'SKILL': 100 }, maxStacks: 2, duration: 1 },
          { id: 'archer-no-turn-end', source: '回路接続', target: 'SELF', type: 'STAT_MOD', value: {} } // A marker for the simulation engine
        ]
      },
      ultimate: {
        name: '必殺技',
        description: '指定した敵単体にアーチャーの攻撃力1000%分の量子属性ダメージを与え、チャージを2獲得する。チャージは最大で4累積できる。ep5',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 1000 }],
        },
        toughnessDamage: {
          main: 30,
        },
        isAttack: true,
        epRecovery: 5,
        // Special effect: Gain 2 "Charge"
      },
      follow_up: {
        name: '天賦(追加攻撃)',
        description: 'アーチャー以外の味方が敵に攻撃を行った後、アーチャーが即座にチャージを1消費してメインターゲットに追加攻撃を行い、アーチャーの攻撃力200%分の量子属性ダメージを与える。この時SPを1回復する。この追加攻撃を行う前にターゲットが倒された場合、ランダムな敵単体に追加攻撃を行う。ep5',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 200 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 5,
        // Special effect: Consumes 1 "Charge", recovers 1 SP
      },
    },
    technique: {
      name: '秘技',
      description: '敵を攻撃。戦闘に入った後、敵全体にアーチャーの攻撃力200%分の量子属性ダメージを与える、チャージを1獲得する。',
      targetType: 'aoe',
      isAttack: true,
      damageScaling: { main: [{ stat: 'atk', multiplier: 200 }] }
    }
  },
  {
    id: "hanya",
    name: "寒鴉",
    path: "調和",
    combatType: "物理",
    baseHp: 917,
    baseAtk: 564,
    baseDef: 352,
    baseSpd: 110,
    maxEp: 140,
    traces: {
      totalStats: {
        'HP%': 10,
        '速度': 9,
        '攻撃力%': 28,
      },
      talents: [
        { id: 'hanya-talent1', name: '録事', description: '「承負」によるSP回復効果を発動させた味方の攻撃力+10%、1ターン継続。' },
        { id: 'hanya-talent2', name: '幽府', description: '「承負」を持つ敵が倒された時、その敵が持つ「承負」によるSP回復効果の発動回数が1回以下の場合、さらにSPを1回復する。' },
        { id: 'hanya-talent3', name: '還陽', description: '「承負」によるSP回復効果が発動された時、自身のEPを2回復する。' },
      ]
    },
    eidolons: [
      { id: 'hanya-e1', level: 1, name: '一心', description: '必殺技のバフを持つ味方が敵を倒した時、寒鴉の行動順が15%早まる。この効果はターンが回ってくるたびに1回まで発動できる。' },
      { id: 'hanya-e2', level: 2, name: '二観', description: '戦闘スキルを発動した後、速度+20%、1ターン継続。', effects: [
        { id: 'hanya-e2-spd-boost', source: '星魂2', target: 'SELF', type: 'STAT_MOD', value: { '速度': 20 }, duration: 1 }
      ]},
      { id: 'hanya-e3', level: 3, name: '三塵', description: '戦闘スキルのLv.+2、最大Lv.15まで。通常攻撃のLv.+1、最大Lv.10まで。' },
      { id: 'hanya-e4', level: 4, name: '四諦', description: '必殺技の継続時間+1ターン。' },
      { id: 'hanya-e5', level: 5, name: '五陰', description: '必殺技のLv.+2、最大Lv.15まで。天賦のLv.+2、最大Lv.15まで。' },
      { id: 'hanya-e6', level: 6, name: '六正', description: '天賦のダメージアップ効果がさらに10%アップ。' }
    ],
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体に寒鴉の攻撃力100%分の物理ダメージを与える。ep20',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 100 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '敵単体に「承負」状態を付与して、寒鴉の攻撃力240%分の物理ダメージを与える。味方が「承負」状態の敵に通常攻撃、戦闘スキル、または必殺技のうち任意のスキルを合わせて2回発動するたびに、SPを1回復する。「承負」は最後に付与されたターゲットにのみ効果を発揮し、SP回復効果を2発動した後に自動で解除される。ep30',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 240 }],
        },
        toughnessDamage: {
          main: 20,
        },
        isAttack: true,
        epRecovery: 30,
        effects: [
          { id: 'hanya-burden-debuff', source: '承負', target: 'ENEMIES', type: 'DMG_TAKEN_INCREASE', value: 30, duration: 999 } // Duration managed by hit count
        ]
      },
      ultimate: {
        name: '必殺技',
        description: '指定した味方の速度を、寒鴉の速度の20%分アップし、その味方の攻撃力+60%、2ターン継続。ep5',
        targetType: 'single', // Buffs a single ally
        damageScaling: { main: [] },
        isAttack: false,
        epRecovery: 5,
        effects: [
          { id: 'hanya-ult-spd-boost', source: '必殺技 (速度)', target: 'ALLIES', type: 'STAT_MOD', value: { '速度': 0.20 }, duration: 2 }, // Value is multiplier of Hanya's speed
          { id: 'hanya-ult-atk-boost', source: '必殺技 (攻撃力)', target: 'ALLIES', type: 'STAT_MOD', value: { '攻撃力%': 60 }, duration: 2 }
        ]
      },
      follow_up: { // This is a passive buff, but fits the 'follow_up' key for now
        name: '天賦',
        description: '味方が「承負」状態の敵に通常攻撃、戦闘スキル、または必殺技を発動した時、与ダメージ+30%、2ターン継続。',
        targetType: 'single', // This is a buff applied to an ally
        damageScaling: { main: [] },
        isAttack: false, // This is a buff trigger, not an attack itself
        epRecovery: 0,
        effects: [
          { id: 'hanya-talent-dmg-boost', source: '天賦', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 30 }, duration: 2 }
        ]
      },
    },
    technique: {
      name: '秘技',
      description: '戦闘に入った後、ランダムな敵単体に戦闘スキルが与えるものと同じ「承負」状態を付与する。',
      targetType: 'single', // Debuff
      isAttack: false,
      damageScaling: { main: [] },
      effects: [
        { id: 'hanya-burden-debuff-tech', source: '承負 (秘技)', target: 'ENEMIES', type: 'DMG_TAKEN_INCREASE', value: 0 } // Marker effect
      ]
    }
  },
  {
    id: "luocha",
    name: "羅刹",
    path: "豊穣",
    combatType: "虚数",
    baseHp: 1280,
    baseAtk: 756,
    baseDef: 363,
    baseSpd: 101,
    maxEp: 100,
    traces: {
      totalStats: {
        '攻撃力%': 28,
        'HP%': 18,
        '防御力%': 12.5,
        '効果抵抗': 70, // 幽谷を越え
      },
      talents: [
        { id: 'luocha-talent1', name: '滴水蘇生', description: '戦闘スキルの効果が触発された時、ターゲットとなった味方単体のデバフを1つ解除する。' },
        { id: 'luocha-talent2', name: '清めし塵の身', description: '結界内の任意の敵が味方の攻撃を受けた後、攻撃者以外の味方も羅刹の攻撃力7.0%+93のHPを回復する。' },
        { id: 'luocha-talent3', name: '幽谷を越え', description: '行動制限系デバフを抵抗する確率+70%。' },
      ]
    },
    eidolons: [
      {
        id: 'luocha-e1', level: 1, name: '生者の浄化', description: '結界が発動している間、味方全体の攻撃力+20%。',
        effects: [
          { id: 'luocha-e1-atk-boost', source: '星魂1', target: 'ALLIES', type: 'STAT_MOD', value: { '攻撃力%': 20 }, conditions: [{ type: 'IN_STATE', value: '結界' }] }
        ]
      },
      {
        id: 'luocha-e2', level: 2, name: '純庭の礼賜', description: '戦闘スキルの効果が触発された時、指定した味方の残りHPが50%未満の場合、羅刹の治癒量+30%。指定した味方の残りHPが50%以上の場合、その味方に羅刹の攻撃力18%+240の耐久値を持つバリアを付与する、2ターン継続。',
        effects: [
          { id: 'luocha-e2-heal-boost', source: '星魂2', target: 'SELF', type: 'HEAL_BOOST', value: 30, conditions: [{ type: 'HP_BELOW', value: 50 }] }
        ]
      },
      { id: 'luocha-e3', level: 3, name: '愚者の模索', description: '戦闘スキルのLv.+2、最大Lv.15まで。通常攻撃のLv.+1、最大Lv.10まで。', effects: [] },
      {
        id: 'luocha-e4', level: 4, name: '荊の審判', description: '結界が存在する間、敵を虚弱状態にし、敵の与ダメージ-12%。',
        effects: [] // Note: Enemy DMG reduction is not yet implemented in the simulator.
      },
      { id: 'luocha-e5', level: 5, name: '受難の痕', description: '必殺技のLv.+2、最大Lv.15まで。天賦のLv.+2、最大Lv.15まで。', effects: [] },
      {
        id: 'luocha-e6', level: 6, name: '皆灰燼に帰す', description: '必殺技を発動した時、100%の固定確率で敵全体の全耐性-20%、2ターン継続。',
        effects: [
          { id: 'luocha-e6-res-pen', source: '星魂6', target: 'ENEMIES', type: 'RES_PEN', value: 20, duration: 2 }
        ]
      }
    ],
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体に羅刹の攻撃力100%分の虚数属性ダメージを与える。ep20',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 100 }],
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '戦闘スキルを発動した後、指定した味方単体のHPを、羅刹の攻撃力60%+800回復し、羅刹は「白花の刻」を1層獲得する。任意の味方単体の残りHPが50%以下の時、その味方をターゲットとして、羅刹の戦闘スキルと同等の効果が1回触発される、この行動はSPを消費しない。この効果は2ターン後に再度触発できる。ep30',
        targetType: 'single',
        healScaling: {
          main: [
            { stat: 'atk', multiplier: 60, flat: 800 }
          ],
        },
        isAttack: false,
        epRecovery: 30,
      },
      ultimate: {
        name: '必殺技',
        description: '敵全体のバフを1つ解除し、敵全体に羅刹の攻撃力200%分の虚数属性ダメージを与える。羅刹は「白花の刻」を1層獲得する。ep5',
        targetType: 'aoe',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 200 }],
        },
        isAttack: true,
        epRecovery: 5,
      },
      follow_up: { // Represents the Talent field effect
        name: '天賦',
        description: '「白花の刻」が2層に達した時、羅刹が「白花の刻」をすべて消費し、結界を張る。結界内の任意の敵が攻撃を受けた後、攻撃を行った味方は羅刹の攻撃力18%+240のHPを回復する。結界は2ターン継続する。羅刹が戦闘不能状態になった時、結界は解除される。',
        targetType: 'aoe', // Field effect
        damageScaling: { main: [] },
        healScaling: {
          main: [{ stat: 'atk', multiplier: 18, flat: 240 }], // 結界の回復
          adjacent: [{ stat: 'atk', multiplier: 7, flat: 93 }] // 清めし塵の身の回復
        },
        isAttack: false,
        epRecovery: 0,
        effects: [
          { id: 'luocha-field', source: '結界', target: 'ALLIES', type: 'STAT_MOD', value: {}, duration: 2 } // Marker for the field
        ]
      },
    },
    technique: {
      name: '秘技',
      description: '秘技を使用した後、次の戦闘開始時、天賦を発動する。',
      targetType: 'single', // Buff
      isAttack: false,
      damageScaling: { main: [] },
      effects: [
        { id: 'luocha-field-tech', source: '結界 (秘技)', target: 'ALLIES', type: 'STAT_MOD', value: {}, duration: 2 } // Marker for the field
      ]
    }
  },
  {
    id: "xianci",
    name: "ヒアンシー",
    path: "記憶",
    combatType: "風",
    baseHp: 1086,
    baseAtk: 388,
    baseDef: 630,
    baseSpd: 110,
    maxEp: 140,
    summonedSpiritId: "icarun", // Link to Icarun
    traces: {
      totalStats: {
        'HP%': 10,
        '効果抵抗': 18,
        '速度': 14,
      },
      talents: [
        { id: 'xianci-talent1', name: '微笑む暗雲', description: 'ヒアンシーと「イカルン」の会心率+100%。残りHPが最大HP50%以下の味方に治癒を行う時、ヒアンシーとイカルンの治癒量+25%。', effects: [
          { id: 'xianci-icarun-crit-rate', source: '微笑む暗雲', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 100 }, conditions: [{ type: 'IN_STATE', value: 'イカルン召喚中' }] }, // Apply to Icarun
          { id: 'xianci-heal-boost', source: '微笑む暗雲', target: 'SELF', type: 'HEAL_BOOST', value: 25, conditions: [{ type: 'HP_BELOW', value: 50 }] } // Apply to Xianci
        ]},
        { id: 'xianci-talent2', name: '優しい雷雨', description: 'ヒアンシーの効果抵抗+50%。戦闘スキルまたは必殺技を発動する時、味方それぞれのデバフを1つ解除する。' },
        { id: 'xianci-talent3', name: '凪いだ暴風', description: 'ヒアンシーの速度が200を超える時、ヒアンシーと「イカルン」の最大HP+20%。超過した速度1につき、ヒアンシーとイカルンの治癒量+1%、超過した速度は最大200までカウントされる。', effects: [] }
      ]
    },
    eidolons: [
      { id: 'xianci-e1', level: 1, name: '闇夜の灯火を守って', description: 'ヒアンシーが「雨上がり」状態の時、味方それぞれの最大HPアップ効果がさらに50%アップし、味方が攻撃を行った後、その味方のHPをヒアンシーの最大HP8%分回復する。' },
      { id: 'xianci-e2', level: 2, name: 'わたしの庭でくつろいで', description: '味方のHPが減った時、その味方の速度+30%、2ターン継続。' },
      { id: 'xianci-e3', level: 3, name: '出発！太陽へ向かう冒険', description: '必殺技のLv.+2、最大Lv.15まで。通常攻撃のLv.+1、最大Lv.10まで。精霊スキルのLv.+1、最大Lv.10まで。' },
      { id: 'xianci-e4', level: 4, name: 'お日様色の琥珀をあなたに', description: '軌跡「凪いだ暴風」が強化される。超過した速度1につき、さらにヒアンシーと「イカルン」の会心ダメージ+2%。' },
      { id: 'xianci-e5', level: 5, name: '海に揺らぐ赤い霞', description: '戦闘スキルのLv.+2、最大Lv.15まで。天賦のLv.+2、最大Lv.15まで。精霊天賦のLv.+1、最大Lv.10まで。' },
      {
        id: 'xianci-e6', level: 6, name: '天空よ…願いを叶えたまえ', description: '「イカルン」が精霊スキルを発動した後、クリアされる累計治癒量の割合が12%になる。イカルンがフィールド上にいる時、味方全体の全属性耐性貫通+20%。',
        effects: [ // This effect applies to ALLIES if Icarun is present
          { id: 'xianci-e6-res-pen', source: '星魂6', target: 'ALLIES', type: 'RES_PEN', value: 20, conditions: [{ type: 'IN_STATE', value: 'イカルン召喚中' }] }
        ]
      },
    ],
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体にヒアンシーの最大HP50%分の風属性ダメージを与える。ep20',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'hp', multiplier: 50 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '記憶の精霊「イカルン」を召喚する。イカルン以外の味方全体のHPを、ヒアンシーの最大HP8%+160回復する。イカルンのHPをヒアンシーの最大HP10%+200回復する。ep30',
        targetType: 'aoe', // Heal
        damageScaling: {
          main: [],
        },
        healScaling: {
          main: [
            { stat: 'hp', multiplier: 8, flat: 160 }
          ],
        },
        toughnessDamage: {
          main: 20,
        },
        isAttack: false,
        epRecovery: 30,
      },
      ultimate: {
        name: '必殺技',
        description: '記憶の精霊「イカルン」を召喚する。イカルン以外の味方全体のHPを、ヒアンシーの最大HP10%+200回復する。イカルンのHPをヒアンシーの最大HP12%+240回復する。ヒアンシーは「雨上がり」状態に入る。3ターン継続。ヒアンシーのターンが回ってくるたびに継続時間-1ターン。ヒアンシーが「雨上がり」状態の時、味方それぞれの最大HPが30%+600アップ。ep5',
        targetType: 'aoe', // Heal + Buff
        healScaling: {
          main: [
            { stat: 'hp', multiplier: 10, flat: 200 }
          ],
        },
        toughnessDamage: {
          main: 20,
        },
        isAttack: false,
        epRecovery: 5,
        effects: [
          { id: 'xianci-ult-state', source: '雨上がり', target: 'SELF', type: 'STAT_MOD', value: {}, duration: 3 },
          { id: 'xianci-ult-hp-buff', source: '雨上がり', target: 'ALLIES', type: 'STAT_MOD', value: { 'HP%': 30, 'HP': 600 }, duration: 3 }
        ]
      },
      follow_up: { // Represents Icarun's actions
        name: '精霊スキル',
        description: '敵全体に、ヒアンシーと「イカルン」の本戦闘における累計治癒量の20%分の風属性ダメージを与える。',
        targetType: 'aoe',
        damageScaling: {
          main: [], // Special scaling based on total healing
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 0,
      },
      spirit_talent: { // Icarun's talent heal, defined under Xianci for scaling reference
        name: '精霊天賦',
        description: 'HPが減った味方のHPをヒアンシーの最大HP2%+20回復する。',
        targetType: 'single',
        healScaling: {
          main: [{ stat: 'hp', multiplier: 2, flat: 20 }]
        },
        isAttack: false,
        epRecovery: 0
      }
    },
    technique: {
      name: '秘技',
      description: '次の戦闘開始時、味方全体のHPをヒアンシーの最大HP30%+600回復する。また、味方それぞれの最大HP+20%、2ターン継続。',
      targetType: 'aoe', // Buff
      isAttack: false,
      damageScaling: { main: [] },
      effects: [
        { id: 'xianci-tech-hp-buff', source: '秘技', target: 'ALLIES', type: 'STAT_MOD', value: { 'HP%': 20 }, duration: 2 }
      ]
    }
  },
  {
    id: "icarun",
    name: "イカルン",
    path: "記憶", // Placeholder
    combatType: "風",
    baseHp: 0, // Derived from Xianci
    baseAtk: 0, // Derived from Xianci
    baseDef: 0, // Derived from Xianci
    baseSpd: 0, // Fixed at 0
    baseHpMultiplier: 0.5, // 50% of summoner's max HP
    isTargetableSpirit: true, // For spirits like Icarun that have HP and can be targeted.
    actions: {
      spirit_skill: {
        name: '精霊スキル',
        description: '敵全体に、ヒアンシーと「イカルン」の本戦闘における累計治癒量の20%分の風属性ダメージを与える。',
        targetType: 'aoe',
        damageScaling: {
          main: [
            { stat: 'icarunTotalHealing', multiplier: 20 }
          ]
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        isSpiritSkill: true,
        epRecovery: 0,
      }
    }
  },

  {
    id: "ruan_mei",
    name: "ルアン・メェイ",
    path: "調和",
    combatType: "氷",
    baseHp: 1086,
    baseAtk: 659,
    baseDef: 485,
    baseSpd: 104,
    maxEp: 130,
    traces: {
      totalStats: {
        '撃破特効': 37.3,
        '防御力%': 22.5,
        '速度': 5,
      },
      talents: [
        { id: 'ruan_mei_trace_1', name: '呼吸の中', description: '味方全体の撃破特効+20%。', effects: [
          { id: 'ruan_mei_break_effect_party', source: '呼吸の中', target: 'ALLIES', type: 'STAT_MOD', value: { '撃破特効': 20 } }
        ]},
        { id: 'ruan_mei_trace_2', name: '広がる想像', description: 'ルアン・メェイのターンが回ってきた時、自身のEPを5回復する。' },
        { id: 'ruan_mei_trace_3', name: '水面を照らす燭火', description: '戦闘中、ルアン・メェイの撃破特効が120%を超えた時、10%超過するにつき、戦闘スキルによる味方全体の与ダメージアップ効果+6%、最大で+36%。' },
      ]
    },
    eidolons: [
      { id: 'ruan_mei_e1', level: 1, name: '神経刺繍図', description: '必殺技の結界が発動している間、味方全体がダメージを与えた時、敵の防御力を20%無視する。', effects: [
        { id: 'ruan_mei_e1_def_shred', source: '星魂1', target: 'ALLIES', type: 'DEF_SHRED', value: 20, conditions: [{ type: 'IN_STATE', value: '残梅' }] }
      ]},
      { id: 'ruan_mei_e2', level: 2, name: '通りし芒の道', description: 'ルアン・メェイがフィールド上にいる場合、弱点撃破状態の敵に対する味方全体の攻撃力+40%。', effects: [
        { id: 'ruan_mei_e2_atk_buff', source: '星魂2', target: 'ALLIES', type: 'STAT_MOD', value: { '攻撃力%': 40 } } // Condition: Enemy is broken
      ]},
      { id: 'ruan_mei_e3', level: 3, name: '煙衫を綾取る緑意', description: '必殺技のLv.+2、最大Lv.15まで。天賦のLv.+2、最大Lv.15まで。' },
      { id: 'ruan_mei_e4', level: 4, name: '銅鏡前にて神を探す', description: '敵が弱点撃破された時、ルアン・メェイの撃破特効+100%、3ターン継続。', effects: [
        { id: 'ruan_mei_e4_break_effect', source: '星魂4', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 100 }, duration: 3 }
      ]},
      { id: 'ruan_mei_e5', level: 5, name: '気怠く弄る玲瓏釵', description: '戦闘スキルのLv.+2、最大Lv.15まで。通常攻撃のLv.+1、最大Lv.10まで。' },
      { id: 'ruan_mei_e6', level: 6, name: '紗巾脱ぎかけ団扇に落ちる', description: '必殺技を発動して展開する結界の継続時間+1ターン。天賦による弱点撃破ダメージ倍率+200%。' }
    ],
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体にルアン・メェイの攻撃力100%分の氷属性ダメージを与える。',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 100 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '「弦外の音」を獲得する、3ターン継続。味方全体の与ダメージ+32%、弱点撃破効率+50%。',
        targetType: 'single', // Buff action
        isAttack: false,
        epRecovery: 30,
        effects: [
          { id: 'ruan_mei_skill_dmg_boost', source: '弦外の音', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 32 }, duration: 3 },
          { id: 'ruan_mei_skill_break_eff', source: '弦外の音', target: 'ALLIES', type: 'BREAK_EFFICIENCY_BOOST', value: 50, duration: 3 }
        ],
        toughnessDamage: {
          main: 20,
        },
      },
      ultimate: {
        name: '必殺技',
        description: '結界を展開する、2ターン継続。味方全体の全耐性貫通+25%、かつ味方が攻撃を行った後、敵に「残梅」を付与する。',
        targetType: 'aoe', // Field effect
        isAttack: false,
        epRecovery: 5,
        effects: [
          { id: 'ruan_mei_ult_res_pen', source: '残梅', target: 'ALLIES', type: 'RES_PEN', value: 25, duration: 2 },
          { id: 'ruan_mei_ult_field', source: '残梅', target: 'ENEMIES', type: 'STAT_MOD', value: {}, duration: 2 } // Marker for the field
        ],
        toughnessDamage: {
          main: 20,
        },
      },
      follow_up: { // 天賦の弱点撃破ダメージを表現
        name: '天賦',
        description: '敵を弱点撃破した後、その敵にルアン・メェイの氷属性弱点撃破ダメージ120%分の弱点撃破ダメージを与える。',
        targetType: 'single',
        isAttack: true,
        epRecovery: 0,
        // ダメージ計算は特殊ロジック
      },
    },
    technique: {
      name: '秘技',
      description: '次の戦闘開始時に自動で戦闘スキルを1回発動する。この効果発動はSPを消費しない。',
      targetType: 'single',
      isAttack: false,
      effects: [
        { id: 'ruan_mei_tech_auto_skill', source: '琴拭い、霓裳撫でる', target: 'SELF', type: 'STAT_MOD', value: {} }
      ]
    },
    talent: {
      name: '天賦',
      description: '自身を除く味方全体の速度+10%。',
      targetType: 'single', // Added to satisfy Action interface
      effects: [
        { id: 'ruan_mei_talent_spd', source: '天賦', target: 'ALLIES', type: 'STAT_MOD', value: { '速度%': 10 }, duration: Infinity }
      ]
    }
  }
  ,
  {
    id: "dan_heng_teng_huang",
    name: "丹恒・騰荒",
    path: "存護",
    combatType: "物理",
    baseHp: 1047,
    baseAtk: 582,
    baseDef: 776,
    baseSpd: 97,
    maxEp: 135,
    summonedSpiritId: "dragon_spirit_dhth", // Link to Dragon Spirit
    traces: {
      totalStats: {
        '攻撃力%': 28,
        '防御力%': 22.5,
        '速度': 5,
      },
      talents: [
        {
          id: 'dhth-trace-grand-view',
          name: '偉観',
          description: '戦闘スキルを発動する時、「同袍」になったターゲットの攻撃力は丹恒・騰荒の攻撃力15%分アップする。',
          effects: [
            // This effect needs to be applied to the '同袍' target, not SELF.
            // It's a conditional buff based on DHTH's ATK.
            // This will require simulation logic to apply.
            { id: 'dhth-grand-view-atk-buff', source: '偉観', target: 'ALLIES', type: 'STAT_MOD', value: { '攻撃力%': 15 }, conditions: [{ type: 'IN_STATE', value: '同袍' }] }
          ]
        },
        {
          id: 'dhth-trace-hundred-flowers',
          name: '百花',
          description: '戦闘開始時、丹恒・騰荒の行動順が40%早まる。「同袍」が攻撃を行う時、丹恒・騰荒がEPを6回復し、「龍霊」の行動順が15%早まる。',
          effects: [{
            id: 'dhth-hundred-flowers-trigger',
            source: '百花',
            target: 'SELF',
            type: 'SPECIAL_EFFECT', // Marker for simulation logic
            value: { initialAvAdvance: 40, epRecoveryOnComradeAttack: 6, spiritAvAdvanceOnComradeAttack: 15 }
          }]
        },
        {
          id: 'dhth-trace-standing-tall',
          name: '屹立',
          description: '「龍霊」は行動時、バリア耐久値が最も低い味方に丹恒・騰荒の攻撃力5%+100の耐久値を持つバリアを追加で付与する、3ターン継続。',
          effects: [{
            id: 'dhth-standing-tall-shield',
            source: '屹立',
            target: 'LOWEST_SHIELD_ALLY',
            type: 'ADDITIONAL_SHIELD',
            scaling: [{ stat: 'atk', multiplier: 5, flat: 100 }], // Changed from dotScaling
            duration: 3
          }]
        }
      ]
    },
    eidolons: [
      {
        id: 'dhth-e1',
        level: 1,
        name: '旧き鱗を捨てた荒龍',
        description: '丹恒・騰荒が必殺技を発動する時、SPを1回復し、「同袍」の全属性耐性貫通+18%、3ターン継続。',
        effects: [
          { id: 'dhth-e1-res-pen', source: '星魂1', target: 'ALLIES', type: 'RES_PEN', value: 18, duration: 3, conditions: [{ type: 'IN_STATE', value: '同袍' }] }
        ]
      },
      {
        id: 'dhth-e2',
        level: 2,
        name: '開拓を見守る純真',
        description: '必殺技による龍霊強化において、効果が継続する行動可能回数+2回。丹恒・騰荒が必殺技を発動した後、「龍霊」の行動順が100%早まる。強化後の「龍霊」が行動する時、「同袍」による付加ダメージは本来の200%分になり、その回で付与するバリア耐久値は本来の200%分になる。',
        effects: [] // These are complex simulation logic, not simple effects.
      },
      { id: 'dhth-e3', level: 3, name: '山河より託されしもの', description: '必殺技のLv.+2、通常攻撃のLv.+1。', effects: [] },
      {
        id: 'dhth-e4',
        level: 4,
        name: '金石に誓いて身を船に',
        description: '「同袍」の受けるダメージ-20%。',
        effects: [
          { id: 'dhth-e4-dmg-red', source: '星魂4', target: 'ALLIES', type: 'DMG_TAKEN_INCREASE', value: -20, conditions: [{ type: 'IN_STATE', value: '同袍' }] } // Negative value for reduction
        ]
      },
      { id: 'dhth-e5', level: 5, name: '不朽の道は連綿たり', description: '戦闘スキルのLv.+2、天賦のLv.+2。', effects: [] },
      {
        id: 'dhth-e6',
        level: 6,
        name: '草木も塵も夢に入れ',
        description: 'フィールド上に「同袍」がいる場合、敵全体の受けるダメージ+20%。「同袍」がダメージを与える時、敵の防御力を12%分無視する。丹恒・騰荒が必殺技を発動した時、「同袍」は敵全体に自身の攻撃力330%分、かつ対応する属性の付加ダメージを与える。',
        effects: [
          { id: 'dhth-e6-dmg-taken-increase', source: '星魂6', target: 'ENEMIES', type: 'DMG_TAKEN_INCREASE', value: 20, conditions: [{ type: 'IN_STATE', value: '同袍' }] },
          { id: 'dhth-e6-def-ignore', source: '星魂6', target: 'ALLIES', type: 'DEF_SHRED', value: 12, conditions: [{ type: 'IN_STATE', value: '同袍' }] } // DEF_SHRED for allies means they ignore enemy DEF
        ]
      }
    ],
    actions: {
      basic: {
        name: '通常攻撃',
        description: '指定した敵単体に丹恒・騰荒の攻撃力100%分の物理属性ダメージを与える。ep20',
        targetType: 'single',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 100 }],
        },
        toughnessDamage: {
          main: 10,
        },
        isAttack: true,
        epRecovery: 20,
      },
      skill: {
        name: '戦闘スキル',
        description: '指定した味方キャラ単体を「同袍」にし、味方全体に丹恒・騰荒の攻撃力20%+400の耐久値を持つバリアを付与する、3ターン継続。',
        targetType: 'single', // For '同袍' target selection
        healScaling: { // Using healScaling for shield, will need custom logic for cap
          main: [{ stat: 'atk', multiplier: 20, flat: 400 }], // Shield for all allies
        },
        isAttack: false,
        epRecovery: 30,
        effects: [
          { id: 'dhth-comrade-status', source: '戦闘スキル', target: 'ALLIES', type: 'STAT_MOD', value: {}, duration: 999, conditions: [{ type: 'IN_STATE', value: '同袍' }] } // Marker for '同袍'
        ]
      },
      ultimate: {
        name: '必殺技',
        description: '敵全体に丹恒・騰荒の攻撃力300%分の物理属性ダメージを与え、味方全体に丹恒・騰荒の攻撃力20%+400の耐久値を持つバリアを付与する、3ターン継続。',
        targetType: 'aoe',
        damageScaling: {
          main: [{ stat: 'atk', multiplier: 300 }],
        },
        healScaling: { // Using healScaling for shield, will need custom logic for cap
          main: [{ stat: 'atk', multiplier: 20, flat: 400 }], // Shield for all allies
        },
        toughnessDamage: {
          main: 20, // Assuming standard ultimate toughness damage
        },
        isAttack: true,
        epRecovery: 5,
      },
    },
    technique: {
      name: '秘技',
      description: '秘技を使用すると「同袍」を獲得し、一定範囲内の敵を10秒間目眩状態にする。次の戦闘開始時、「同袍」を所持しているキャラに戦闘スキルを自動で1回発動する。',
      targetType: 'single', // For '同袍' target selection
      isAttack: false,
      damageScaling: { main: [] },
      effects: [
        { id: 'dhth-comrade-status-tech', source: '秘技', target: 'ALLIES', type: 'STAT_MOD', value: {}, duration: 999, conditions: [{ type: 'IN_STATE', value: '同袍' }] }, // Marker for '同袍'
        { id: 'dhth-tech-auto-skill', source: '秘技', target: 'SELF', type: 'STAT_MOD', value: {} } // Marker for auto skill
      ]
    }
  },
  {
    id: "dragon_spirit_dhth",
    name: "龍霊",
    path: "存護", // Placeholder
    combatType: "物理", // Derived from summoner
    baseHp: 0, // Derived from summoner
    baseAtk: 0, // Derived from summoner
    baseDef: 0, // Derived from summoner
    baseSpd: 165, // Initial speed
    isUntargetableSpirit: true,
    summonerId: "dan_heng_teng_huang", // Link to summoner
    actions: {
      spirit_skill: { // This is the action Dragon Spirit takes
        name: '龍霊の行動',
        description: '味方それぞれのデバフを1つ解除し、丹恒・騰荒の攻撃力10%+200の耐久値を持つバリアを付与する、3ターン継続。',
        targetType: 'aoe', // For cleanse and shield
        healScaling: { // Using healScaling for shield, will need custom logic for cap
          main: [{ stat: 'atk', multiplier: 10, flat: 200 }], // Shield for all allies, scales with DHTH's ATK
        },
        isAttack: false,
        isSpiritSkill: true,
        epRecovery: 0,
        effects: [
          // Debuff cleanse is simulation logic
          // Additional shield from '屹立' is also simulation logic
          // Enhanced attack from '必殺技' is also simulation logic
        ]
      },
      enhanced_spirit_skill: {
        name: '強化龍霊の行動',
        description: '敵全体に丹恒・騰荒の攻撃力80%分の物理属性ダメージと、「同袍」の攻撃力80%分、かつ対応する属性の付加ダメージを与える。',
        targetType: 'aoe',
        damageScaling: {
          main: [
            { stat: 'atk', multiplier: 80 }, // Scales with DHTH's ATK
            { stat: 'comradeAtk', multiplier: 80 } // Scales with '同袍' target's ATK
          ]
        },
        toughnessDamage: {
          main: 10, // Assuming standard toughness damage for follow-up like attack
        },
        isAttack: true,
        isSpiritSkill: true,
        epRecovery: 0,
      }
    }
  }
];
