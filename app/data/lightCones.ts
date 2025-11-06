import type { Effect } from './relics';

export interface LightConeEffect {
  description: string;
  stats?: { [key: string]: number };
  effects?: Effect[];
}

export interface LightCone {
  id: string;
  name: string;
  path: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  effects: LightConeEffect[]; // Index 0 is S1, index 4 is S5
}

export const lightCones: LightCone[] = [
  {
    id: 'a_secret_vow',
    name: '秘密の誓い',
    path: '壊滅',
    baseHp: 1058,
    baseAtk: 476,
    baseDef: 264,
    effects: [
      // S1
      {
        description: '装備キャラの与ダメージ+20%。残りHP割合が装備キャラ以上の敵に対して、さらに与ダメージ+20%。',
        effects: [
          { id: 'a_secret_vow_s1', source: '秘密の誓い', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 20 } }
        ]
      },
      // S2
      {
        description: '装備キャラの与ダメージ+25%。残りHP割合が装備キャラ以上の敵に対して、さらに与ダメージ+25%。',
        effects: [
          { id: 'a_secret_vow_s2', source: '秘密の誓い', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 25 } }
        ]
      },
      // S3
      {
        description: '装備キャラの与ダメージ+30%。残りHP割合が装備キャラ以上の敵に対して、さらに与ダメージ+30%。',
        effects: [
          { id: 'a_secret_vow_s3', source: '秘密の誓い', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 30 } }
        ]
      },
      // S4
      {
        description: '装備キャラの与ダメージ+35%。残りHP割合が装備キャラ以上の敵に対して、さらに与ダメージ+35%。',
        effects: [
          { id: 'a_secret_vow_s4', source: '秘密の誓い', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 35 } }
        ]
      },
      // S5
      {
        description: '装備キャラの与ダメージ+40%。残りHP割合が装備キャラ以上の敵に対して、さらに与ダメージ+40%。',
        effects: [
          { id: 'a_secret_vow_s5', source: '秘密の誓い', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 40 } }
        ]
      },
    ]
  },
  {
    id: 'on_the_fall_of_an_aeon',
    name: 'とある星神の殞落を記す',
    path: '壊滅',
    baseHp: 1058, baseAtk: 529, baseDef: 396,
    effects: [
      { description: '攻撃力+8% (最大4層), 弱点撃破後与ダメ+12% (2T)', effects: [{ id: 'aeon_s1_atk', source: '火に飛び込む', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 8 }, maxStacks: 4 }, { id: 'aeon_s1_dmg', source: '火に飛び込む', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 12 }, duration: 2 }] },
      { description: '攻撃力+10% (最大4層), 弱点撃破後与ダメ+15% (2T)', effects: [{ id: 'aeon_s2_atk', source: '火に飛び込む', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 10 }, maxStacks: 4 }, { id: 'aeon_s2_dmg', source: '火に飛び込む', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 15 }, duration: 2 }] },
      { description: '攻撃力+12% (最大4層), 弱点撃破後与ダメ+18% (2T)', effects: [{ id: 'aeon_s3_atk', source: '火に飛び込む', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, maxStacks: 4 }, { id: 'aeon_s3_dmg', source: '火に飛び込む', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 18 }, duration: 2 }] },
      { description: '攻撃力+14% (最大4層), 弱点撃破後与ダメ+21% (2T)', effects: [{ id: 'aeon_s4_atk', source: '火に飛び込む', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 14 }, maxStacks: 4 }, { id: 'aeon_s4_dmg', source: '火に飛び込む', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 21 }, duration: 2 }] },
      { description: '攻撃力+16% (最大4層), 弱点撃破後与ダメ+24% (2T)', effects: [{ id: 'aeon_s5_atk', source: '火に飛び込む', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 16 }, maxStacks: 4 }, { id: 'aeon_s5_dmg', source: '火に飛び込む', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 24 }, duration: 2 }] },
    ]
  },
  {
    id: 'ninjitsu_note_melody_hunt',
    name: '忍事録・音律狩猟',
    path: '壊滅',
    baseHp: 1058, baseAtk: 476, baseDef: 264,
    effects: [
      { description: '最大HP+12%, 会心ダメージ+18% (2T)', effects: [{ id: 'ninjitsu_s1_hp', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 12 }, duration: Infinity }, { id: 'ninjitsu_s1_crit_dmg', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 18 }, duration: 2 }] },
      { description: '最大HP+15%, 会心ダメージ+22% (2T)', effects: [{ id: 'ninjitsu_s2_hp', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 15 }, duration: Infinity }, { id: 'ninjitsu_s2_crit_dmg', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 22 }, duration: 2 }] },
      { description: '最大HP+18%, 会心ダメージ+27% (2T)', effects: [{ id: 'ninjitsu_s3_hp', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 18 }, duration: Infinity }, { id: 'ninjitsu_s3_crit_dmg', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 27 }, duration: 2 }] },
      { description: '最大HP+21%, 会心ダメージ+31% (2T)', effects: [{ id: 'ninjitsu_s4_hp', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 21 }, duration: Infinity }, { id: 'ninjitsu_s4_crit_dmg', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 31 }, duration: 2 }] },
      { description: '最大HP+24%, 会心ダメージ+36% (2T)', effects: [{ id: 'ninjitsu_s5_hp', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { 'HP%': 24 }, duration: Infinity }, { id: 'ninjitsu_s5_crit_dmg', source: '開演', target: 'SELF', type: 'STAT_MOD', value: { '会心ダメージ': 36 }, duration: 2 }] },
    ]
  },
  {
    id: 'cruising_in_the_stellar_sea',
    name: '星海巡航',
    path: '巡狩',
    baseHp: 952, baseAtk: 529, baseDef: 463,
    effects: [
      { description: '会心率+8%', effects: [{ id: 'stellar_sea_s1_crit_rate', source: '猟逐', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: Infinity }] },
      { description: '会心率+10%', effects: [{ id: 'stellar_sea_s2_crit_rate', source: '猟逐', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 10 }, duration: Infinity }] },
      { description: '会心率+12%', effects: [{ id: 'stellar_sea_s3_crit_rate', source: '猟逐', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 12 }, duration: Infinity }] },
      { description: '会心率+14%', effects: [{ id: 'stellar_sea_s4_crit_rate', source: '猟逐', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 14 }, duration: Infinity }] },
      { description: '会心率+16%', effects: [{ id: 'stellar_sea_s5_crit_rate', source: '猟逐', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 16 }, duration: Infinity }] },
    ]
  },
  {
    id: 'today_is_another_peaceful_day',
    name: '今日も平和な一日',
    path: '知恵',
    baseHp: 846, baseAtk: 529, baseDef: 330,
    effects: [
      { description: '最大EPに応じて与ダメUP(0.2%/EP)', effects: [{ id: 'peaceful_day_s1', source: '今日も平和な一日', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 0.2 } }] },
      { description: '最大EPに応じて与ダメUP(0.25%/EP)', effects: [{ id: 'peaceful_day_s2', source: '今日も平和な一日', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 0.25 } }] },
      { description: '最大EPに応じて与ダメUP(0.3%/EP)', effects: [{ id: 'peaceful_day_s3', source: '今日も平和な一日', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 0.3 } }] },
      { description: '最大EPに応じて与ダメUP(0.35%/EP)', effects: [{ id: 'peaceful_day_s4', source: '今日も平和な一日', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 0.35 } }] },
      { description: '最大EPに応じて与ダメUP(0.4%/EP)', effects: [{ id: 'peaceful_day_s5', source: '今日も平和な一日', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 0.4 } }] },
    ]
  },
  {
    id: 'endless_computation',
    name: '絶え間ない演算',
    path: '知恵',
    baseHp: 1058, baseAtk: 529, baseDef: 396,
    effects: [
      { description: '攻撃力+8%, 命中毎に攻撃力+4%(最大5層), 3体以上命中時速度+8%(1T)', effects: [{ id: 'computation_s1_atk', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 8 }, duration: Infinity }, { id: 'computation_s1_atk_stack', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 4 }, maxStacks: 5 }, { id: 'computation_s1_spd', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '速度': 8 }, duration: 1 }] },
      { description: '攻撃力+9%, 命中毎に攻撃力+5%(最大5層), 3体以上命中時速度+10%(1T)', effects: [{ id: 'computation_s2_atk', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 9 }, duration: Infinity }, { id: 'computation_s2_atk_stack', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 5 }, maxStacks: 5 }, { id: 'computation_s2_spd', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '速度': 10 }, duration: 1 }] },
      { description: '攻撃力+10%, 命中毎に攻撃力+6%(最大5層), 3体以上命中時速度+12%(1T)', effects: [{ id: 'computation_s3_atk', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 10 }, duration: Infinity }, { id: 'computation_s3_atk_stack', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 6 }, maxStacks: 5 }, { id: 'computation_s3_spd', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '速度': 12 }, duration: 1 }] },
      { description: '攻撃力+11%, 命中毎に攻撃力+7%(最大5層), 3体以上命中時速度+14%(1T)', effects: [{ id: 'computation_s4_atk', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 11 }, duration: Infinity }, { id: 'computation_s4_atk_stack', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 7 }, maxStacks: 5 }, { id: 'computation_s4_spd', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '速度': 14 }, duration: 1 }] },
      { description: '攻撃力+12%, 命中毎に攻撃力+8%(最大5層), 3体以上命中時速度+16%(1T)', effects: [{ id: 'computation_s5_atk', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 12 }, duration: Infinity }, { id: 'computation_s5_atk_stack', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 8 }, maxStacks: 5 }, { id: 'computation_s5_spd', source: '境界なき思考', target: 'SELF', type: 'STAT_MOD', value: { '速度': 16 }, duration: 1 }] },
    ]
  },
  {
    id: 'memories_of_the_past',
    name: '記憶の中の姿',
    path: '調和',
    baseHp: 952, baseAtk: 423, baseDef: 396,
    effects: [
      { description: '撃破特効+28%, EP+4', effects: [{ id: 'memories_s1_break', source: '古い写真', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 28 }, duration: Infinity }, { id: 'ep_recovery_on_attack', source: '古い写真', target: 'SELF', type: 'SPECIAL_EFFECT', value: 4 }] },
      { description: '撃破特効+35%, EP+5', effects: [{ id: 'memories_s2_break', source: '古い写真', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 35 }, duration: Infinity }, { id: 'ep_recovery_on_attack', source: '古い写真', target: 'SELF', type: 'SPECIAL_EFFECT', value: 5 }] },
      { description: '撃破特効+42%, EP+6', effects: [{ id: 'memories_s3_break', source: '古い写真', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 42 }, duration: Infinity }, { id: 'ep_recovery_on_attack', source: '古い写真', target: 'SELF', type: 'SPECIAL_EFFECT', value: 6 }] },
      { description: '撃破特効+49%, EP+7', effects: [{ id: 'memories_s4_break', source: '古い写真', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 49 }, duration: Infinity }, { id: 'ep_recovery_on_attack', source: '古い写真', target: 'SELF', type: 'SPECIAL_EFFECT', value: 7 }] },
      { description: '撃破特効+56%, EP+8', effects: [{ id: 'memories_s5_break', source: '古い写真', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 56 }, duration: Infinity }, { id: 'ep_recovery_on_attack', source: '古い写真', target: 'SELF', type: 'SPECIAL_EFFECT', value: 8 }] },
    ]
  },
  {
    id: 'dance_dance_dance',
    name: 'ダンス！ダンス！ダンス！',
    path: '調和',
    baseHp: 952, baseAtk: 423, baseDef: 396,
    effects: [
      { description: '行動順16%UP', effects: [{ id: 'action_forward_on_ultimate', source: '止まらないよぉ！', target: 'ALLIES', type: 'SPECIAL_EFFECT', value: 16 }] },
      { description: '行動順18%UP', effects: [{ id: 'action_forward_on_ultimate', source: '止まらないよぉ！', target: 'ALLIES', type: 'SPECIAL_EFFECT', value: 18 }] },
      { description: '行動順20%UP', effects: [{ id: 'action_forward_on_ultimate', source: '止まらないよぉ！', target: 'ALLIES', type: 'SPECIAL_EFFECT', value: 20 }] },
      { description: '行動順22%UP', effects: [{ id: 'action_forward_on_ultimate', source: '止まらないよぉ！', target: 'ALLIES', type: 'SPECIAL_EFFECT', value: 22 }] },
      { description: '行動順24%UP', effects: [{ id: 'action_forward_on_ultimate', source: '止まらないよぉ！', target: 'ALLIES', type: 'SPECIAL_EFFECT', value: 24 }] },
    ]
  },
  {
    id: 'planetary_rendezvous',
    name: '惑星との出会い',
    path: '調和',
    baseHp: 1058, baseAtk: 423, baseDef: 330,
    effects: [
      { description: '同属性与ダメ+12%', effects: [{ id: 'planetary_s1_dmg', source: '旅立ち', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 12 }, duration: Infinity }] },
      { description: '同属性与ダメ+15%', effects: [{ id: 'planetary_s2_dmg', source: '旅立ち', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 15 }, duration: Infinity }] },
      { description: '同属性与ダメ+18%', effects: [{ id: 'planetary_s3_dmg', source: '旅立ち', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 18 }, duration: Infinity }] },
      { description: '同属性与ダメ+21%', effects: [{ id: 'planetary_s4_dmg', source: '旅立ち', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 21 }, duration: Infinity }] },
      { description: '同属性与ダメ+24%', effects: [{ id: 'planetary_s5_dmg', source: '旅立ち', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 24 }, duration: Infinity }] },
    ]
  },
  {
    id: 'meshing_cogs',
    name: '輪契',
    path: '調和',
    baseHp: 846, baseAtk: 317, baseDef: 264,
    effects: [
      { description: 'EP+4', effects: [{ id: 'ep_recovery_on_action', source: '速決', target: 'SELF', type: 'SPECIAL_EFFECT', value: 4 }] },
      { description: 'EP+5', effects: [{ id: 'ep_recovery_on_action', source: '速決', target: 'SELF', type: 'SPECIAL_EFFECT', value: 5 }] },
      { description: 'EP+6', effects: [{ id: 'ep_recovery_on_action', source: '速決', target: 'SELF', type: 'SPECIAL_EFFECT', value: 6 }] },
      { description: 'EP+7', effects: [{ id: 'ep_recovery_on_action', source: '速決', target: 'SELF', type: 'SPECIAL_EFFECT', value: 7 }] },
      { description: 'EP+8', effects: [{ id: 'ep_recovery_on_action', source: '速決', target: 'SELF', type: 'SPECIAL_EFFECT', value: 8 }] },
    ]
  },
  {
    id: 'solitary_healing',
    name: '孤独の癒し',
    path: '虚無',
    baseHp: 1058, baseAtk: 529, baseDef: 396,
    effects: [
      { description: '撃破特効+20%, 持続与ダメ+24%(2T), EP+4', effects: [{ id: 'solitary_s1_break', source: '混沌の霊薬', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 20 }, duration: Infinity }, { id: 'solitary_s1_dot_dmg', source: '混沌の霊薬', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 24 }, duration: 2 }] },
      { description: '撃破特効+25%, 持続与ダメ+30%(2T), EP+4.5', effects: [{ id: 'solitary_s2_break', source: '混沌の霊薬', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 25 }, duration: Infinity }, { id: 'solitary_s2_dot_dmg', source: '混沌の霊薬', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 30 }, duration: 2 }] },
      { description: '撃破特効+30%, 持続与ダメ+36%(2T), EP+5', effects: [{ id: 'solitary_s3_break', source: '混沌の霊薬', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 30 }, duration: Infinity }, { id: 'solitary_s3_dot_dmg', source: '混沌の霊薬', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 36 }, duration: 2 }] },
      { description: '撃破特効+35%, 持続与ダメ+42%(2T), EP+5.5', effects: [{ id: 'solitary_s4_break', source: '混沌の霊薬', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 35 }, duration: Infinity }, { id: 'solitary_s4_dot_dmg', source: '混沌の霊薬', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 42 }, duration: 2 }] },
      { description: '撃破特効+40%, 持続与ダメ+48%(2T), EP+6', effects: [{ id: 'solitary_s5_break', source: '混沌の霊薬', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 40 }, duration: Infinity }, { id: 'solitary_s5_dot_dmg', source: '混沌の霊薬', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 48 }, duration: 2 }] },
    ]
  },
  {
    id: 'eyes_of_the_prey',
    name: '獲物の視線',
    path: '虚無',
    baseHp: 952, baseAtk: 476, baseDef: 330,
    effects: [
      { description: '効果命中+20%, 持続与ダメ+24%', effects: [{ id: 'prey_s1_ehr', source: '自信', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 20 }, duration: Infinity }, { id: 'prey_s1_dot_dmg', source: '自信', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 24 }, duration: Infinity }] },
      { description: '効果命中+25%, 持続与ダメ+30%', effects: [{ id: 'prey_s2_ehr', source: '自信', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 25 }, duration: Infinity }, { id: 'prey_s2_dot_dmg', source: '自信', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 30 }, duration: Infinity }] },
      { description: '効果命中+30%, 持続与ダメ+36%', effects: [{ id: 'prey_s3_ehr', source: '自信', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 30 }, duration: Infinity }, { id: 'prey_s3_dot_dmg', source: '自信', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 36 }, duration: Infinity }] },
      { description: '効果命中+35%, 持続与ダメ+42%', effects: [{ id: 'prey_s4_ehr', source: '自信', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 35 }, duration: Infinity }, { id: 'prey_s4_dot_dmg', source: '自信', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 42 }, duration: Infinity }] },
      { description: '効果命中+40%, 持続与ダメ+48%', effects: [{ id: 'prey_s5_ehr', source: '自信', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 40 }, duration: Infinity }, { id: 'prey_s5_dot_dmg', source: '自信', target: 'SELF', type: 'DMG_BOOST', value: { 'DOT': 48 }, duration: Infinity }] },
    ]
  },
  {
    id: 'before_the_first_quest',
    name: '初めてのクエストの前に',
    path: '虚無',
    baseHp: 952, baseAtk: 476, baseDef: 330,
    effects: [
      { description: '効果命中+20%, EP+4', effects: [{ id: 'quest_s1_ehr', source: 'ナイスキャッチ', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 20 }, duration: Infinity }] },
      { description: '効果命中+25%, EP+5', effects: [{ id: 'quest_s2_ehr', source: 'ナイスキャッチ', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 25 }, duration: Infinity }] },
      { description: '効果命中+30%, EP+6', effects: [{ id: 'quest_s3_ehr', source: 'ナイスキャッチ', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 30 }, duration: Infinity }] },
      { description: '効果命中+35%, EP+7', effects: [{ id: 'quest_s4_ehr', source: 'ナイスキャッチ', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 35 }, duration: Infinity }] },
      { description: '効果命中+40%, EP+8', effects: [{ id: 'quest_s5_ehr', source: 'ナイスキャッチ', target: 'SELF', type: 'STAT_MOD', value: { '効果命中': 40 }, duration: Infinity }] },
    ]
  },
  {
    id: 'we_are_the_wildfire',
    name: '我ら地炎',
    path: '存護',
    baseHp: 740, baseAtk: 476, baseDef: 463,
    effects: [
      { description: '被ダメ-8%(5T), HP回復(失ったHP30%)', effects: [{ id: 'wildfire_s1_dmg_red', source: '袖時雨', target: 'ALLIES', type: 'DMG_TAKEN_INCREASE', value: -8, duration: 5 }] },
      { description: '被ダメ-10%(5T), HP回復(失ったHP35%)', effects: [{ id: 'wildfire_s2_dmg_red', source: '袖時雨', target: 'ALLIES', type: 'DMG_TAKEN_INCREASE', value: -10, duration: 5 }] },
      { description: '被ダメ-12%(5T), HP回復(失ったHP40%)', effects: [{ id: 'wildfire_s3_dmg_red', source: '袖時雨', target: 'ALLIES', type: 'DMG_TAKEN_INCREASE', value: -12, duration: 5 }] },
      { description: '被ダメ-14%(5T), HP回復(失ったHP45%)', effects: [{ id: 'wildfire_s4_dmg_red', source: '袖時雨', target: 'ALLIES', type: 'DMG_TAKEN_INCREASE', value: -14, duration: 5 }] },
      { description: '被ダメ-16%(5T), HP回復(失ったHP50%)', effects: [{ id: 'wildfire_s5_dmg_red', source: '袖時雨', target: 'ALLIES', type: 'DMG_TAKEN_INCREASE', value: -16, duration: 5 }] },
    ]
  },
  {
    id: 'post_op_conversation',
    name: '手術後の会話',
    path: '豊穣',
    baseHp: 1058, baseAtk: 423, baseDef: 330,
    effects: [
      { description: 'EP回復効率+8%, 必殺技治癒量+12%', effects: [{ id: 'post_op_s1_ep_regen', source: '相互回復', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 8 }, duration: Infinity }, { id: 'post_op_s1_heal_boost', source: '相互回復', target: 'SELF', type: 'HEAL_BOOST', value: 12 }] },
      { description: 'EP回復効率+10%, 必殺技治癒量+15%', effects: [{ id: 'post_op_s2_ep_regen', source: '相互回復', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 10 }, duration: Infinity }, { id: 'post_op_s2_heal_boost', source: '相互回復', target: 'SELF', type: 'HEAL_BOOST', value: 15 }] },
      { description: 'EP回復効率+12%, 必殺技治癒量+18%', effects: [{ id: 'post_op_s3_ep_regen', source: '相互回復', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 12 }, duration: Infinity }, { id: 'post_op_s3_heal_boost', source: '相互回復', target: 'SELF', type: 'HEAL_BOOST', value: 18 }] },
      { description: 'EP回復効率+14%, 必殺技治癒量+21%', effects: [{ id: 'post_op_s4_ep_regen', source: '相互回復', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 14 }, duration: Infinity }, { id: 'post_op_s4_heal_boost', source: '相互回復', target: 'SELF', type: 'HEAL_BOOST', value: 21 }] },
      { description: 'EP回復効率+16%, 必殺技治癒量+24%', effects: [{ id: 'post_op_s5_ep_regen', source: '相互回復', target: 'SELF', type: 'STAT_MOD', value: { 'EP回復効率': 16 }, duration: Infinity }, { id: 'post_op_s5_heal_boost', source: '相互回復', target: 'SELF', type: 'HEAL_BOOST', value: 24 }] },
    ]
  },
  {
    id: 'perfect_timing',
    name: '今が丁度',
    path: '豊穣',
    baseHp: 952, baseAtk: 423, baseDef: 396,
    effects: [
      { description: '効果抵抗+16%, 治癒量UP(効果抵抗の33%, 上限15%)', effects: [{ id: 'timing_s1_eff_res', source: '屈折する視線', target: 'SELF', type: 'STAT_MOD', value: { '効果抵抗': 16 }, duration: Infinity }, { id: 'timing_s1_heal_boost', source: '屈折する視線', target: 'SELF', type: 'HEAL_BOOST', value: 0 }] }, // Value is dynamic
      { description: '効果抵抗+20%, 治癒量UP(効果抵抗の36%, 上限18%)', effects: [{ id: 'timing_s2_eff_res', source: '屈折する視線', target: 'SELF', type: 'STAT_MOD', value: { '効果抵抗': 20 }, duration: Infinity }, { id: 'timing_s2_heal_boost', source: '屈折する視線', target: 'SELF', type: 'HEAL_BOOST', value: 0 }] },
      { description: '効果抵抗+24%, 治癒量UP(効果抵抗の39%, 上限21%)', effects: [{ id: 'timing_s3_eff_res', source: '屈折する視線', target: 'SELF', type: 'STAT_MOD', value: { '効果抵抗': 24 }, duration: Infinity }, { id: 'timing_s3_heal_boost', source: '屈折する視線', target: 'SELF', type: 'HEAL_BOOST', value: 0 }] },
      { description: '効果抵抗+28%, 治癒量UP(効果抵抗の42%, 上限24%)', effects: [{ id: 'timing_s4_eff_res', source: '屈折する視線', target: 'SELF', type: 'STAT_MOD', value: { '効果抵抗': 28 }, duration: Infinity }, { id: 'timing_s4_heal_boost', source: '屈折する視線', target: 'SELF', type: 'HEAL_BOOST', value: 0 }] },
      { description: '効果抵抗+32%, 治癒量UP(効果抵抗の45%, 上限27%)', effects: [{ id: 'timing_s5_eff_res', source: '屈折する視線', target: 'SELF', type: 'STAT_MOD', value: { '効果抵抗': 32 }, duration: Infinity }, { id: 'timing_s5_heal_boost', source: '屈折する視線', target: 'SELF', type: 'HEAL_BOOST', value: 0 }] },
    ]
  },
  {
    id: 'what_is_real',
    name: '何が真か',
    path: '豊穣',
    baseHp: 1058, baseAtk: 423, baseDef: 330,
    effects: [
      { description: '撃破特効+24%, 通常攻撃後HP回復(最大HP2%+800)', effects: [{ id: 'what_is_real_s1_break', source: '仮説', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 24 }, duration: Infinity }] },
      { description: '撃破特効+30%, 通常攻撃後HP回復(最大HP2.5%+800)', effects: [{ id: 'what_is_real_s2_break', source: '仮説', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 30 }, duration: Infinity }] },
      { description: '撃破特効+36%, 通常攻撃後HP回復(最大HP3.0%+800)', effects: [{ id: 'what_is_real_s3_break', source: '仮説', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 36 }, duration: Infinity }] },
      { description: '撃破特効+42%, 通常攻撃後HP回復(最大HP3.5%+800)', effects: [{ id: 'what_is_real_s4_break', source: '仮説', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 42 }, duration: Infinity }] },
      { description: '撃破特効+48%, 通常攻撃後HP回復(最大HP4.0%+800)', effects: [{ id: 'what_is_real_s5_break', source: '仮説', target: 'SELF', type: 'STAT_MOD', value: { '撃破特効': 48 }, duration: Infinity }] },
    ]
  },
  {
    id: 'endless_memories',
    name: '尽きぬ追憶',
    path: '記憶',
    baseHp: 1058, baseAtk: 529, baseDef: 396,
    effects: [
      { description: '速度+6%, スキル後与ダメ+8%(3T)', effects: [{ id: 'endless_s1_spd', source: '徴収', target: 'SELF', type: 'STAT_MOD', value: { '速度%': 6 }, duration: Infinity }, { id: 'endless_s1_dmg', source: '徴収', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 8 }, duration: 3 }] },
      { description: '速度+7.5%, スキル後与ダメ+10%(3T)', effects: [{ id: 'endless_s2_spd', source: '徴収', target: 'SELF', type: 'STAT_MOD', value: { '速度%': 7.5 }, duration: Infinity }, { id: 'endless_s2_dmg', source: '徴収', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 10 }, duration: 3 }] },
      { description: '速度+9%, スキル後与ダメ+12%(3T)', effects: [{ id: 'endless_s3_spd', source: '徴収', target: 'SELF', type: 'STAT_MOD', value: { '速度%': 9 }, duration: Infinity }, { id: 'endless_s3_dmg', source: '徴収', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 12 }, duration: 3 }] },
      { description: '速度+10.5%, スキル後与ダメ+14%(3T)', effects: [{ id: 'endless_s4_spd', source: '徴収', target: 'SELF', type: 'STAT_MOD', value: { '速度%': 10.5 }, duration: Infinity }, { id: 'endless_s4_dmg', source: '徴収', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 14 }, duration: 3 }] },
      { description: '速度+12%, スキル後与ダメ+16%(3T)', effects: [{ id: 'endless_s5_spd', source: '徴収', target: 'SELF', type: 'STAT_MOD', value: { '速度%': 12 }, duration: Infinity }, { id: 'endless_s5_dmg', source: '徴収', target: 'ALLIES', type: 'DMG_BOOST', value: { 'ALL': 16 }, duration: 3 }] },
    ]
  }
];
