"use client";

import React, { useState, useMemo } from "react";
import { characters, type Action, type ActionTypeKey, type ScalingComponent } from "./data/characters";
import { lightCones, type LightCone } from "./data/lightCones";
import * as relics from "./data/relics";

export default function Home() {
  const initialRelicStates = () => {
    const initialRelics = {} as relics.RelicsState;
    relics.RELIC_PARTS.forEach(part => {
      const mainStatType = relics.MAIN_STATS[part].length === 1 ? relics.MAIN_STATS[part][0] : '';
      initialRelics[part] = { mainStat: { type: mainStatType, value: 0 } };
    });
    return initialRelics;
  };

  const [partySlots, setPartySlots] = useState(Array(4).fill(null).map(() => ({
    characterId: "",
    lightConeId: "",
    lightConeRank: 1,
    eidolonLevel: 0,
    relics: initialRelicStates(),
    subStats: [] as relics.Stat[],
    relicSets: [{ id: "", count: 0 }, { id: "", count: 0 }],
    planarOrnamentId: "",
    combatState: {} as Record<string, boolean>,
    rotation: "S,E,B",
    summonedSpiritActorIndex: -1,
    ultimateStrategy: 'onReady',
    ultimateTurnInterval: 3,
    ultimateTargetIndex: -1, // Default to no target
    comradeTargetIndex: -1, // For Dan Heng Teng Huang
    useTechnique: false,
  })));
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Derived states for the active character
  const activeSlot = partySlots[activeSlotIndex];
  const selectedCharacter = activeSlot.characterId;
  const selectedLightCone = activeSlot.lightConeId;
  const lightConeRank = activeSlot.lightConeRank;
  const eidolonLevel = activeSlot.eidolonLevel;
  const relicStates = activeSlot.relics;
  const subStats = activeSlot.subStats;
  const selectedRelicSets = activeSlot.relicSets;
  const selectedPlanarOrnament = activeSlot.planarOrnamentId;
  const combatState = activeSlot.combatState;
  const rotationString = activeSlot.rotation;
  const ultimateStrategy = activeSlot.ultimateStrategy;
  const ultimateTurnInterval = activeSlot.ultimateTurnInterval;
  const comradeTargetIndex = activeSlot.comradeTargetIndex;

  // --- Damage Simulation States ---
  const [enemyLevel, setEnemyLevel] = useState(90);
  const [actionType, setActionType] = useState('skill');
  const [enemyCount, setEnemyCount] = useState(3);
  const [enemyMaxToughness, setEnemyMaxToughness] = useState(120);
  const [enemySpeed, setEnemySpeed] = useState(120);
  const [enemyMaxHp, setEnemyMaxHp] = useState(500000);
  const [enemyType, setEnemyType] = useState<'normal' | 'elite'>('elite');
  const [lostHp, setLostHp] = useState(0);

  // --- Full Simulation States ---
  const [simulationRounds, setSimulationRounds] = useState(5);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [archerSpThreshold, setArcherSpThreshold] = useState(2);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonString, setImportJsonString] = useState("");
  const [exportButtonText, setExportButtonText] = useState("設定をエクスポート");
  const [isCharImportModalOpen, setIsCharImportModalOpen] = useState(false);
  const [importCharJsonString, setImportCharJsonString] = useState("");
  const [charExportButtonText, setCharExportButtonText] = useState("キャラクター設定をエクスポート");
  const [enemyAttackDamage, setEnemyAttackDamage] = useState(100);
  const [enemyAttacksPerRound, setEnemyAttacksPerRound] = useState(3);


  // 戦闘条件（バフ、デバフなど）に関する状態をここに追加
  const selectedCharacterData = characters.find((c) => c.id === selectedCharacter);
  const selectedLightConeData = useMemo(() =>
    lightCones.find((lc) => lc.id === selectedLightCone)
    , [selectedLightCone]);

  const updatePartySlot = (index: number, newValues: Partial<typeof partySlots[0]>) => {
    setPartySlots(prev => {
      const newParty = [...prev];
      newParty[index] = { ...newParty[index], ...newValues };
      return newParty;
    });
  };

  const handleCharacterChange = (index: number, characterId: string) => {
    const newChar = characters.find(c => c.id === characterId);
    const initialCombatState: Record<string, boolean> = {};
    if (newChar) {
      newChar.traces?.talents.forEach(t => {
        t.effects?.forEach(eff => {
          if (eff.isToggleable && eff.defaultOn) {
            initialCombatState[eff.id] = true;
          }
        });
      });
    }

    const newRelics = initialRelicStates();
    newRelics.head.mainStat.value = relics.MAIN_STAT_MAX_VALUES['HP'];
    newRelics.hands.mainStat.value = relics.MAIN_STAT_MAX_VALUES['攻撃力'];

    updatePartySlot(index, {
      characterId,
      lightConeId: "", // 光円錐をリセット
      relics: newRelics,
      combatState: initialCombatState,
      summonedSpiritActorIndex: -1, // Reset spirit link
      rotation: newChar?.id === 'blade' ? 'S,E,E' : 'S,B,B',
    });
    setActiveSlotIndex(index);
  };

  const availableLightCones = useMemo(() => {
    if (!selectedCharacterData) return [];
    return lightCones.filter((lc: LightCone) => lc.path === selectedCharacterData.path);
  }, [selectedCharacterData]);

  const handleRelicMainStatChange = (part: relics.RelicPart, field: 'type' | 'value', value: string | number) => {
    const newMainStat = { ...relicStates[part].mainStat };

    if (field === 'type') {
      const newType = value as string;
      newMainStat.type = newType;
      // 新しいタイプに対応する最大値を自動で設定
      const maxValue = relics.MAIN_STAT_MAX_VALUES[newType];
      if (maxValue !== undefined) {
        newMainStat.value = maxValue;
      }
    } else {
      newMainStat.value = Number(value);
    }

    const newRelics = { ...relicStates, [part]: { ...relicStates[part], mainStat: newMainStat } };
    updatePartySlot(activeSlotIndex, { relics: newRelics });
  };

  const handleSubStatChange = (index: number, field: 'type' | 'value', value: string | number) => {
    const newSubStats = [...subStats];
    newSubStats[index] = { ...newSubStats[index], [field]: value };
    updatePartySlot(activeSlotIndex, { subStats: newSubStats });
  };

  const addSubStat = () => {
    const newSubStats = [...subStats, { type: '', value: 0 }];
    updatePartySlot(activeSlotIndex, { subStats: newSubStats });
  };

  const removeSubStat = (index: number) => {
    const newSubStats = subStats.filter((_, i) => i !== index);
    updatePartySlot(activeSlotIndex, { subStats: newSubStats });
  };

  const handleRelicSetChange = (index: number, field: 'id' | 'count', value: string | number) => {
    const newSets = [...selectedRelicSets];
    const currentSet = { ...newSets[index], [field]: value };
    newSets[index] = currentSet;

    // 4セット効果が選択されたら、もう片方のセットを無効化
    if (index === 0 && field === 'count' && Number(value) === 4) {
      newSets[1] = { id: "", count: 0 };
    }
    updatePartySlot(activeSlotIndex, { relicSets: newSets });
  };

  const handleCombatStateChange = (effectId: string, isChecked: boolean) => {
    const newCombatState = { ...combatState, [effectId]: isChecked };
    updatePartySlot(activeSlotIndex, { combatState: newCombatState });
  };

  const togglableEffects = useMemo(() => {
    if (!selectedCharacterData) return [];
    const effects: relics.Effect[] = [];
    selectedCharacterData.traces?.talents.forEach(t => {
      t.effects?.forEach(e => {
        if (e.isToggleable) {
          effects.push(e);
        }
      });
    });
    // 将来的に星魂や光円錐の効果をここに追加
    return effects;
  }, [selectedCharacterData]);

  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(partySlots, null, 2);
      navigator.clipboard.writeText(jsonString);
      setExportButtonText("コピーしました！");
      setTimeout(() => {
        setExportButtonText("設定をエクスポート");
      }, 2000);
    } catch (error) {
      console.error("エクスポートに失敗しました:", error);
      alert("エクスポートに失敗しました。");
    }
  };

  const handleImport = () => {
    if (!importJsonString) {
      alert("JSONデータを入力してください。");
      return;
    }
    try {
      const importedPartySlots = JSON.parse(importJsonString);
      setPartySlots(importedPartySlots);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("インポートに失敗しました:", error);
      alert("JSONの形式が正しくありません。");
    }
  };

  const handleCharExport = () => {
    if (!activeSlot || !activeSlot.characterId) {
      alert("エクスポートするキャラクターが選択されていません。");
      return;
    }
    try {
      const jsonString = JSON.stringify(activeSlot, null, 2);
      navigator.clipboard.writeText(jsonString);
      setCharExportButtonText("コピーしました！");
      setTimeout(() => {
        setCharExportButtonText("キャラクター設定をエクスポート");
      }, 2000);
    } catch (error) {
      console.error("キャラクター設定のエクスポートに失敗しました:", error);
      alert("エクスポートに失敗しました。");
    }
  };

  const handleCharImport = () => {
    if (!importCharJsonString) {
      alert("JSONデータを入力してください。");
      return;
    }
    try {
      const importedCharSlot = JSON.parse(importCharJsonString);
      updatePartySlot(activeSlotIndex, importedCharSlot);
      setIsCharImportModalOpen(false);
    } catch (error) {
      console.error("キャラクター設定のインポートに失敗しました:", error);
      alert("JSONの形式が正しくありません。");
    }
  };

  interface SimulationActor {
    index: number;
    name: string;
    data: any; // Character data
    stats: any; // Initial final stats
    actionValue: number;
    baseAV: number;
    currentStats: any; // Dynamically changing stats
    currentEp: number;
    currentHp: number;
    isDown: boolean;
    charge: number;
    lostHp: number;
    hellscapeTurns: number;
    autoSkillCooldown: number;
    selfBuffs: relics.Effect[];
    rotationIndex: number;
    turnCount: number;
    isSummonedSpirit?: boolean;
    summonerIndex?: number;
    actionKey?: ActionTypeKey;
    shield: {
      value: number;
      sourceActorIndex: number;
      maxShieldValue: number;
    };
    accumulatedHealing?: number;
  }

  const calculateFinalStats = (characterData: any, lightConeData: any, relicsData: any, subStatsData: any, relicSetsData: any, planarOrnamentData: any, allPartySlots?: any[], actor?: SimulationActor) => {
    if (!characterData) return null;

    let baseHp = characterData.baseHp + (lightConeData?.baseHp || 0);
    let baseAtk = characterData.baseAtk + (lightConeData?.baseAtk || 0);
    let baseDef = characterData.baseDef + (lightConeData?.baseDef || 0);

    let flatHp = 0, flatAtk = 0, flatDef = 0;
    let percentHp = 0, percentAtk = 0, percentDef = 0;
    let critRate = 5, critDmg = 50;
    let speed = characterData.baseSpd;
    let effectRes = 0;
    let breakEffect = 0;
    let epRegenRate = 0;

    // 属性与ダメージを初期化
    const damageTypes = ['物理', '炎', '氷', '雷', '風', '量子', '虚数'];
    let elementalDmg: { [key: string]: number } = {};
    damageTypes.forEach(type => elementalDmg[`${type}与ダメージ`] = 0);
    const allStats: relics.Stat[] = [];
    Object.values(relicsData).forEach((relic: any) => {
      allStats.push(relic.mainStat);
    });
    allStats.push(...subStatsData);


    allStats.forEach(stat => {
      if (!stat.type || !stat.value) return;
      const value = Number(stat.value);
      switch (stat.type) {
        case 'HP': flatHp += value; break;
        case '攻撃力': flatAtk += value; break;
        case '防御力': flatDef += value; break;
        case 'HP%': percentHp += value; break;
        case '攻撃力%': percentAtk += value; break;
        case '防御力%': percentDef += value; break;
        case '速度': speed += value; break;
        case '会心率': critRate += value; break;
        case '会心ダメージ': critDmg += value; break;
        case '効果抵抗': effectRes += value; break;
        case '撃破特効': breakEffect += value; break;
        case 'EP回復効率': epRegenRate += value; break;
        case '物理与ダメージ': elementalDmg['物理与ダメージ'] += value; break;
        case '炎与ダメージ': elementalDmg['炎与ダメージ'] += value; break;
        case '氷与ダメージ': elementalDmg['氷与ダメージ'] += value; break;
        case '雷与ダメージ': elementalDmg['雷与ダメージ'] += value; break;
        case '風与ダメージ': elementalDmg['風与ダメージ'] += value; break;
        case '量子与ダメージ': elementalDmg['量子与ダメージ'] += value; break;
        case '虚数与ダメージ': elementalDmg['虚数与ダメージ'] += value; break;
        // 治癒量、効果命中は別途Effectとして扱われるためここでは加算しない
      }
    });

    // 遺物・オーナメントの永続ステータスバフを適用
    const permanentBuffs: relics.Effect[] = [];
    relicSetsData.forEach((set: any) => {
      if (!set.id || set.count === 0) return;
      const setData = relics.RELIC_SETS.find(s => s.id === set.id);
      if (!setData) return;
      if (set.count >= 2 && setData.effects[2]?.effects) permanentBuffs.push(...setData.effects[2].effects);
      if (set.count >= 4 && setData.effects[4]?.effects) permanentBuffs.push(...setData.effects[4].effects);
    });
    const ornamentData = relics.PLANAR_ORNAMENTS.find(o => o.id === planarOrnamentData);
    if (ornamentData?.effects[2]?.effects) {
      permanentBuffs.push(...ornamentData.effects[2].effects);
    }

    // 光円錐の永続ステータスバフを適用
    const lcData = lightCones.find(lc => lc.id === lightConeData?.id);
    if (lcData) {
      const lcEffects = lcData.effects[lightConeRank - 1]?.effects;
      if (lcEffects) permanentBuffs.push(...lcEffects);
    }

    permanentBuffs.forEach(buff => {
      if (buff.type === 'STAT_MOD' && !buff.conditions) { // 条件のない永続バフのみを初期ステータスに加算
        if (typeof buff.value === 'object') {
          for (const statKey in buff.value) {
            if (statKey === '攻撃力%') percentAtk += buff.value[statKey];
            else if (statKey === 'HP%') percentHp += buff.value[statKey];
            else if (statKey === '速度') speed += buff.value[statKey];
            else if (statKey === '会心率') critRate += buff.value[statKey];
            else if (statKey === '会心ダメージ') critDmg += buff.value[statKey];
            else if (statKey === '撃破特効') breakEffect += buff.value[statKey];
            else if (statKey === 'EP回復効率') epRegenRate += buff.value[statKey];
            else if (statKey === '効果抵抗') effectRes += buff.value[statKey];
            else if (statKey === '効果命中') effectRes += buff.value[statKey]; // Note: Should be effectHitRate
            // バリア耐久値% はここでは計算しない
            else if (statKey.includes('与ダメージ')) elementalDmg[statKey] = (elementalDmg[statKey] ?? 0) + buff.value[statKey];
          }
        }
      }
    });

    // Apply trace bonuses
    if (characterData?.traces?.totalStats) {
      const traceStats = characterData.traces.totalStats;
      if (traceStats['HP%']) percentHp += traceStats['HP%'];
      if (traceStats['攻撃力%']) percentAtk += traceStats['攻撃力%'];
      if (traceStats['防御力%']) percentDef += traceStats['防御力%'];
      if (traceStats['会心率']) critRate += traceStats['会心率'];
      if (traceStats['会心ダメージ']) critDmg += traceStats['会心ダメージ'];
      if (traceStats['効果抵抗']) effectRes += traceStats['効果抵抗'];
      if (traceStats['速度']) speed += traceStats['速度'];
      if (traceStats['撃破特効']) breakEffect += traceStats['撃破特効'];
      // ... 他の軌跡ステータスもここに追加
    }

    // --- Character-specific conditional bonuses ---
    // ヒアンシーの「凪いだ暴風」
    if (characterData.id === 'xianci') {
      if (speed > 200) {
        percentHp += 20; // ヒアンシー自身のHPアップ
      }
    }

    // イカルンのステータス派生
    if (characterData.isTargetableSpirit && actor?.summonerIndex !== undefined && allPartySlots) {
      const summonerSlot = allPartySlots[actor.summonerIndex];
      const summonerData = characters.find(c => c.id === summonerSlot.characterId);
      if (summonerData) {
        // 召喚者の最終ステータスを再計算して参照する
        const summonerStats = calculateFinalStats(summonerData, lightCones.find(lc => lc.id === summonerSlot.lightConeId), summonerSlot.relics, summonerSlot.subStats, summonerSlot.relicSets, summonerSlot.planarOrnamentId, allPartySlots);
        if (summonerStats) {
          baseHp = summonerStats.total.hp * (characterData.baseHpMultiplier ?? 0.5); // イカルンの基礎HPはヒアンシーの最大HPの50%
          if (summonerStats.total.spd > 200) percentHp += 20; // 凪いだ暴風
        }
      }
    }

    const totalHp = Math.round(baseHp * (1 + percentHp / 100) + flatHp);
    const totalAtk = Math.round(baseAtk * (1 + percentAtk / 100) + flatAtk);
    const totalDef = Math.round(baseDef * (1 + percentDef / 100) + flatDef);

    return {
      base: { hp: baseHp, atk: baseAtk, def: baseDef, spd: characterData.baseSpd },
      total: { hp: totalHp, atk: totalAtk, def: totalDef, spd: speed, critRate, critDmg, effectRes, breakEffect, epRegenRate, ...elementalDmg },
    };
  };

  const finalStats = useMemo(() => {
    return calculateFinalStats(selectedCharacterData, selectedLightConeData, relicStates, subStats, selectedRelicSets, selectedPlanarOrnament);
  }, [selectedCharacterData, selectedLightConeData, relicStates, subStats, selectedRelicSets, selectedPlanarOrnament, partySlots]);

  const damageResult = useMemo(() => {
    if (!finalStats || !selectedCharacterData) return null;

    // これはプレースホルダーのロジックです。適切なダメージ計算式に置き換える必要があります。
    const { atk, hp, critRate, critDmg } = finalStats.total;
    const charLevel = 80; // Assuming character level 80 for now

    // --- Gather all active effects ---
    let totalDmgBoost: { [key in relics.ActionType]?: number } = { 'ALL': 0, 'BASIC': 0, 'SKILL': 0, 'ULTIMATE': 0, 'FOLLOW_UP': 0, 'DOT': 0 };
    let finalCritRate = finalStats.total.critRate;

    // --- 軌跡、星魂などからすべてのアクティブな効果を収集 ---
    const allEffects: relics.Effect[] = [];
    // 軌跡 (追加能力)
    selectedCharacterData.traces?.talents.forEach(t => {
      if (t.effects) allEffects.push(...t.effects);
    });
    // 星魂
    selectedCharacterData.eidolons?.forEach(e => {
      if (e.level <= eidolonLevel && e.effects) {
        allEffects.push(...e.effects);
      }
    });
    // 光円錐
    const lcEffect = selectedLightConeData?.effects[lightConeRank - 1];
    if (lcEffect?.effects) {
      allEffects.push(...lcEffect.effects);
    }

    allEffects.forEach(effect => {
      const isConditionMet = effect.conditions?.every(cond => {
        if (cond.type === 'IN_STATE') {
          // トグル可能な効果については、combatStateを確認します。
          // combatStateのキーは効果自身のIDです。
          if (cond.value === 'イカルン召喚中') {
            // これは静的なチェックです。シミュレーションでは動的にする必要があります。
            return partySlots.some(p => p.characterId === 'xianci');
          } else {
            return combatState[effect.id] ?? false;
          }
        }
        // TODO: HP_BELOWのような他の条件を実装する
        return true;
      }) ?? true;

      if (isConditionMet) {
        if (typeof effect.value === 'object') {
          switch (effect.type) {
            case 'STAT_MOD':
              if (effect.value['会心率']) finalCritRate += effect.value['会心率'];
              // ... 他のステータス修飾
              break;
            case 'DMG_BOOST':
              for (const key in effect.value) {
                if (key in totalDmgBoost) {
                  totalDmgBoost[key as relics.ActionType] = (totalDmgBoost[key as relics.ActionType] ?? 0) + effect.value[key];
                }
              }
              break;
          }
        }
      }
    });

    // --- ダメージ計算 ---
    let mainTargetBaseDmg = 0;
    let adjacentTargetBaseDmg = 0;
    const actionData = selectedCharacterData.actions?.[actionType as ActionTypeKey];

    if (actionData) {
      actionData.damageScaling?.main.forEach((scale: ScalingComponent) => {
        let statValue = 0;
        if (scale.stat === 'atk') statValue = atk;
        else if (scale.stat === 'hp') statValue = hp;
        // else if (scale.stat === 'def') statValue = def; // 防御力スケールの場合
        else if (scale.stat === 'lostHp') statValue = lostHp;
        mainTargetBaseDmg += statValue * (scale.multiplier / 100);
      });

      // 隣接ターゲットのダメージを計算（存在する場合）
      if (actionData.targetType === 'blast' && actionData.damageScaling?.adjacent) {
        actionData.damageScaling.adjacent.forEach((scale: ScalingComponent) => {
          let statValue = 0;
          if (scale.stat === 'atk') statValue = atk;
          else if (scale.stat === 'hp') statValue = hp;
          // else if (scale.stat === 'def') statValue = def;
          else if (scale.stat === 'lostHp') statValue = lostHp;
          adjacentTargetBaseDmg += statValue * (scale.multiplier / 100);
        });
      }
    }

    // 与ダメージバフを適用
    const actionDmgBoost = (totalDmgBoost['ALL'] || 0) + (totalDmgBoost[actionType.toUpperCase() as relics.ActionType] ?? 0);
    const mainBoostedDmg = mainTargetBaseDmg * (1 + actionDmgBoost / 100);
    const adjacentBoostedDmg = adjacentTargetBaseDmg * (1 + actionDmgBoost / 100);


    // 簡略化された防御補正
    const defMultiplier = (charLevel + 20) / ((enemyLevel + 20) * (1 - 0) + (charLevel + 20)); // 防御デバフ0と仮定

    // 簡略化された耐性補正
    const resMultiplier = 1.0; // 耐性0%と仮定

    const finalBaseDmg = mainBoostedDmg * defMultiplier * resMultiplier;
    const finalAdjacentBaseDmg = adjacentBoostedDmg * defMultiplier * resMultiplier;

    // 簡略化された会心計算
    const avgCritDmg = finalBaseDmg * (1 + (Math.min(finalCritRate, 100) / 100) * (critDmg / 100));

    const avgAdjacentCritDmg = finalAdjacentBaseDmg * (1 + (Math.min(finalCritRate, 100) / 100) * (critDmg / 100));

    let totalAverageDamage = avgCritDmg;
    if (actionData?.targetType === 'aoe') {
      totalAverageDamage = avgCritDmg * enemyCount;
    } else if (actionData?.targetType === 'blast') {
      // メインターゲット + 最大2体の隣接ターゲット
      const adjacentCount = Math.min(2, Math.max(0, enemyCount - 1));
      totalAverageDamage = avgCritDmg + (avgAdjacentCritDmg * adjacentCount);
    }

    return {
      nonCrit: Math.round(finalBaseDmg),
      crit: Math.round(finalBaseDmg * (1 + critDmg / 100)),
      average: Math.round(avgCritDmg),
      averageAdjacent: Math.round(avgAdjacentCritDmg),
      totalAverage: Math.round(totalAverageDamage),
    };
  }, [finalStats, selectedCharacterData, selectedLightConeData, lightConeRank, actionType, enemyLevel, eidolonLevel, combatState, lostHp, enemyCount]);

  const handleRunSimulation = () => {
    if (partySlots.every(slot => !slot.characterId)) return;

    setSimulationResult({
      totalDamage: "計算中...",
      totalHealing: 0,
      totalShieldGranted: 0,
      healingCoefficientOfVariation: 0,
      log: [],
      breakdown: []
    });

    // この関数はシミュレーション内で変化する状態に依存する場合、外部に出すかメモ化する必要があります。
    // 現時点ではここで定義しても問題ないと仮定しますが、アクティブなキャラクターの`finalStats`のみを再計算します。
    // 適切なパーティーシミュレーションでは、各キャラクターの`finalStats`を計算します。
    const calculateActionDamage = (actor: SimulationActor, actionKey: ActionTypeKey | 'technique' | 'additional', currentLostHp: number, partyBuffs: relics.Effect[], selfBuffs: relics.Effect[], enemyDebuffs: relics.Effect[]): number => {
      const charData = actor.data;
      if (!charData || !actor.currentStats) return 0;
      const { atk, hp, critDmg } = actor.currentStats.total;
      const charLevel = 80; // Assuming character level 80 for now

      let totalDmgBoost: { [key in relics.ActionType]?: number } = { 'ALL': 0, 'BASIC': 0, 'SKILL': 0, 'ULTIMATE': 0, 'FOLLOW_UP': 0, 'DOT': 0 };
      let finalCritRate = actor.currentStats.total.critRate;
      let totalResPen = 0;
    let totalDefShred = 0;
      let totalDmgTakenIncrease = 0;

      // 特定のキャラクターのための簡略化された効果収集
      // 完全なパーティーシミュレーションでは、味方からのバフもチェックします。
      const allEffects: relics.Effect[] = [];
      charData.traces?.talents.forEach((t: any) => { if (t.effects) allEffects.push(...t.effects); });
      charData.eidolons?.forEach((e: any) => { if (e.level <= eidolonLevel && e.effects) allEffects.push(...e.effects); });
      // この部分はまだアクティブなキャラクターの光円錐を使用しており、一般化する必要があります。
      const lcEffect = lightCones.find(lc => lc.id === charData.lightConeId)?.effects[charData.lightConeRank - 1];
      if (lcEffect?.effects) allEffects.push(...lcEffect.effects);

      // 今日も平和な一日
      const peacefulDayEffect = allEffects.find(e => e.id.startsWith('peaceful_day_'));
      if (peacefulDayEffect && typeof peacefulDayEffect.value === 'object' && 'ALL' in peacefulDayEffect.value) {
        totalDmgBoost['ALL'] = (totalDmgBoost['ALL'] ?? 0) + (peacefulDayEffect.value['ALL'] ?? 0) * (actor.data.maxEp ?? 0);
      }

      // 遺物セット効果
      const actorSlot = partySlots[actor.index];
      if (actorSlot) {
        actorSlot.relicSets.forEach(set => {
          if (set.id && set.count > 0) {
            const setData = relics.RELIC_SETS.find(s => s.id === set.id);
            if (setData) {
              if (set.count >= 2 && setData.effects[2]?.effects) allEffects.push(...setData.effects[2].effects);
              if (set.count >= 4 && setData.effects[4]?.effects) allEffects.push(...setData.effects[4].effects);
            }
          }
        });
      }

      // オーナメントセット効果
      const planarOrnamentId = actorSlot?.planarOrnamentId;
      if (planarOrnamentId) {
        const ornamentData = relics.PLANAR_ORNAMENTS.find(o => o.id === planarOrnamentId);
        if (ornamentData?.effects[2]?.effects) {
          allEffects.push(...ornamentData.effects[2].effects);
        }
      }

      // パーティー全体のバフを追加
      allEffects.push(...partyBuffs);
      allEffects.push(...selfBuffs);
      allEffects.push(...enemyDebuffs);

      allEffects.forEach(effect => {
        const isConditionMet = effect.conditions?.every(cond => {
          if (cond.type === 'IN_STATE') {
            if (cond.value === 'イカルン召喚中') return simulationState.icarunSummoned;
            if (cond.value === '雨上がり') return simulationState.xianciRainfall.active;
            // トグル可能な効果については、ソースアクターのcombatStateを確認します。
            return partySlots[effect.sourceActorIndex ?? actor.index]?.combatState[effect.id] ?? false;
          }
          return true;
        }) ?? true;
        if (isConditionMet && typeof effect.value === 'object') {
          if (effect.type === 'STAT_MOD' && effect.value['会心率']) finalCritRate += effect.value['会心率'];
          if (effect.type === 'DMG_BOOST') {
            const stacks = effect.currentStacks ?? 1;
            for (const key in effect.value) {
              if (key in totalDmgBoost) {
                const valuePerStack = effect.value[key];
                totalDmgBoost[key as relics.ActionType] = (totalDmgBoost[key as relics.ActionType] ?? 0) + valuePerStack * stacks;
              }
            }
          } else if (effect.type === 'DEF_SHRED') {
            if (effect.id === 'prisoner_def_shred') {
              // 深い牢獄の囚人
              const dotCount = simulationState.enemyDebuffs.filter(d =>
                ['裂創', '燃焼', '感電', '風化'].some(dot => d.id.includes(dot)) || d.scaling
              ).length;
              const stacks = Math.min(3, dotCount);
              totalDefShred += (effect.value['DEF_SHRED'] ?? 0) * stacks;
            } else {
              // 星の如く輝く天才など
              totalDefShred += effect.value['DEF_SHRED'] ?? 0;
            }
          } else if (effect.id === 'arena_dmg_boost') {
            // 星々の競技場
            if (finalCritRate >= 70) {
              if (actionKey === 'basic') totalDmgBoost['BASIC'] = (totalDmgBoost['BASIC'] ?? 0) + (effect.value['BASIC'] ?? 0);
              if (actionKey === 'skill') totalDmgBoost['SKILL'] = (totalDmgBoost['SKILL'] ?? 0) + (effect.value['SKILL'] ?? 0);
            }
          }
        } else if (typeof effect.value === 'number') {
          if (effect.type === 'RES_PEN') totalResPen += effect.value;
          if (effect.type === 'DMG_TAKEN_INCREASE') totalDmgTakenIncrease += effect.value;
        }
      });


      let mainTargetBaseDmg = 0;
      let adjacentTargetBaseDmg = 0;
      const actionData = actionKey === 'technique'
        ? charData.technique
        : actionKey === 'additional' // トリビーの付加ダメージのためにハードコード
          ? { damageScaling: { main: [{ stat: 'hp', multiplier: 12 }] }, targetType: 'single' } as Action
          : charData.actions?.[actionKey as ActionTypeKey];

      if (actionData?.damageScaling) {
        actionData.damageScaling.main.forEach((scale: any) => {
          let statValue = 0;
          if (scale.stat === 'atk') statValue = atk;
          else if (scale.stat === 'hp') statValue = hp;
          else if (scale.stat === 'comradeAtk' && actor.data.isUntargetableSpirit) {
            const comradeActor = partyActors.find(p => p.index === simulationState.comradeState.targetIndex);
            if (comradeActor) {
              statValue = comradeActor.currentStats.total.atk;
            }
          }
          else if (scale.stat === 'icarunTotalHealing' && actor.data.isTargetableSpirit) {
            mainTargetBaseDmg += simulationState.icarunAccumulatedHealing * (scale.multiplier / 100);
            console.log(simulationState.icarunAccumulatedHealing);
          }
          else if (scale.stat === 'lostHp') statValue = currentLostHp;
          mainTargetBaseDmg += statValue * (scale.multiplier / 100);
        });
        if (actionData.targetType === 'blast' && actionData.damageScaling.adjacent) {
          actionData.damageScaling.adjacent.forEach((scale: any) => {
            let statValue = 0;
            if (scale.stat === 'atk') statValue = atk;
            else if (scale.stat === 'hp') statValue = hp;
            else if (scale.stat === 'lostHp') statValue = currentLostHp;
            adjacentTargetBaseDmg += statValue * (scale.multiplier / 100);
          });
        }
      }

      const actionDmgBoost = actionKey === 'additional'
        ? totalDmgBoost['ALL'] // 付加ダメージは与ダメージバフのみ適用
        : (totalDmgBoost['ALL'] ?? 0) + (totalDmgBoost[actionKey.toUpperCase() as relics.ActionType] ?? 0);

      // 属性与ダメージを追加
      // @ts-ignore
      const elementalDmgBoost = actor.currentStats.total[`${actor.data.combatType}与ダメージ`] ?? 0;
      const mainBoostedDmg = mainTargetBaseDmg * (1 + (actionDmgBoost + elementalDmgBoost) / 100);
      const adjacentBoostedDmg = adjacentTargetBaseDmg * (1 + (actionDmgBoost + elementalDmgBoost) / 100);

      const defMultiplier = (charLevel + 20) / ((enemyLevel + 20) * (1 - (totalDefShred / 100)) + (charLevel + 20));
      const enemyBaseRes = 0.2; // 基礎耐性20%と仮定
      const finalRes = enemyBaseRes - (totalResPen / 100);
      const resMultiplier = 1.0 - finalRes;
      const dmgTakenMultiplier = 1.0 + (totalDmgTakenIncrease / 100);

      const finalMainBaseDmg = mainBoostedDmg * defMultiplier * resMultiplier * dmgTakenMultiplier;
      const finalAdjacentBaseDmg = adjacentBoostedDmg * defMultiplier * resMultiplier * dmgTakenMultiplier;

      const avgCritDmg = finalMainBaseDmg * (1 + (Math.min(finalCritRate, 100) / 100) * (critDmg / 100));
      const avgAdjacentCritDmg = finalAdjacentBaseDmg * (1 + (Math.min(finalCritRate, 100) / 100) * (critDmg / 100));

      let totalAverageDamage = avgCritDmg;
      if (actionData?.targetType === 'aoe') totalAverageDamage = avgCritDmg * enemyCount;
      else if (actionData?.targetType === 'blast') {
        const adjacentCount = Math.min(2, Math.max(0, enemyCount - 1));
        totalAverageDamage = avgCritDmg + (avgAdjacentCritDmg * adjacentCount);
      }
      return totalAverageDamage;
    };

    const checkAndApplyGuardianBuff = (spAfterGain: number) => {
      if (spAfterGain >= 4) {
        const archerActor = partyActors.find(p => p?.data.id === 'archer');
        if (archerActor) {
          const buffEffect = archerActor.data.traces?.talents.find(t => t.id === 'archer-talent3')?.effects?.[0];
          if (buffEffect) {
            const existingBuff = archerActor.selfBuffs.find(b => b.id === buffEffect.id);
            if (existingBuff) existingBuff.duration = buffEffect.duration; // Refresh duration
            else archerActor.selfBuffs.push({ ...buffEffect, currentStacks: 1 });
          }
        }
      }
    };

    const updateAllActorStats = (actors: any[]) => {
      // まず、トリビーのような効果のためにパーティーの合計HPを計算します
      let totalPartyHp = 0;
      actors.forEach(actor => {
        if (!actor) return;
        // 遺物・オーナメントの条件付きバフを評価
        const allEquippedEffects: relics.Effect[] = [];
        const slot = partySlots[actor.index];
        if (slot) {
          slot.relicSets.forEach(set => {
            if (set.id && set.count > 0) {
              const setData = relics.RELIC_SETS.find(s => s.id === set.id);
              if (setData) {
                if (set.count >= 2 && setData.effects[2]?.effects) allEquippedEffects.push(...setData.effects[2].effects);
                if (set.count >= 4 && setData.effects[4]?.effects) allEquippedEffects.push(...setData.effects[4].effects);
              }
            }
          });
          const ornamentData = relics.PLANAR_ORNAMENTS.find(o => o.id === slot.planarOrnamentId);
          if (ornamentData?.effects[2]?.effects) {
            allEquippedEffects.push(...ornamentData.effects[2].effects);
          }
        }

        allEquippedEffects.forEach(effect => {
          if (effect.conditions) {
            const isConditionMet = effect.conditions.every(cond => {
              switch (cond.type) {
                case 'STAT_GTE':
                  const statValue = actor.currentStats.total[cond.stat] ?? 0;
                  return statValue >= cond.value;
                case 'HAS_SUMMON':
                  return actors.some(a => a && a.summonerIndex === actor.index && !a.isDown);
                case 'IS_PARTY_MEMBER':
                  // この条件はルサカのような特殊なケース用
                  return actor.index === cond.value;
                case 'HAS_SHIELD_FROM_SOURCE':
                  // この遺物を装備しているキャラからバリアを付与されているか
                  return actor.shield.value > 0 && actor.shield.sourceActorIndex === effect.sourceActorIndex;
                default:
                  return true;
              }
            });

            const existingBuff = (effect.target === 'ALLIES' ? simulationState.partyBuffs : actor.selfBuffs).find(b => b.id === effect.id);
            if (isConditionMet && !existingBuff) {
              if (effect.target === 'ALLIES') simulationState.partyBuffs.push({ ...effect, sourceActorIndex: actor.index });
              else actor.selfBuffs.push({ ...effect, sourceActorIndex: actor.index });
            } else if (!isConditionMet && existingBuff) {
              if (effect.target === 'ALLIES') simulationState.partyBuffs = simulationState.partyBuffs.filter(b => b.id !== effect.id);
              else actor.selfBuffs = actor.selfBuffs.filter(b => b.id !== effect.id);
            }
          }
        });
        if (actor) {
          // 他のメンバーには現在のHPを使用しますが、トリビー自身のバフでの再帰計算を避けるため、トリビーには基礎HPを使用します
          totalPartyHp += (actor.data.id === 'toribii') ? actor.stats.total.hp : actor.currentStats.total.hp;
        }
      });

      // --- ステータス計算後の特殊処理 ---
      actors.forEach(actor => {
        if (!actor) return;
        // トリビー: 羽の生えたガラス玉！ (パーティ全体のHPに依存するため、全キャラの基本ステータス計算後に適用)
        if (actor.data.id === 'toribii' && simulationState.toribiiField.active) {
          actor.currentStats.total.hp += totalPartyHp * 0.09;
        }
      });

      actors.forEach(actor => {
        if (!actor) return;

        // --- ステータス計算前の事前処理 ---

        // 1. 特殊な計算が必要なバフを事前に付与/更新
        //    これらは他のキャラクターのステータスに依存するため、汎用ループの前に処理する必要がある。

        // 1a. 寒鴉の必殺技による速度バフ
        const hanyaUltSpdBoostEffect = [...actor.selfBuffs, ...simulationState.partyBuffs].find(e => e.id === 'hanya-ult-spd-boost' && e.sourceActorIndex !== undefined);
        if (hanyaUltSpdBoostEffect) {
          const hanyaActor = partyActors.find(p => p.index === hanyaUltSpdBoostEffect.sourceActorIndex);
          if (hanyaActor) {
            const spdBoostValue = hanyaActor.currentStats.total.spd * 0.20; // 速度は常に現在の値から計算
            const dynamicBuff: relics.Effect = { id: 'hanya-ult-spd-boost-applied', source: '必殺技 (速度適用値)', target: 'SELF', type: 'STAT_MOD', value: { '速度': spdBoostValue }, duration: hanyaUltSpdBoostEffect.duration, sourceActorIndex: hanyaActor.index };
            const existingBuffIndex = actor.selfBuffs.findIndex(b => b.id === dynamicBuff.id);
            if (existingBuffIndex === -1) actor.selfBuffs.push(dynamicBuff);
            else actor.selfBuffs[existingBuffIndex] = dynamicBuff;
          }
        } else {
          // バフがなくなった場合、適用されていた動的バフも削除
          actor.selfBuffs = actor.selfBuffs.filter(b => b.id !== 'hanya-ult-spd-boost-applied');
        }

        // 1b. トリビーのHPバフ (結界中)
        // (これは totalPartyHp に依存するため、後で計算)

        // 「同袍」状態による特殊なバフを事前に付与
        if (actor.index === simulationState.comradeState.targetIndex) {
          const dhthActor = actors.find(p => p.index === simulationState.comradeState.sourceActorIndex);
          if (dhthActor) {
            // 軌跡「偉観」のバフを動的に生成して付与
            const grandViewTrace = dhthActor.data.traces.talents.find((t: any) => t.id === 'dhth-trace-grand-view');
            if (grandViewTrace) {
              const atkBoostValue = dhthActor.currentStats.total.atk * 0.15;
              const grandViewBuff: relics.Effect = { id: 'dhth-grand-view-atk-buff-applied', source: '偉観', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力': atkBoostValue }, duration: Infinity, sourceActorIndex: dhthActor.index };
              const existingBuffIndex = actor.selfBuffs.findIndex(b => b.id === grandViewBuff.id);
              if (existingBuffIndex === -1) actor.selfBuffs.push(grandViewBuff);
              else actor.selfBuffs[existingBuffIndex] = grandViewBuff; // 毎ティック更新
            }
          }
        }

        // 惑星との出会い
        const planetaryRendezvousEquippers = actors.filter(a => a && partySlots[a.index]?.lightConeId === 'planetary_rendezvous');
        planetaryRendezvousEquippers.forEach(equipper => {
          if (equipper && equipper.data.combatType === actor.data.combatType) {
            const lcRank = partySlots[equipper.index]?.lightConeRank ?? 1;
            const lcData = lightCones.find(lc => lc.id === 'planetary_rendezvous');
            const planetaryBuff = lcData?.effects[lcRank - 1].effects?.[0];
            if (planetaryBuff && !actor.selfBuffs.some(b => b.id === planetaryBuff.id && b.sourceActorIndex === equipper.index)) {
              // このバフは永続なので、selfBuffsに追加する
              actor.selfBuffs.push({ ...planetaryBuff, sourceActorIndex: equipper.index });
            }
          }
        });

        // 今が丁度
        const perfectTimingLcEffect = actor.selfBuffs.find(b => b.id.startsWith('timing_s'));
        if (perfectTimingLcEffect) {
          const lcRank = partySlots[actor.index]?.lightConeRank ?? 1;
          const lcData = lightCones.find(lc => lc.id === 'perfect_timing');
          if (lcData) {
            const effectDesc = lcData.effects[lcRank - 1].description;
            const ratioMatch = effectDesc.match(/効果抵抗の(\d+)%/);
            const capMatch = effectDesc.match(/最大で(\d+)%/);
            const ratio = ratioMatch ? parseInt(ratioMatch[1], 10) : 33;
            const cap = capMatch ? parseInt(capMatch[1], 10) : 15;
            const healBoostFromRes = Math.min(cap, actor.currentStats.total.effectRes * (ratio / 100));
            const dynamicHealBuff: relics.Effect = { id: 'timing_heal_boost_applied', source: '屈折する視線 (適用値)', target: 'SELF', type: 'HEAL_BOOST', value: healBoostFromRes, duration: Infinity, sourceActorIndex: actor.index };
            const existingBuffIndex = actor.selfBuffs.findIndex(b => b.id === dynamicHealBuff.id);
            if (existingBuffIndex === -1) actor.selfBuffs.push(dynamicHealBuff);
            else actor.selfBuffs[existingBuffIndex] = dynamicHealBuff;
          }
        }

        const activeEffects = [...actor.selfBuffs, ...simulationState.partyBuffs].filter(Boolean); // 動的なバフのみを対象とする
        const newTotal = JSON.parse(JSON.stringify(actor.stats.total));

        activeEffects.forEach(effect => {
          // This loop will now handle general STAT_MOD buffs.
          // Toribii's special HP buff is handled outside this loop.
        });

        // 最終値を丸めます
        newTotal.hp = Math.round(newTotal.hp);

        if (actor.data.isTargetableSpirit) {
          newTotal.spd = 0; // イカルンの速度は常に0
        }

        // Apply STAT_MOD effects
        activeEffects.forEach(effect => {
          if (effect.type === 'STAT_MOD' && typeof effect.value === 'object') {
            // 汎用的なステータス修飾を処理します
            for (const statKey in effect.value) {
              if (statKey === '攻撃力%') newTotal.atk += actor.stats.base.atk * (effect.value[statKey] / 100);
              else if (statKey === 'HP%') newTotal.hp += actor.stats.base.hp * (effect.value[statKey] / 100);
              else if (statKey === 'HP') newTotal.hp += effect.value[statKey];
              else if (statKey === '会心ダメージ') newTotal.critDmg += effect.value[statKey];
              else if (statKey === '攻撃力') newTotal.atk += effect.value[statKey];
              else if (statKey === '速度') newTotal.spd += effect.value[statKey];
              else if (statKey === '速度%') newTotal.spd += actor.stats.base.spd * (effect.value[statKey] / 100);
            }
          }
        });

        actor.currentStats.total = newTotal;

        // 龍霊のステータスを同袍に同期
        if (actor.data.isUntargetableSpirit && actor.data.id === 'dragon_spirit_dhth') {
          const comradeActor = actors.find(p => p?.index === simulationState.comradeState.targetIndex);
          if (comradeActor) {
            const originalSpd = actor.currentStats.total.spd;
            actor.currentStats.total = JSON.parse(JSON.stringify(comradeActor.currentStats.total));
            actor.currentStats.total.spd = originalSpd; // 速度は龍霊固有のものを維持
          }
        }
      });
    };

    const calculateHealAmount = (actor: SimulationActor, healScaling: ScalingComponent): number => {
      const charData = actor.data;
      if (!charData || !actor.currentStats || !healScaling) return 0;
      const { multiplier, flat, stat } = healScaling;

      const statValue = stat === 'hp'
        ? actor.currentStats.total.hp
        : actor.currentStats.total.atk;
      let totalHealBoost = 0;

      // TODO: すべてのソース（遺物、他のキャラクターなど）から治癒量バフ効果を収集します
      const allEffects = [...actor.selfBuffs, ...simulationState.partyBuffs];
      allEffects.forEach(effect => {
        if (effect.type === 'HEAL_BOOST') {
          // 手術後の会話: 必殺技のみ
          if (effect.id.startsWith('post_op_') && actor.actionKey !== 'ultimate') {
            return;
          }
          totalHealBoost += effect.value as number;
        }
      });

      // 現時点では、羅刹の星魂2のみをチェックしています
      if (charData.id === 'luocha') {
        const e2Effect = charData.eidolons?.find((e: any) => e.id === 'luocha-e2')?.effects?.[0];
        // この汎用関数では簡単のため、条件（ターゲットのHP < 50%）が満たされていると仮定します。
        // 実際のシミュレーションロジックでは、呼び出す前に条件を確認する必要があります。
        if (e2Effect && partySlots[charData.index]?.eidolonLevel >= 2) {
          // これは大まかなチェックです。より良い実装では、ターゲットの状態を渡します。
          totalHealBoost += e2Effect.value;
        }
      }
      // ヒアンシーの軌跡「凪いだ暴風」
      if (charData.id === 'xianci' && actor.currentStats.total.spd > 200) {
        const talent = charData.traces?.talents.find((t: any) => t.id === 'xianci-talent3');
        if (talent) {
          const excessSpeed = Math.min(200, actor.currentStats.total.spd - 200);
          totalHealBoost += excessSpeed * 1; // 1% per point
        }
        // 微笑む暗雲
        // これにはターゲットのHPが必要ですが、まだ追跡していません。簡単のため、常にアクティブであると仮定します。
        totalHealBoost += 25;
      }

      const baseHeal = statValue * (multiplier / 100) + (flat ?? 0);
      const finalHeal = baseHeal * (1 + totalHealBoost / 100);

      // イカルンの治癒量蓄積
      if (charData.id === 'xianci' || actor.data.isTargetableSpirit) {
        simulationState.icarunAccumulatedHealing = (simulationState.icarunAccumulatedHealing ?? 0) + finalHeal;
        // イカルンの天賦による与ダメージバフ
        const icarunActor = partyActors.find(p => p?.data.isTargetableSpirit);
        if (icarunActor) {
          const talentBuff = { id: 'icarun-dmg-boost', source: '天賦', target: 'SELF', type: 'DMG_BOOST', value: { 'ALL': 80 }, duration: 2, maxStacks: 3 } as const;
          const existingBuff = icarunActor.selfBuffs.find(b => b.id === talentBuff.id);
          if (existingBuff) {
            existingBuff.currentStacks = Math.min(talentBuff.maxStacks, (existingBuff.currentStacks ?? 1) + 1);
            existingBuff.duration = talentBuff.duration;
          } else {
            icarunActor.selfBuffs.push({ ...talentBuff, currentStacks: 1 });
          }
        }
      }
      return Math.round(finalHeal);
    };

    const applyHeal = (healer: SimulationActor, target: SimulationActor, healAmount: number, sourceAction: string, currentParty: SimulationActor[]) => {
      if (target.isDown) return;
      target.currentHp = Math.min(target.currentStats.total.hp, target.currentHp + healAmount);
      totalHealing += healAmount;

      healingDoneByCharacter[healer.index] = (healingDoneByCharacter[healer.index] ?? 0) + healAmount;
      healingReceivedByCharacter[target.index] = (healingReceivedByCharacter[target.index] ?? 0) + healAmount;
      actionLog.push({ name: target.name, currentTime: currentTime, action: `回復 (${sourceAction})`, healingDone: healAmount, sp: currentSp, activeEffects: [], charge: target.charge, hp: target.currentHp, maxHp: target.currentStats.total.hp });
    };

    // --- シミュレーションコアエンジン ---
    let totalDamage = 0;
    const applyShield = (source: SimulationActor, target: SimulationActor, shieldAmount: number, sourceAction: string, maxShieldValue: number) => {
      if (target.isDown) return;

      let finalShieldAmount = shieldAmount;
      // 付与者のバリア耐久値アップ効果を適用
      const sourceSlot = partySlots[source.index];
      if (sourceSlot) {
        const hermitSet2 = sourceSlot.relicSets.find(s => s.id === 'hermit_who_hides_the_starlight' && s.count >= 2);
        if (hermitSet2) finalShieldAmount *= 1.10;
        const hermitSet4 = sourceSlot.relicSets.find(s => s.id === 'hermit_who_hides_the_starlight' && s.count >= 4);
        if (hermitSet4) finalShieldAmount *= 1.12;
      }

      // バリア上限を超えないようにする
      const newShieldValue = Math.min(maxShieldValue, (target.shield?.value ?? 0) + finalShieldAmount);
      const actualShieldAdded = newShieldValue - (target.shield?.value ?? 0);

      target.shield = {
        value: newShieldValue,
        sourceActorIndex: source.index,
        maxShieldValue: maxShieldValue,
      };

      if (actualShieldAdded > 0) {
        // 総付与バリア量とキャラクター別付与バリア量を更新
        totalShieldGranted += actualShieldAdded;

        // 司祭4セット効果
        const priestSet = partySlots[source.index]?.relicSets.find(s => s.id === 'priest_of_hardship' && s.count >= 4);
        if (priestSet && (source.actionKey === 'skill' || source.actionKey === 'ultimate')) {
          const priestBuff = { id: 'priest_crit_dmg', source: '再び苦難の道を歩む司祭', target: 'ALLIES', type: 'STAT_MOD', value: { '会心ダメージ': 18 }, duration: 2, maxStacks: 2, sourceActorIndex: source.index } as const;
          addOrRefreshBuff(target, priestBuff);
        }

        if (source.index !== -1) { // 敵からの攻撃など、ソースがない場合は除外
          shieldGrantedByCharacter[source.index] = (shieldGrantedByCharacter[source.index] ?? 0) + actualShieldAdded;
        }

        actionLog.push({ name: target.name, currentTime: currentTime, action: `バリア獲得 (${sourceAction})`, shieldGranted: actualShieldAdded, sp: currentSp, activeEffects: [], charge: target.charge, hp: target.currentHp, maxHp: target.currentStats.total.hp, shield: target.shield.value });
      }
    };
    const damageDealtByCharacter: Record<number, number> = {};
    const addOrRefreshBuff = (targetActor: SimulationActor, buff: relics.Effect) => {
      const existingBuff = targetActor.selfBuffs.find(b => b.id === buff.id);
      if (existingBuff) {
        existingBuff.duration = buff.duration;
        if (buff.maxStacks && buff.maxStacks > 1) {
          existingBuff.currentStacks = Math.min(buff.maxStacks, (existingBuff.currentStacks ?? 1) + 1);
        }
      } else {
        targetActor.selfBuffs.push({ ...buff, currentStacks: 1 });
      }
    };
    const healingDoneByCharacter: Record<number, number> = {};
    const healingReceivedByCharacter: Record<number, number> = {};
    const shieldGrantedByCharacter: Record<number, number> = {};
    let totalShieldGranted = 0;
    let totalHealing = 0;
    let currentSp = 3; // SPの初期値
    let maxSp = 5;
    const actionLog: {
      name: string; currentTime: number; action: string; sp: number; activeEffects: string[];
      damageDealt?: number; healingDone?: number; shieldGranted?: number;
      charge?: number; ep?: number; hp?: number; maxHp?: number;
      toughness?: number; maxToughness?: number; shield?: number;
    }[] = [];

    const simulationState = {
      partyBuffs: [] as relics.Effect[],
      icarunSummoned: false,
      icarunAccumulatedHealing: 0,
      xianciRainfall: { active: false, duration: 0, sourceActorIndex: -1 }, // For Xianci's Ultimate
      luochaField: { active: false, duration: 0, sourceActorIndex: -1 },
      ruanMeiField: { active: false, duration: 0, sourceActorIndex: -1 },
      enemyState: {
        toughness: enemyMaxToughness,
        maxToughness: enemyMaxToughness,
        maxHp: enemyMaxHp,
        type: enemyType,
        isBroken: false,
        hasPlumBlossom: false,
      },
      ruanMeiField: { active: false, duration: 0, sourceActorIndex: -1 },
      toribiiTalentUses: {} as Record<number, boolean>,
      toribiiField: { active: false, duration: 0, sourceActorIndex: -1 },
      enemyDebuffs: [] as relics.Effect[],
      burdenState: {
        targetIndex: -1, // No target initially
        hitCount: 0,
        spRecoveryCount: 0,
        sourceActorIndex: -1,
      },
      comradeState: { // For Dan Heng Teng Huang
        targetIndex: -1,
        sourceActorIndex: -1,
      },
      dragonSpiritState: {
        isEnhanced: false,
        enhancedActionsLeft: 0,
      }
    };


    // シミュレーションのためのアクターを初期化
    const initialPartyActors: (SimulationActor | null)[] = partySlots.map((slot, index) => {
      const charData = characters.find(c => c.id === slot.characterId);
      if (!charData) return null;

      const lcData = lightCones.find(lc => lc.id === slot.lightConeId);

      const tempActor = { index, data: charData } as SimulationActor;
      const charFinalStats = calculateFinalStats(
        charData, lcData, slot.relics, slot.subStats, slot.relicSets, slot.planarOrnamentId, partySlots, tempActor
      );

      if (!charFinalStats) return null;

      const baseAV = 10000 / charFinalStats.total.spd;

      return {
        index,
        name: charData.name,
        data: charData,
        stats: charFinalStats,
        actionValue: 0, // Initialize action value
        baseAV: baseAV,
        currentStats: JSON.parse(JSON.stringify(charFinalStats)),
        currentEp: (() => {
          // @ts-ignore
          let initialEp = (charData.maxEp ? charData.maxEp / 2 : 0);
          // トリビーの開始EP天賦を適用
          if (charData.id === 'toribii') initialEp += 30;
          return initialEp * (1 + (charFinalStats.total.epRegenRate / 100));
        })(),
        charge: (() => {
          // アーチャーの開始チャージ天賦を適用
          if (charData.id === 'archer') return 1; // 正義の味方
          return 0;
        })(),
        // キャラクター固有の状態
        currentHp: charFinalStats.total.hp,
        isDown: false,
        lostHp: 0,
        actionValue: (() => {
          // 百花の行動順短縮
          if (charData.id === 'dan_heng_teng_huang') {
            const hundredFlowersEffect = charData.traces.talents.find(t => t.id === 'dhth-trace-hundred-flowers')?.effects?.[0];
            if (hundredFlowersEffect && typeof hundredFlowersEffect.value === 'object' && 'initialAvAdvance' in hundredFlowersEffect.value) {
              return (hundredFlowersEffect.value.initialAvAdvance ?? 0) * 100;
            }
          }
          // 生命のウェンワーク
          if (slot.planarOrnamentId === 'live_giving_wenge' && charFinalStats.total.spd >= 120) {
            const wengeOrnament = relics.PLANAR_ORNAMENTS.find(o => o.id === 'live_giving_wenge');
            if (wengeOrnament) {
              return 40 * 100; // 40%行動順が早まる
            }
          }
          return 0;
        })(),
        hellscapeTurns: 0,
        selfBuffs: (() => {
          const buffs: relics.Effect[] = [];
          // 亡国の悲哀を詠う詩人
          return buffs;
        })(),
        autoSkillCooldown: charData.id === 'luocha' ? 2 : 0,
        selfBuffs: [] as relics.Effect[],
        rotationIndex: 0,
        turnCount: 0,
        shield: {
          value: 0,
          sourceActorIndex: -1,
          maxShieldValue: 0,
        },
      };
    }).filter(actor => actor !== null);

    const partyActors: SimulationActor[] = initialPartyActors.filter((actor): actor is SimulationActor => actor !== null);

    // 戦闘開始時の遺物効果を適用
    partyActors.forEach(actor => {
      if (!actor) return;
      const slot = partySlots[actor.index];
      if (!slot) return;

      // 亡国の悲哀を詠う詩人 4セット
      const poetSet = slot.relicSets.find(s => s.id === 'poet_of_a_lost_nation' && s.count >= 4);
      if (poetSet) {
        const critRateBonus = actor.currentStats.total.spd < 95 ? 32 : (actor.currentStats.total.spd < 110 ? 20 : 0);
        if (critRateBonus > 0) {
          actor.selfBuffs.push({ id: 'poet_4pc_crit_rate_buff_applied', source: '亡国の悲哀を詠う詩人', target: 'SELF', type: 'STAT_MOD', value: { '会心率': critRateBonus }, duration: Infinity });
        }
      }
    });

    // 我ら地炎
    partyActors.forEach(actor => {
      const slot = partySlots[actor.index];
      const lc = lightCones.find(lc => lc.id === slot.lightConeId);
      if (lc?.id === 'we_are_the_wildfire') {
        const effect = lc.effects[slot.lightConeRank - 1].effects?.[0];
        if (effect) {
          simulationState.partyBuffs.push({ ...effect, sourceActorIndex: actor.index });
        }
        const healRatioMatch = lc.effects[slot.lightConeRank - 1].description.match(/失ったHPの(\d+)%/);
        const healRatio = healRatioMatch ? parseInt(healRatioMatch[1], 10) / 100 : 0.3;
        partyActors.forEach(ally => {
          const lostHp = ally.stats.total.hp - ally.currentHp;
          if (lostHp > 0) {
            const healAmount = lostHp * healRatio;
            applyHeal(actor, ally, healAmount, '我ら地炎', partyActors);
          }
        });
      }
    });

    const summonDragonSpirit = (dhthActor: SimulationActor) => {
      if (!partyActors.some(p => p.data.id === 'dragon_spirit_dhth')) {
        const spiritData = characters.find(c => c.id === dhthActor.data.summonedSpiritId);
        if (spiritData && spiritData.isUntargetableSpirit) {
          const spiritIndex = partyActors.length;
          const spiritStats = {
            base: { hp: 0, atk: 0, def: 0, spd: spiritData.baseSpd },
            total: { hp: 0, atk: 0, def: 0, spd: spiritData.baseSpd, critRate: 5, critDmg: 50, effectRes: 0, breakEffect: 0 },
          };
          const spiritActor: SimulationActor = {
            index: spiritIndex,
            name: spiritData.name,
            data: spiritData,
            stats: spiritStats,
            actionValue: 0,
            baseAV: 10000 / spiritData.baseSpd,
            currentStats: JSON.parse(JSON.stringify(spiritStats)),
            currentEp: 0,
            currentHp: 1, // Not 0 to avoid being considered 'down'
            isDown: false,
            charge: 0,
            lostHp: 0,
            hellscapeTurns: 0,
            autoSkillCooldown: 0,
            selfBuffs: [],
            rotationIndex: 0,
            turnCount: 0,
            summonerIndex: simulationState.comradeState.targetIndex,
            shield: {
              value: 0,
              sourceActorIndex: -1,
              maxShieldValue: 0,
            },
          };
          partyActors.push(spiritActor);
          allActors.push(spiritActor); // allActorsにも追加
          actionLog.push({ name: dhthActor.name, currentTime: currentTime, action: '龍霊召喚 (天賦)', sp: currentSp, activeEffects: [] });
        }
      }
    };

    // 敵アクターの作成
    const enemyBaseAV = 10000 / enemySpeed;
    const enemyActor: SimulationActor = {
      index: -1, name: '敵', data: { actions: { basic: { name: '攻撃', isAttack: true, toughnessDamage: { main: 10 } } } }, stats: { total: { spd: enemySpeed } }, actionValue: 0, baseAV: enemyBaseAV, currentStats: { total: { spd: enemySpeed } }, currentHp: Infinity, isDown: false, shield: { value: 0, sourceActorIndex: -1, maxShieldValue: 0 }, currentEp: 0, charge: 0, lostHp: 0, hellscapeTurns: 0, autoSkillCooldown: 0, selfBuffs: [], rotationIndex: 0, turnCount: 0,
    };
    // 味方と敵を結合した全アクターリスト (後から召喚物を追加するためletで宣言)
    let allActors = [...partyActors, enemyActor];

    // 回復記録を初期化
    partyActors.forEach(actor => {
      if (actor) {
        damageDealtByCharacter[actor.index] = 0;
        healingDoneByCharacter[actor.index] = 0;
        healingReceivedByCharacter[actor.index] = 0;
        shieldGrantedByCharacter[actor.index] = 0;
      }
    });

    // アーチャーの最大SP天賦をチェック
    if (partyActors.some(p => p?.data.id === 'archer')) {
      maxSp = 7;
    }

    // --- 戦闘開始時の秘技を処理 (currentTime = 0) ---
    partyActors.forEach(actor => {
      if (!actor) return;
      const slot = partySlots[actor.index];
      if (!slot) return; // 召喚物など、partySlotsに対応するスロットがない場合はスキップ
      if (slot.useTechnique && actor.data.technique) {
        const technique = actor.data.technique;
        let damage = 0;

        if (technique.damageScaling && technique.damageScaling.main.length > 0) {
          damage = calculateActionDamage(actor, 'technique', 0, simulationState.partyBuffs, actor.selfBuffs, simulationState.enemyDebuffs);
          totalDamage += damage;
          damageDealtByCharacter[actor.index] += damage;
        }actionLog.push({ name: actor.name, currentTime: 0, action: '秘技', damageDealt: damage > 0 ? damage : undefined, sp: currentSp, activeEffects: [], charge: actor.charge, hp: actor.currentHp, maxHp: actor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });

        // 特定の秘技効果を処理
        if (actor.data.id === 'archer') {
          actor.charge = Math.min(4, actor.charge + 1);
          // 同じアクションのログを更新してチャージの変更を表示
          actionLog[actionLog.length - 1].charge = actor.charge;
        }
        if (actor.data.id === 'toribii') {
          technique.effects?.forEach(effect => {
            if (effect.target === 'ALLIES') {
              // バフが既に存在するか確認し、存在する場合は持続時間を更新、そうでなければ追加します。
              const existingBuffIndex = simulationState.partyBuffs.findIndex(b => b.id === effect.id);
              if (existingBuffIndex !== -1) {
                simulationState.partyBuffs[existingBuffIndex].duration = effect.duration;
              } else {
                // 秘技による「神の啓示」
                simulationState.partyBuffs.push({ ...effect, sourceActorIndex: actor.index });
              }
            }
          });
        }
        if (actor.data.id === 'hanya') {
          // 寒鴉の秘技の場合、ランダムな敵に「承負」を付与します（現時点では敵0）
          simulationState.burdenState = {
            targetIndex: 0,
            hitCount: 0,
            spRecoveryCount: 0,
            sourceActorIndex: actor.index,
          };
        }
        if (actor.data.id === 'blade') {
          actor.lostHp = Math.min(actor.currentStats.total.hp - 1, actor.lostHp + actor.currentStats.total.hp * 0.20);
          actor.currentHp -= actor.currentStats.total.hp * 0.20;
        }
        if (actor.data.id === 'luocha') {
          // 羅刹の秘技は結界を開始します
          simulationState.luochaField = {
            active: true,
            duration: 2,
            sourceActorIndex: actor.index,
          };
          actionLog.push({ name: actor.name, currentTime: 0, action: '結界展開 (秘技)', sp: currentSp, activeEffects: [], charge: actor.charge, hp: actor.currentHp, maxHp: actor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
        }
        if (actor.data.id === 'dan_heng_teng_huang') {
          const comradeTarget = slot.comradeTargetIndex !== -1 ? partyActors.find(p => p.index === slot.comradeTargetIndex) : actor;
          if (comradeTarget) {
            simulationState.comradeState = {
              targetIndex: comradeTarget.index,
              sourceActorIndex: actor.index,
            };
            // 「同袍」になったので龍霊を召喚
            summonDragonSpirit(actor);
          }
          // TODO: Add auto-skill logic at start of battle
          actionLog.push({ name: actor.name, currentTime: 0, action: `同袍付与 (秘技) -> ${partyActors.find(p => p.index === comradeTarget)?.name}`, sp: currentSp, activeEffects: [], charge: actor.charge, hp: actor.currentHp, maxHp: actor.currentStats.total.hp });
        }
      }
    });

    // ルアン・メェイのパッシブ効果
    const ruanMeiActor = partyActors.find(p => p?.data.id === 'ruan_mei');
    if (ruanMeiActor) {
      // 天賦：速度バフ
      const speedBuff = ruanMeiActor.data.talent?.effects?.[0];
      if (speedBuff) {
        partyActors.forEach(ally => {
          if (ally.index !== ruanMeiActor.index) ally.selfBuffs.push({ ...speedBuff });
        });
      }
      // 軌跡：呼吸の中
      const breakEffectBuff = ruanMeiActor.data.traces.talents.find((t: any) => t.id === 'ruan_mei_trace_1')?.effects?.[0];
      if (breakEffectBuff) simulationState.partyBuffs.push({ ...breakEffectBuff, duration: Infinity, sourceActorIndex: ruanMeiActor.index });
    }

    // タイムライン変数
    let currentTime = 0; // 全体のタイムラインを追跡
    const simulationEndTime = 150 + (simulationRounds - 1) * 100;

    const rotation = rotationString.split(',').map(s => s.trim().toUpperCase());
    let nextRoundBoundary = 150;

    const checkAndUseLuochaAutoSkill = (currentTimeValue: number) => {
      const luochaActor = partyActors.find(p => p?.data.id === 'luocha');
      if (luochaActor && luochaActor.autoSkillCooldown === 0) {
        // 簡略化されたチェック：味方のHPが50%以下になったと仮定します。
        // より複雑なシミュレーションでは、各キャラクターのHPを追跡します。
        // 現時点では、利用可能であればトリガーされると仮定します。
        // TODO: これは特定の味方をターゲットして回復する必要があります。現時点では、合計回復量のみをログに記録します。
        const skillScaling = luochaActor.data.actions?.skill?.healScaling?.main[0];
        const healAmount = calculateHealAmount(luochaActor, skillScaling);
        applyHeal(luochaActor, luochaActor, healAmount, '自動スキル', partyActors); // 簡略化：現時点では自己回復
        actionLog.push({ name: luochaActor.name, currentTime: currentTimeValue, action: 'デバフ解除 (滴水蘇生)', damage: null, sp: currentSp, activeEffects: [], charge: luochaActor.charge, hp: luochaActor.currentHp });

        // Gain stack only if field is not active
        if (!simulationState.luochaField.active) {
          luochaActor.charge = Math.min(2, luochaActor.charge + 1);
        }
        luochaActor.autoSkillCooldown = 2; // 2ターンのクールダウンを設定

        // Check for field creation
      }
    };

    const triggerIcarunTalentHeal = (damagedActor: SimulationActor) => {
      const icarunActor = partyActors.find(p => p?.data.isTargetableSpirit && !p.isDown);
      const xianciActor = partyActors.find(p => p?.data.id === 'xianci');
      if (!icarunActor || !xianciActor || damagedActor.data.isTargetableSpirit || damagedActor.isDown) return;

      // イカルンがHPを消費
      const hpCost = icarunActor.currentStats.total.hp * 0.04;
      icarunActor.currentHp -= hpCost;
      if (icarunActor.currentHp <= 0) {
        icarunActor.currentHp = 0;
        icarunActor.isDown = true;
      }

      // 精霊天賦の回復量を計算
      const talentHealScaling = xianciActor.data.actions?.spirit_talent?.healScaling?.main[0];
      if (talentHealScaling) {
        const healAmount = calculateHealAmount(xianciActor, talentHealScaling);
        applyHeal(xianciActor, damagedActor, healAmount, '精霊天賦', partyActors);

        // 精霊天賦による全体回復効果
        partyActors.forEach(ally => {
          if (ally && !ally.data.isTargetableSpirit && !ally.data.isUntargetableSpirit && !ally.isDown) {
            // 元の回復とは別に追加で回復
            const additionalHealAmount = calculateHealAmount(xianciActor, talentHealScaling);
            applyHeal(xianciActor, ally, additionalHealAmount, '精霊天賦 (全体)', partyActors);
          }
        })
      }

      actionLog.push({ name: icarunActor.name, currentTime: currentTime, action: `HP消費 (精霊天賦)`, damageDealt: hpCost, sp: currentSp, activeEffects: [], charge: icarunActor.charge, hp: icarunActor.currentHp, maxHp: icarunActor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });

      if (icarunActor.isDown) {
        actionLog.push({ name: icarunActor.name, currentTime: currentTime, action: `戦闘不能`, sp: currentSp, activeEffects: [], charge: icarunActor.charge, hp: icarunActor.currentHp, maxHp: icarunActor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
      }
    };

    const calculateSkillDotDamage = (sourceActor: SimulationActor, debuff: relics.Effect, enemyDebuffs: relics.Effect[]) => {
      if (!debuff.scaling || debuff.scaling.length === 0) return 0;

      const charLevel = 80;
      const { atk } = sourceActor.currentStats.total;

      // 1. ダメージ基礎値
      const baseDotDamage = atk * (debuff.scaling[0].multiplier / 100);

      // 2. 各種係数の計算
      let totalDmgBoost = 0;
      const allSourceEffects = [...sourceActor.selfBuffs, ...simulationState.partyBuffs];
      allSourceEffects.forEach(effect => {
        if (effect.type === 'DMG_BOOST' && typeof effect.value === 'object') {
          totalDmgBoost += (effect.value['ALL'] ?? 0);
        }
      });
      const dmgBoostMultiplier = 1 + totalDmgBoost / 100;

      const defMultiplier = (charLevel + 20) / ((enemyLevel + 20) * (1 - 0) + (charLevel + 20));
      const resMultiplier = 1.0; // 属性耐性は別途考慮
      let totalDmgTakenIncrease = 0;
      enemyDebuffs.forEach(effect => {
        if (effect.type === 'DMG_TAKEN_INCREASE') totalDmgTakenIncrease += effect.value as number;
      });
      const dmgTakenMultiplier = 1.0 + (totalDmgTakenIncrease / 100);

      return baseDotDamage * dmgBoostMultiplier * defMultiplier * resMultiplier * dmgTakenMultiplier;
    };

    const calculateDotDamage = (sourceActor: SimulationActor, debuff: relics.Effect, enemyDebuffs: relics.Effect[]) => {
      const charLevel = 80;
      const { breakEffect } = sourceActor.currentStats.total;

      // 1. 持続/付加ダメージ基礎値の計算
      const levelMultiplier = 3767.55; // Lv80のキャラの固有値
      const toughnessMultiplier = 0.5 + simulationState.enemyState.maxToughness / 120;
      let baseDotDamage = 0;

      if (debuff.id.includes('裂創')) {
        const enemyHpMultiplier = simulationState.enemyState.type === 'elite' ? 0.07 : 0.16;
        const cap = 2 * levelMultiplier * toughnessMultiplier;
        baseDotDamage = Math.min(simulationState.enemyState.maxHp * enemyHpMultiplier, cap);
      } else if (debuff.id.includes('もつれ')) {
        baseDotDamage = 0.6 * (debuff.currentStacks ?? 1) * levelMultiplier * toughnessMultiplier;
      } else {
        const baseMultiplier = debuff.id.includes('燃焼') ? 1 : (debuff.id.includes('感電') ? 2 : (debuff.id.includes('風化') ? (debuff.currentStacks ?? 1) : (debuff.id.includes('凍結') ? 1 : 0)));
        baseDotDamage = baseMultiplier * levelMultiplier;
      }

      // 2. 各種係数の計算
      const breakEffectMultiplier = 1 + (breakEffect / 100);
      const defMultiplier = (charLevel + 20) / ((enemyLevel + 20) * (1 - 0) + (charLevel + 20));
      const resMultiplier = 1.0; // 属性耐性は別途考慮
      let totalDmgTakenIncrease = 0;
      enemyDebuffs.forEach(effect => {
        if (effect.type === 'DMG_TAKEN_INCREASE') totalDmgTakenIncrease += effect.value as number;
      });
      const dmgTakenMultiplier = 1.0 + (totalDmgTakenIncrease / 100);

      return baseDotDamage * breakEffectMultiplier * defMultiplier * resMultiplier * dmgTakenMultiplier;
    };

    const calculateBreakDamage = (actor: SimulationActor, enemyDebuffs: relics.Effect[]) => {
      const charLevel = 80;
      const { breakEffect } = actor.currentStats.total;

      // 1. 弱点撃破ダメージ基礎値の計算
      const levelMultiplier = 3767.55; // Lv80のキャラの固有値
      const toughnessMultiplier = 0.5 + simulationState.enemyState.maxToughness / 120;
      let baseDamageMultiplier = 0;
      switch (actor.data.combatType) {
        case '物理':
        case '炎':
          baseDamageMultiplier = 2;
          break;
        case '風':
          baseDamageMultiplier = 1.5;
          break;
        case '氷':
        case '雷':
          baseDamageMultiplier = 1;
          break;
        case '量子':
        case '虚数':
          baseDamageMultiplier = 0.5;
          break;
      }
      const baseBreakDamage = baseDamageMultiplier * levelMultiplier * toughnessMultiplier;

      // 2. 各種係数の計算
      const breakEffectMultiplier = 1 + (breakEffect / 100);
      const defMultiplier = (charLevel + 20) / ((enemyLevel + 20) * (1 - 0) + (charLevel + 20));
      const resMultiplier = 1.0; // 弱点属性で攻撃しているので耐性は0と仮定
      let totalDmgTakenIncrease = 0;
      enemyDebuffs.forEach(effect => {
        if (effect.type === 'DMG_TAKEN_INCREASE') totalDmgTakenIncrease += effect.value as number;
      });
      const dmgTakenMultiplier = 1.0 + (totalDmgTakenIncrease / 100);
      const breakMultiplier = enemyCount > 1 ? 0.9 : 1; // 簡易的な撃破係数

      return baseBreakDamage * breakEffectMultiplier * defMultiplier * resMultiplier * dmgTakenMultiplier * breakMultiplier;
    };

    const executeAction = (actor: SimulationActor, actionKey: ActionTypeKey, currentParty: SimulationActor[], isFromTurn: boolean = false) => {
      const actionData = actor.data.actions?.[actionKey];
      const hpBefore = currentParty.map(p => p.currentHp);
      if (!actionData) return { wasAttack: false, hpBefore, hpAfter: hpBefore, updatedParty: currentParty };

      let wasAttack = actionData.isAttack ?? false;

      // SP消費/回復 (ターン内の行動のみ)
      if (isFromTurn) {
        if (actionKey === 'basic') {
          currentSp = Math.min(maxSp, currentSp + 1);
          checkAndApplyGuardianBuff(currentSp);
        } else if (actionKey === 'skill') {
          currentSp--;
        }
      }

      // HP消費
      if (actor.data.id === 'blade') {
        if (actionKey === 'skill') {
          const hpCost = actor.currentStats.total.hp * 0.30;
          actor.lostHp += hpCost;
          actor.currentHp -= hpCost;
        } else if (actionKey === 'enhanced_basic') {
          const hpCost = actor.currentStats.total.hp * 0.10;
          actor.lostHp += hpCost;
          actor.currentHp -= hpCost;
        }
      }

      // ダメージ/回復計算とログ記録
      const activeEffects = [...actor.selfBuffs, ...simulationState.partyBuffs];
      let damage = 0;
      let healing = 0;

      if (actionData.isAttack) {
        damage = calculateActionDamage(actor, actionKey, actor.lostHp, simulationState.partyBuffs, actor.selfBuffs, simulationState.enemyDebuffs);
        totalDamage += damage;
        damageDealtByCharacter[actor.index] = (damageDealtByCharacter[actor.index] ?? 0) + damage;

        // とある星神の殞落を記す
        const aeonAtkBuff = actor.selfBuffs.find(b => b.id.startsWith('aeon_') && b.id.includes('_atk'));
        if (aeonAtkBuff) {
          addOrRefreshBuff(actor, { ...aeonAtkBuff, sourceActorIndex: actor.index });
        }
        // 絶え間ない演算
        const computationAtkBuff = actor.selfBuffs.find(b => b.id.startsWith('computation_') && b.id.includes('_atk_stack'));
        if (computationAtkBuff) {
          // 命中数に応じてスタック。ここでは簡易的にenemyCountをヒット数とする
          for (let i = 0; i < enemyCount; i++) {
            addOrRefreshBuff(actor, { ...computationAtkBuff, sourceActorIndex: actor.index });
          }
          if (enemyCount >= 3) {
            const computationSpdBuff = actor.selfBuffs.find(b => b.id.startsWith('computation_') && b.id.includes('_spd'));
            if (computationSpdBuff) addOrRefreshBuff(actor, { ...computationSpdBuff, sourceActorIndex: actor.index });
          }
        }
      }

      // 龍霊の行動
      if (actor.data.isUntargetableSpirit && actor.data.id === 'dragon_spirit_dhth') {
        const dhthActor = partyActors.find(p => p.index === actor.summonerIndex);
        const dhthOriginalActor = partyActors.find(p => p.data.id === 'dan_heng_teng_huang');
        if (dhthActor && dhthOriginalActor) {
          // 1. デバフ解除
          partyActors.forEach(ally => {
            if (!ally.isDown && !ally.data.isUntargetableSpirit) {
              // ここでデバフを解除するロジックを実装（例：selfBuffsからデバフ効果を1つ削除）
              // actionLog.push({ ... });
            }
          });

          // 2. バリア付与
          const shieldScaling = actor.data.actions.spirit_skill.healScaling.main[0];
          // 龍霊のバリアは召喚者（同袍）の攻撃力を参照するが、バリア上限は丹恒・騰荒のスキルに依存する
          const baseShield = dhthActor.currentStats.total.atk * (shieldScaling.multiplier / 100) + (shieldScaling.flat ?? 0); // バリア量は同袍の攻撃力に依存
          let maxShield = Infinity;
          if (dhthOriginalActor?.data.actions.skill.healScaling) {
            const dhthSkillShield = dhthOriginalActor.currentStats.total.atk * (dhthOriginalActor.data.actions.skill.healScaling.main[0].multiplier / 100) + (dhthOriginalActor.data.actions.skill.healScaling.main[0].flat ?? 0);
            maxShield = dhthSkillShield * 3;
          }

          partyActors.forEach(ally => {
            if (!ally.isDown && !ally.data.isUntargetableSpirit) {
              applyShield(dhthOriginalActor, ally, baseShield, '龍霊の行動', maxShield); // バリアのソースは丹恒・騰荒本人
            }
          });

          // 屹立の追加バリア
          const standingTallEffect = dhthOriginalActor.data.traces.talents.find((t: any) => t.id === 'dhth-trace-standing-tall')?.effects?.[0];
          if (standingTallEffect && standingTallEffect.type === 'ADDITIONAL_SHIELD' && standingTallEffect.scaling) {
            // バリア耐久値が最も低い味方を探す
            const alliesForShield = partyActors.filter(p => !p.isDown && !p.data.isUntargetableSpirit);
            if (alliesForShield.length > 0) {
              const lowestShieldAlly = alliesForShield.reduce((lowest, current) => {
                return (lowest.shield.value ?? 0) < (current.shield.value ?? 0) ? lowest : current;
              });

              const additionalShieldScaling = standingTallEffect.scaling[0];
              const additionalShield = dhthOriginalActor.currentStats.total.atk * (additionalShieldScaling.multiplier / 100) + (additionalShieldScaling.flat ?? 0); // 屹立のバリア量も丹恒・騰荒の攻撃力に依存
              applyShield(dhthOriginalActor, lowestShieldAlly, additionalShield, '屹立', maxShield); // バリアのソースは丹恒・騰荒本人
            }
          }
        }
      }

      // 靭性ダメージ計算
      if (actionData.isAttack && actionData.toughnessDamage && simulationState.enemyState.toughness > 0) {
        let breakEfficiencyBonus = 0;
        const allEffects = [...actor.selfBuffs, ...simulationState.partyBuffs];
        allEffects.forEach(effect => {
          if (effect.type === 'BREAK_EFFICIENCY_BOOST') {
            if (typeof effect.value === 'number') {
              breakEfficiencyBonus += effect.value;
            }
          }
        });

        const toughnessMultiplier = 1 + breakEfficiencyBonus / 100;

        const toughnessDmg = actionData.toughnessDamage.main * toughnessMultiplier;
        simulationState.enemyState.toughness -= toughnessDmg;

        if (actionData.targetType === 'blast' && actionData.toughnessDamage.adjacent) {
          const adjacentToughnessDmg = actionData.toughnessDamage.adjacent * toughnessMultiplier;
          const adjacentCount = Math.min(2, Math.max(0, enemyCount - 1));
          simulationState.enemyState.toughness -= adjacentToughnessDmg * adjacentCount;
        } else if (actionData.targetType === 'aoe') {
          const adjacentToughnessDmg = actionData.toughnessDamage.main * toughnessMultiplier;
          const adjacentCount = enemyCount - 1;
          simulationState.enemyState.toughness -= adjacentToughnessDmg * adjacentCount;
        }
        simulationState.enemyState.toughness = Math.max(0, simulationState.enemyState.toughness);

        // 弱点撃破の判定
        if (simulationState.enemyState.toughness <= 0 && !simulationState.enemyState.isBroken) {
          simulationState.enemyState.isBroken = true;
          const breakDamage = calculateBreakDamage(actor, simulationState.enemyDebuffs);
          totalDamage += breakDamage;
          damageDealtByCharacter[actor.index] = (damageDealtByCharacter[actor.index] ?? 0) + breakDamage;

          // とある星神の殞落を記す
          const aeonDmgBuff = actor.selfBuffs.find(b => b.id.startsWith('aeon_') && b.id.includes('_dmg'));
          if (aeonDmgBuff) {
            addOrRefreshBuff(actor, { ...aeonDmgBuff, sourceActorIndex: actor.index });
          }

          actionLog.push({ name: actor.name, currentTime: currentTime, action: '弱点撃破', damageDealt: breakDamage, sp: currentSp, activeEffects: [], charge: actor.charge, hp: actor.currentHp, maxHp: actor.currentStats.total.hp, toughness: 0, maxToughness: simulationState.enemyState.maxToughness });

          // 流星の跡を追う怪盗 4セット
          const thiefSet = partySlots[actor.index]?.relicSets.find(s => s.id === 'thief_of_shooting_meteor' && s.count >= 4);
          if (thiefSet) {
            const epGain = 3 * (1 + (actor.currentStats.total.epRegenRate / 100));
            actor.currentEp = Math.min(actor.data.maxEp, actor.currentEp + epGain);
            actionLog.push({ name: actor.name, currentTime: currentTime, action: 'EP回復 (怪盗4)', sp: currentSp, activeEffects: [], ep: actor.currentEp });
          }

          // 属性に応じたデバフを付与
          let debuffType: string = '';
          let debuffDuration: number = 2;
          let debuffStacks: number = 1;
          const enemyActorForDelay = allActors.find(a => a.index === -1);

          switch (actor.data.combatType) {
            case '物理': debuffType = '裂創'; break;
            case '炎': debuffType = '燃焼'; break;
            case '雷': debuffType = '感電'; break;
            case '風':
              debuffType = '風化';
              debuffStacks = simulationState.enemyState.type === 'elite' ? 3 : 1;
              break;
            case '氷':
              debuffType = '凍結'; debuffDuration = 2;
              break;
            case '量子':
              debuffType = 'もつれ';
              debuffDuration = 1;
              // 弱点撃破時に行動遅延を適用
              const motureDelay = 0.20 * (1 + (actor.currentStats.total.breakEffect / 100));
              if (enemyActorForDelay) enemyActorForDelay.actionValue -= 10000 * motureDelay;
              break;
            case '虚数':
              debuffType = '禁錮';
              debuffDuration = 1;
              // 弱点撃破時に行動遅延と速度デバフを適用
              const kinkoDelay = 0.30 * (1 + (actor.currentStats.total.breakEffect / 100));
              if (enemyActorForDelay) enemyActorForDelay.actionValue -= 10000 * kinkoDelay;
              // 速度-10%はデバフとして付与し、updateAllActorStatsで処理するのが望ましい
              break;
          }

          if (debuffType) {
            simulationState.enemyDebuffs.push({
              id: `break_dot_${debuffType}`,
              source: '弱点撃破',
              target: 'ENEMIES',
              type: 'STAT_MOD', // Marker, actual effect handled separately
              value: {},
              duration: debuffDuration,
              sourceActorIndex: actor.index,
              currentStacks: debuffStacks,
              maxStacks: 5,
            });
          }

          // ルアン・メェイの天賦による追加弱点撃破ダメージ
          const ruanMeiActor = currentParty.find(p => p?.data.id === 'ruan_mei' && !p.isDown);
          if (ruanMeiActor) {
            const ruanMeiBreakDamage = calculateBreakDamage(ruanMeiActor, simulationState.enemyDebuffs);
            const talentDamage = ruanMeiBreakDamage * 1.20;
            totalDamage += talentDamage;
            damageDealtByCharacter[ruanMeiActor.index] = (damageDealtByCharacter[ruanMeiActor.index] ?? 0) + talentDamage;
            actionLog.push({ name: ruanMeiActor.name, currentTime: currentTime, action: '天賦 (弱点撃破ダメージ)', damageDealt: talentDamage, sp: currentSp, activeEffects: [], charge: ruanMeiActor.charge, hp: ruanMeiActor.currentHp, maxHp: ruanMeiActor.currentStats.total.hp, toughness: 0, maxToughness: simulationState.enemyState.maxToughness });
          }
        }
      }

      if (actionData.healScaling) {
        const healScaling = actionData.healScaling.main[0];
        if (healScaling && actor.data.id !== 'dan_heng_teng_huang' && !actor.data.isUntargetableSpirit) { // 丹恒・騰荒と龍霊はバリアなので別途処理
          healing = calculateHealAmount(actor, healScaling);

          // 烈陽と雷鳴の武神 4セット (自分と召喚物以外を回復した場合)
          const warGodSet = partySlots[actor.index]?.relicSets.find(s => s.id === 'war_god_of_sun_and_thunder' && s.count >= 4);
          const healedOther = currentParty.some(ally => ally.index !== actor.index && !ally.isSummonedSpirit);
          if (warGodSet && healedOther) {
            const ciyuBuff = relics.RELIC_SETS.find(s => s.id === 'war_god_of_sun_and_thunder')?.effects[4]?.effects?.find(e => e.id === 'war_god_4pc_ciyu_trigger');
            if (ciyuBuff) addOrRefreshBuff(actor, { ...ciyuBuff, sourceActorIndex: actor.index });
          }
          // 実際のHP回復処理
          if (actionData.targetType === 'aoe') { // 全体回復
            currentParty.forEach(ally => { // Targetable spirits can be healed, untargetable cannot.
              if (ally && !ally.data.isUntargetableSpirit && !ally.isDown) {
                applyHeal(actor, ally, healing, actionData.name, partyActors);
              }
            });
          } else if (actor.data.id === 'xianci' && actionKey === 'skill') { // ヒアンシーのスキルはイカルン以外
            currentParty.forEach(ally => {
              if (ally && !ally.data.isUntargetableSpirit && !ally.isDown) {
                applyHeal(actor, ally, healing, actionData.name, partyActors);
              }
            });
          } else { // 単体回復
            applyHeal(actor, actor, healing, actionData.name, partyActors);
          }
          healing = 0; // ログの重複を防ぐためにリセット
        }
      }

      // 丹恒・騰荒のバリア処理
      if (actor.data.id === 'dan_heng_teng_huang' && actionData.healScaling) {
        const shieldScaling = actionData.healScaling.main[0];
        const baseShield = actor.currentStats.total.atk * (shieldScaling.multiplier / 100) + (shieldScaling.flat ?? 0);
        const maxShield = (actor.currentStats.total.atk * (actor.data.actions.skill.healScaling.main[0].multiplier / 100) + (actor.data.actions.skill.healScaling.main[0].flat ?? 0)) * 3;
        partyActors.forEach(ally => {
          if (!ally.isDown && !ally.data.isUntargetableSpirit) {
            applyShield(actor, ally, baseShield, actionData.name, maxShield);
          }
        });
      }

      // EP回復
      if (actionKey === 'ultimate') {
        actor.currentEp = actionData.epRecovery ?? 5;
        // 昼夜の狭間を翔ける鷹 4セット
        const eagleSet = partySlots[actor.index]?.relicSets.find(s => s.id === 'eagle_of_twilight_line' && s.count >= 4);
        if (eagleSet) {
          actor.actionValue += 2500;
          actionLog.push({ name: actor.name, currentTime: currentTime, action: '行動順UP (鷹4)', sp: currentSp, activeEffects: [] });
        }
        // ダンス！ダンス！ダンス！
        const dddEffect = actor.selfBuffs.find(b => b.id === 'action_forward_on_ultimate');
        if (dddEffect && typeof dddEffect.value === 'number') {
          partyActors.forEach(ally => {
            ally.actionValue += dddEffect.value * 100;
          });
          actionLog.push({ name: actor.name, currentTime: currentTime, action: '行動順UP (ダンス！)', sp: currentSp, activeEffects: [] });
        }
      } else {
        const epGain = (actionData.epRecovery ?? 0) * (1 + (actor.currentStats.total.epRegenRate / 100));
        actor.currentEp += epGain;
      }

      // ログ記録
      // バリア付与は回復量に加算しない
      if (healing > 0) {
        totalHealing += healing;
      }
      actionLog.push({
        name: actor.name, currentTime: currentTime, action: actionData.name, damageDealt: damage > 0 ? damage : undefined, healingDone: healing > 0 ? healing : undefined,
        sp: currentSp, activeEffects: [...actor.selfBuffs, ...simulationState.partyBuffs].map(e => {
          const stackInfo = e.currentStacks && e.currentStacks > 1 ? `(${e.currentStacks}層)` : '';
          const duration = e.duration;
          let durationInfo = '';
          if (duration === Infinity) {
            durationInfo = '(永続)';
          } else if (typeof duration === 'number') {
            durationInfo = `(残${duration}T)`;
          }
          return `${e.source}${stackInfo} ${durationInfo}`.trim();
        }), charge: actor.charge, ep: actor.currentEp, hp: actor.currentHp, maxHp: actor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness, shield: actor.shield.value
      });

      // 学者4セット: 必殺技後に次のスキルバフ
      if (actionKey === 'ultimate') {
        const scholarSet = partySlots[actor.index]?.relicSets.find(s => s.id === 'scholar_in_the_sea_of_knowledge' && s.count >= 4);
        const scholarBuff = relics.RELIC_SETS.find(s => s.id === 'scholar_in_the_sea_of_knowledge')?.effects[4]?.effects?.find(e => e.id === 'scholar_4pc_next_skill_buff');
        if (scholarSet && scholarBuff) addOrRefreshBuff(actor, { ...scholarBuff, sourceActorIndex: actor.index });

        // 孤独の癒し
        const solitaryDotDmgBuff = actor.selfBuffs.find(b => b.id.startsWith('solitary_') && b.id.includes('_dot_dmg'));
        if (solitaryDotDmgBuff) {
          addOrRefreshBuff(actor, { ...solitaryDotDmgBuff, sourceActorIndex: actor.index });
        }
      }

      // 特殊効果の処理
      if (actor.data.id === 'blade' && actionKey === 'skill') actor.hellscapeTurns = 3;
      if (actor.data.id === 'luocha' && (actionKey === 'skill' || actionKey === 'ultimate') && !simulationState.luochaField.active) actor.charge = Math.min(2, actor.charge + 1);
      // ヒアンシーの特殊効果処理
      if (actor.data.id === 'xianci') {
        // 1. イカルン召喚ロジック (スキルまたは必殺技で発動)
        if ((actionKey === 'skill' || actionKey === 'ultimate') && !simulationState.icarunSummoned) {
          const icarunData = characters.find(c => c.id === 'icarun');
          if (icarunData) {
            const icarunIndex = partyActors.length;
            const tempActor = { index: icarunIndex, data: icarunData, summonerIndex: actor.index } as SimulationActor;
            const icarunStats = calculateFinalStats(icarunData, null, initialRelicStates(), [], [], null, partySlots, tempActor);
            if (icarunStats) {
              const newIcarunActor: SimulationActor = {
                index: icarunIndex,
                name: icarunData.name,
                data: icarunData,
                stats: icarunStats,
                actionValue: 0, // 行動可能にする
                baseAV: Infinity, // イカルンのAVはターン順には影響しないが、AV計算には必要
                currentStats: JSON.parse(JSON.stringify(icarunStats)),
                currentEp: 0,
                currentHp: icarunStats.total.hp,
                isDown: false,
                charge: 0,
                lostHp: 0,
                hellscapeTurns: 0,
                autoSkillCooldown: 0,
                selfBuffs: [],
                rotationIndex: 0,
                turnCount: 0,
                summonerIndex: actor.index,
                shield: { value: 0, sourceActorIndex: -1, maxShieldValue: 0 },
                accumulatedHealing: 0,
              };
              partyActors.push(newIcarunActor);
              allActors.push(newIcarunActor); // allActorsにも追加
              actionLog.push({ name: actor.name, currentTime: currentTime, action: 'イカルン召喚', sp: currentSp, activeEffects: [] });
              simulationState.icarunSummoned = true;
            }
          }
        }

        // 2. 「雨上がり」状態開始ロジック (必殺技で発動)
        if (actionKey === 'ultimate') {
          simulationState.xianciRainfall = { active: true, duration: 3, sourceActorIndex: actor.index };
          const hpBuffEffect = actor.data.actions?.ultimate?.effects?.find(e => e.id === 'xianci-ult-hp-buff');
          if (hpBuffEffect) {
            simulationState.partyBuffs.push({ ...hpBuffEffect, sourceActorIndex: actor.index });
          }
          actionLog.push({ name: actor.name, currentTime: currentTime, action: '雨上がり 状態開始', sp: currentSp, activeEffects: [], charge: actor.charge, hp: actor.currentHp, maxHp: actor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
        }

        // 3. 雨上がり中の精霊スキル発動トリガー (スキルまたは通常攻撃で発動)
        if (simulationState.xianciRainfall.active && (actionKey === 'skill' || actionKey === 'basic')) {
          const icarunActor = partyActors.find(p => p.data.isTargetableSpirit && !p.isDown);
          if (icarunActor) {
            console.log("icarun")
            executeAction(icarunActor, 'spirit_skill', partyActors, false);
          }
        }
      }
      if (actor.data.id === 'hanya' && actionKey === 'skill') {
        simulationState.burdenState = {
          targetIndex: 0, // 敵0をターゲットと仮定
          hitCount: 0,
          spRecoveryCount: 0,
          sourceActorIndex: actor.index,
        };
        // E2速度バフ
        if (partySlots[actor.index].eidolonLevel >= 2) {
          actor.selfBuffs.push({ id: 'hanya-e2-spd-boost', source: '星魂2', target: 'SELF', type: 'STAT_MOD', value: { '速度': 20 }, duration: 1 });
        }
      }
      if (actor.data.id === 'toribii' && actionKey === 'skill') {
        const skillEffect = actor.data.actions?.skill?.effects?.[0];
        if (skillEffect) {
          const existingBuff = simulationState.partyBuffs.find(b => b.id === skillEffect.id);
          if (existingBuff) existingBuff.duration = skillEffect.duration;
          else simulationState.partyBuffs.push({ ...skillEffect, sourceActorIndex: actor.index });
        }
      }
      if (actor.data.id === 'toribii' && actionKey === 'ultimate') {
        const ultEffect = actor.data.actions?.ultimate?.effects?.[0];
        simulationState.toribiiField = { active: true, duration: 2, sourceActorIndex: actor.index };
        simulationState.toribiiTalentUses = {}; // 天賦の発動回数をリセット
        if (ultEffect) {
          simulationState.enemyDebuffs.push({ ...ultEffect, sourceActorIndex: actor.index });
        }
      }
      if (actor.data.id === 'ruan_mei' && actionKey === 'skill') {
        const skillEffects = actor.data.actions?.skill?.effects;
        if (skillEffects) {
          skillEffects.forEach(effect => {
            simulationState.partyBuffs.push({ ...effect, sourceActorIndex: actor.index });
          });
        }
      }
      if (actor.data.id === 'ruan_mei' && actionKey === 'ultimate') {
        const durationBonus = partySlots[actor.index].eidolonLevel >= 6 ? 1 : 0;
        simulationState.ruanMeiField = { active: true, duration: 2 + durationBonus, sourceActorIndex: actor.index };
        const ultEffect = actor.data.actions?.ultimate?.effects?.find((e: any) => e.id === 'ruan_mei_ult_res_pen');
        if (ultEffect) {
          // 結界の持続時間とバフの持続時間を同期させる
          simulationState.partyBuffs.push({ ...ultEffect, duration: 2 + durationBonus, sourceActorIndex: actor.index });
          // メッセンジャー4セット効果
          const messengerSet = partySlots[actor.index]?.relicSets.find(s => s.id === 'messenger_traversing_hackerspace' && s.count >= 4);
          const messengerBuff = relics.RELIC_SETS.find(s => s.id === 'messenger_traversing_hackerspace')?.effects[4]?.effects?.[0];
          if (messengerSet && messengerBuff) {
            simulationState.partyBuffs.push({ ...messengerBuff, sourceActorIndex: actor.index });
          }
          actionLog.push({ name: actor.name, currentTime: currentTime, action: '結界展開 (残梅)', sp: currentSp, activeEffects: [], charge: actor.charge, hp: actor.currentHp, maxHp: actor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
        }
      }
      if (actor.data.id === 'hanya' && actionKey === 'ultimate') {
        const targetIndex = partySlots[actor.index].ultimateTargetIndex;
        if (targetIndex !== -1) {
          const targetActor = currentParty.find(p => p?.index === targetIndex);
          if (targetActor) {
            const ultEffects = actor.data.actions?.ultimate?.effects;
            const spdBuff = ultEffects?.find(e => e.id === 'hanya-ult-spd-boost');
            // 尽きぬ追憶
            const endlessDmgBuff = actor.selfBuffs.find(b => b.id.startsWith('endless_') && b.id.includes('_dmg'));
            if (endlessDmgBuff) {
              simulationState.partyBuffs.push({ ...endlessDmgBuff, sourceActorIndex: actor.index });
            }

            const atkBuff = ultEffects?.find(e => e.id === 'hanya-ult-atk-boost');
            const durationBonus = partySlots[actor.index].eidolonLevel >= 4 ? 1 : 0;

            if (spdBuff) {
              targetActor.selfBuffs.push({ ...spdBuff, duration: (spdBuff.duration ?? 2) + durationBonus, sourceActorIndex: actor.index });
            }
            if (atkBuff) targetActor.selfBuffs.push({ ...atkBuff, duration: (atkBuff.duration ?? 2) + durationBonus, sourceActorIndex: actor.index });
          }
        }
      }
      if (actor.data.id === 'archer' && actionKey === 'ultimate') {
        actor.charge = Math.min(4, actor.charge + 2);
      }
      if (actor.data.id === 'blade' && actionKey === 'ultimate') {
        actor.currentHp = actor.currentStats.total.hp * 0.5;
      }
      if (actor.data.id === 'dan_heng_teng_huang' && actionKey === 'ultimate') {
        simulationState.dragonSpiritState.isEnhanced = true;
        simulationState.dragonSpiritState.enhancedActionsLeft = 2; // 基本は2回
        // E2効果
        if (partySlots[actor.index].eidolonLevel >= 2) {
          simulationState.dragonSpiritState.enhancedActionsLeft += 2;
        }
      }
      if (actor.data.id === 'dan_heng_teng_huang' && actionKey === 'skill') {
        const comradeTargetIndex = partySlots[actor.index].comradeTargetIndex;
        if (comradeTargetIndex !== -1) {
          simulationState.comradeState = {
            targetIndex: comradeTargetIndex,
            sourceActorIndex: actor.index,
          };
          // 「同袍」になったので龍霊を召喚
          const dhthActor = partyActors.find(p => p.index === actor.index);
          if (dhthActor) summonDragonSpirit(dhthActor);
        }
      }

      // 何が真か
      if (actionKey === 'basic') {
        const whatIsRealLc = lightCones.find(lc => lc.id === 'what_is_real');
        const lcRank = partySlots[actor.index]?.lightConeRank ?? 1;
        if (whatIsRealLc && partySlots[actor.index]?.lightConeId === 'what_is_real') {
          const desc = whatIsRealLc.effects[lcRank - 1].description;
          const percentMatch = desc.match(/最大HP(\d+\.\d+)%/);
          const flatMatch = desc.match(/\+(\d+)/);
          const percent = percentMatch ? parseFloat(percentMatch[1]) : 2.0;
          const flat = flatMatch ? parseInt(flatMatch[1], 10) : 800;
          const healAmount = actor.stats.total.hp * (percent / 100) + flat;
          applyHeal(actor, actor, healAmount, '何が真か', partyActors);
        }
      }

      const hpAfter = currentParty.map(p => p.currentHp);
      return { wasAttack, hpBefore, hpAfter, updatedParty: currentParty };
    };
    const checkAndUseUltimate = (ultActor: SimulationActor) => {
        if (ultActor && !ultActor.isDown && ultActor.data.maxEp && ultActor.currentEp >= ultActor.data.maxEp) {
          const ultStrategy = partySlots[ultActor.index].ultimateStrategy;
          // @ts-ignore
          const ultInterval = partySlots[ultActor.index].ultimateTurnInterval;
          let useUltimate = false;

          if (ultStrategy === 'onReady') {
            useUltimate = true;
          } else if (ultStrategy === 'everyNTurns' && ultActor.turnCount > 0 && ultActor.turnCount % ultInterval === 0) {
            // 複数回のトリガーを避けるため、ターンが終わったばかりのキャラクターに対してのみトリガーします。
            // このチェックはトリッキーです。おそらくキャラクター自身のターン終了時にのみトリガーされるべきです。
            // 現時点では、現在のキャラクターのターンに紐づいていると仮定します。
            // 以前のロジックは `if (ultActor.index === currentActor.index)` でした。
            // このコンテキストはここでは失われていますが、現時点では許可します。
            useUltimate = true;
          }


          if (useUltimate) {
            ultActor.actionKey = 'ultimate';
            const { wasAttack, hpBefore, hpAfter, updatedParty } = executeAction(ultActor, 'ultimate', partyActors);
            processPostActionTriggers(ultActor, wasAttack, hpBefore, hpAfter, updatedParty);
          }
        }
      };

    const processPostActionTriggers = (originalActor: SimulationActor, wasAttack: boolean, hpBeforeAction: number[], hpStateAfterAction: number[], currentParty: SimulationActor[]) => {
      // 1. HP減少の確認 -> 精霊天賦
      hpStateAfterAction.forEach((currentHp, index) => {
        if (hpBeforeAction[index] > currentHp) {
          const damagedActor = currentParty[index];
          // 忍事録・音律狩猟
          const ninjitsuCritDmgBuff = damagedActor.selfBuffs.find(b => b.id.startsWith('ninjitsu_') && b.id.includes('_crit_dmg'));
          if (ninjitsuCritDmgBuff) {
            addOrRefreshBuff(damagedActor, { ...ninjitsuCritDmgBuff, sourceActorIndex: damagedActor.index });
          }

          // 刃のチャージ増加
          if (damagedActor.data.id === 'blade') {
            damagedActor.charge = Math.min(5, damagedActor.charge + 1);
          }
          // 宝命長存の蒔者 4セット
          const longevousSet = partySlots[index]?.relicSets.find(s => s.id === 'longevous_disciple' && s.count >= 4);
          if (longevousSet) {
            const longevousBuff = { id: 'longevous_crit_rate', source: '宝命長存の蒔者', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: 2, maxStacks: 2, sourceActorIndex: index } as const;
            addOrRefreshBuff(damagedActor, longevousBuff);
            actionLog.push({ name: damagedActor.name, currentTime: currentTime, action: '会心率UP (蒔者4)', sp: currentSp, activeEffects: [] });
          }
          // ヒアンシーの精霊天賦
          triggerIcarunTalentHeal(damagedActor);
        }
      });

      // 輪契 (被撃)
      const cogsEpBuffOnHit = originalActor.selfBuffs.find(b => b.id === 'ep_recovery_on_action');
      if (cogsEpBuffOnHit && typeof cogsEpBuffOnHit.value === 'number' && hpBeforeAction[originalActor.index] > hpStateAfterAction[originalActor.index]) {
        originalActor.currentEp = Math.min(originalActor.data.maxEp, originalActor.currentEp + cogsEpBuffOnHit.value);
      }

      // 「同袍」攻撃時の「百花」効果
      if (wasAttack && originalActor.index === simulationState.comradeState.targetIndex) {
        const dhthActor = currentParty.find(p => p.index === simulationState.comradeState.sourceActorIndex);
        if (dhthActor) {
          const hundredFlowersEffect = dhthActor.data.traces.talents.find(t => t.id === 'dhth-trace-hundred-flowers')?.effects?.[0];
          if (hundredFlowersEffect && typeof hundredFlowersEffect.value === 'object' && 'epRecoveryOnComradeAttack' in hundredFlowersEffect.value) {            const epGain = (hundredFlowersEffect.value.epRecoveryOnComradeAttack ?? 0) * (1 + (dhthActor.currentStats.total.epRegenRate / 100));
            dhthActor.currentEp = Math.min(dhthActor.data.maxEp ?? 135, dhthActor.currentEp + epGain);
            dhthActor.currentEp = Math.min(dhthActor.data.maxEp ?? 135, dhthActor.currentEp + hundredFlowersEffect.value.epRecoveryOnComradeAttack);
            const dragonSpiritActor = currentParty.find(p => p.data.id === 'dragon_spirit_dhth' && !p.isDown);
            if (dragonSpiritActor) {
              dragonSpiritActor.actionValue += (hundredFlowersEffect.value.spiritAvAdvanceOnComradeAttack ?? 0) * 100;
            }
          }
        }
      }

      // 龍霊の退場チェック
      const dhthActor = currentParty.find(p => p.data.id === 'dan_heng_teng_huang');
      const comradeActor = currentParty.find(p => p.index === simulationState.comradeState.targetIndex);
      const dragonSpiritActor = currentParty.find(p => p.data.id === 'dragon_spirit_dhth');

      if (dragonSpiritActor && !dragonSpiritActor.isDown) {
        if ((dhthActor && dhthActor.isDown) || (comradeActor && comradeActor.isDown)) {
          dragonSpiritActor.isDown = true;
          dragonSpiritActor.currentHp = 0;
          dragonSpiritActor.actionValue = Infinity; // 行動不能にする
          actionLog.push({ name: dragonSpiritActor.name, currentTime: currentTime, action: '退場', damage: null, sp: currentSp, activeEffects: [] });
        }
      };

      if (wasAttack) {
        // 記憶の中の姿
        const memoriesEpBuff = originalActor.selfBuffs.find(b => b.id === 'ep_recovery_on_attack');
        if (memoriesEpBuff && typeof memoriesEpBuff.value === 'number') {
          originalActor.currentEp = Math.min(originalActor.data.maxEp, originalActor.currentEp + memoriesEpBuff.value);
        }
        // 輪契 (攻撃)
        const cogsEpBuffOnAttack = originalActor.selfBuffs.find(b => b.id === 'ep_recovery_on_action');
        if (cogsEpBuffOnAttack && typeof cogsEpBuffOnAttack.value === 'number') {
          originalActor.currentEp = Math.min(originalActor.data.maxEp, originalActor.currentEp + cogsEpBuffOnAttack.value);
        }
        // 初めてのクエストの前に
        const questLc = lightCones.find(lc => lc.id === 'before_the_first_quest');
        const questLcRank = partySlots[originalActor.index]?.lightConeRank ?? 1;
        if (questLc && partySlots[originalActor.index]?.lightConeId === 'before_the_first_quest') {
          const epRecoveryValue = [4, 5, 6, 7, 8][questLcRank - 1];
          originalActor.currentEp = Math.min(originalActor.data.maxEp, originalActor.currentEp + epRecoveryValue);
        }

        // 2. 敵を攻撃したことで触発される効果 (承負、羅刹結界など)
        if (simulationState.burdenState.targetIndex !== -1) {
          const hanyaActor = currentParty.find(p => p?.index === simulationState.burdenState.sourceActorIndex);
          if (hanyaActor) {
            simulationState.burdenState.hitCount++;

            // 攻撃者に天賦の与ダメージバフを適用
            let talentBuff = hanyaActor.data.actions?.follow_up?.effects?.[0];
            if (talentBuff && typeof talentBuff.value === 'object') {
              const talentDmgBonus = partySlots[hanyaActor.index].eidolonLevel >= 6 ? 10 : 0;
              const finalTalentValue = { ...talentBuff.value, 'ALL': talentBuff.value['ALL'] + talentDmgBonus };
              const existingBuff = originalActor.selfBuffs.find((b: relics.Effect) => b.id === talentBuff!.id);
              if (existingBuff) {
                existingBuff.duration = talentBuff.duration;
                existingBuff.value = finalTalentValue;
              } else originalActor.selfBuffs.push({ ...talentBuff, value: finalTalentValue, currentStacks: 1 });
            }

            // SP回復をチェック (攻撃者が味方の場合のみ)
            if (originalActor.name !== '敵' && simulationState.burdenState.hitCount % 2 === 0) {
              if (simulationState.burdenState.spRecoveryCount < 2) {
                currentSp = Math.min(maxSp, currentSp + 1);
                simulationState.burdenState.spRecoveryCount++;
                actionLog.push({ name: hanyaActor.name, currentTime: currentTime, action: 'SP回復 (承負)', sp: currentSp, activeEffects: [], charge: hanyaActor.charge, hp: hanyaActor.currentHp, maxHp: hanyaActor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
                const epGain = 2 * (1 + (hanyaActor.currentStats.total.epRegenRate / 100));
                hanyaActor.currentEp = Math.min(hanyaActor.data.maxEp ?? 140, hanyaActor.currentEp + epGain);
                originalActor.selfBuffs.push({ id: 'hanya-trace-atk-boost', source: '録事', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 10 }, duration: 1 });
                if (simulationState.burdenState.spRecoveryCount >= 2) simulationState.burdenState.targetIndex = -1;
              }
            }
          }
        }

        // 羅刹の結界による回復
        if (simulationState.luochaField.active && !originalActor.data.isTargetableSpirit && !originalActor.data.isUntargetableSpirit && originalActor.name !== '敵') {
          const luochaActor = currentParty.find(p => p?.index === simulationState.luochaField.sourceActorIndex);
          if (luochaActor) {
            // 攻撃者自身の回復 (天賦)
            const fieldScaling = luochaActor.data.actions?.follow_up?.healScaling?.main?.[0];
            if (fieldScaling) {
              const healAmount = calculateHealAmount(luochaActor, fieldScaling);
              applyHeal(luochaActor, originalActor, healAmount, '結界', currentParty);
            }

            // 他の味方の回復 (清めし塵の身)
            const traceScaling = luochaActor.data.actions?.follow_up?.healScaling?.adjacent?.[0];
            if (traceScaling) {
              const otherHealAmount = calculateHealAmount(luochaActor, traceScaling);
              currentParty.forEach(ally => {
                if (ally && ally.index !== originalActor.index && !ally.data.isTargetableSpirit && !ally.data.isUntargetableSpirit) {
                  applyHeal(luochaActor, ally, otherHealAmount, '清めし塵の身', currentParty);
                }
              });
            }
          }
        }

        // ルアン・メェイの結界による「残梅」付与
        if (simulationState.ruanMeiField.active && !simulationState.enemyState.isBroken) {
          // 弱点撃破状態でない敵に攻撃した場合にのみ付与
          simulationState.enemyState.hasPlumBlossom = true;
        }

        // トリビーの結界による付加ダメージ
        if (simulationState.toribiiField.active && !originalActor.data.isTargetableSpirit && !originalActor.data.isUntargetableSpirit && originalActor.name !== '敵') {
          const toribiiActor = currentParty.find(p => p?.index === simulationState.toribiiField.sourceActorIndex);
          if (toribiiActor) {
            // "攻撃を受けた敵1体につき" -> enemyCount回発動
            const additionalDamagePerHit = calculateActionDamage(toribiiActor, 'additional', 0, simulationState.partyBuffs, toribiiActor.selfBuffs, simulationState.enemyDebuffs);
            const totalAdditionalDamage = additionalDamagePerHit * enemyCount;
            totalDamage += totalAdditionalDamage;
            damageDealtByCharacter[toribiiActor.index] = (damageDealtByCharacter[toribiiActor.index] ?? 0) + totalAdditionalDamage;actionLog.push({ name: toribiiActor.name, currentTime: currentTime, action: '付加ダメージ (結界)', damageDealt: totalAdditionalDamage, sp: currentSp, activeEffects: [], charge: toribiiActor.charge, hp: toribiiActor.currentHp, maxHp: toribiiActor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
          }
        }
      }

      // トリビーの天賦による追加攻撃
      const toribiiActorForTalent = currentParty.find(p => p.data.id === 'toribii' && !p.isDown);
      if (toribiiActorForTalent && originalActor.index !== toribiiActorForTalent.index && wasAttack && originalActor.actionKey === 'ultimate') {
        if (!simulationState.toribiiTalentUses[originalActor.index]) {
          const { wasAttack: talentWasAttack, hpBefore: talentHpBefore, hpAfter: talentHpAfter, updatedParty: partyAfterTalent } = executeAction(toribiiActorForTalent, 'follow_up', currentParty);
          processPostActionTriggers(toribiiActorForTalent, talentWasAttack, talentHpBefore, talentHpAfter, partyAfterTalent);
          simulationState.toribiiTalentUses[originalActor.index] = true;
        }
      }

      // 3. 敵を攻撃したことで触発される行動 (アーチャー天賦など)
      // ...

      // 刃の天賦による追加攻撃
      const bladeActorForTalent = currentParty.find(p => p.data.id === 'blade' && p.charge >= 5 && !p.isDown);
      if (bladeActorForTalent) {
        const { wasAttack, hpBefore, hpAfter, updatedParty } = executeAction(bladeActorForTalent, 'follow_up', currentParty);
        const healAmount = bladeActorForTalent.currentStats.total.hp * 0.25;
        bladeActorForTalent.currentHp = Math.min(bladeActorForTalent.currentStats.total.hp, bladeActorForTalent.currentHp + healAmount);actionLog.push({ name: bladeActorForTalent.name, currentTime: currentTime, action: '回復 (天賦)', healingDone: healAmount, sp: currentSp, activeEffects: [], charge: bladeActorForTalent.charge, hp: bladeActorForTalent.currentHp, maxHp: bladeActorForTalent.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
        bladeActorForTalent.charge = 0;
        processPostActionTriggers(bladeActorForTalent, wasAttack, hpBefore, hpAfter, updatedParty);
      }

      // 灰燼を燃やし尽くす大公 4セット
      if (originalActor.actionKey === 'follow_up' || originalActor.actionKey === 'enhanced_spirit_skill') {
        const dukeSet = partySlots[originalActor.index]?.relicSets.find(s => s.id === 'the_grand_duke_incinerate' && s.count >= 4);
        if (dukeSet) {
          const dukeBuff = { id: 'grand_duke_atk_stack', source: '灰燼を燃やし尽くす大公', target: 'SELF', type: 'STAT_MOD', value: { '攻撃力%': 6 }, duration: 3, maxStacks: 8, sourceActorIndex: originalActor.index } as const;
          // ヒット数に応じてスタック。ここでは簡易的に1行動で1スタックとする。
          // 次の追加攻撃で解除されるロジックは、バフ追加時に既存バフを削除することで実装。
          originalActor.selfBuffs = originalActor.selfBuffs.filter(b => b.id !== dukeBuff.id);
          addOrRefreshBuff(originalActor, dukeBuff);
        }
      }

      // --- 行動後、自身に付与されるバフ ---
      // アーチャー: 回路接続
      if (originalActor.data.id === 'archer' && wasAttack && originalActor.data.actions.skill) {
        const skillEffect = originalActor.data.actions.skill.effects?.find(e => e.id === 'archer-skill-state');
        if (skillEffect) {
          const existingBuff = originalActor.selfBuffs.find(b => b.id === skillEffect.id);
          if (existingBuff) {
            existingBuff.currentStacks = Math.min(skillEffect.maxStacks ?? 1, (existingBuff.currentStacks ?? 1) + 1);
          } else {
            originalActor.selfBuffs.push({ ...skillEffect, currentStacks: 1 });
          }
        }
      }

      // 4. 必殺技行動のチェック
      currentParty.forEach(actor => checkAndUseUltimate(actor));

      // 5. 羅刹の結界展開チェック (全ての行動の最後)
      const luochaActorForField = currentParty.find(p => p.data.id === 'luocha' && p.charge >= 2);
      if (luochaActorForField) {
        // 結界展開でチャージを消費
        luochaActorForField.charge = 0;
        simulationState.luochaField = { active: true, duration: 2, sourceActorIndex: luochaActorForField.index };
        actionLog.push({ name: luochaActorForField.name, currentTime: currentTime, action: '結界展開 (天賦)', sp: currentSp, activeEffects: [], charge: luochaActorForField.charge, hp: luochaActorForField.currentHp, maxHp: luochaActorForField.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });

        // 結界展開は攻撃ではないが、他のトリガー（例：必殺技の使用）を誘発する可能性があるため、トリガーを処理する
        const { wasAttack, hpBefore, hpAfter, updatedParty } = executeAction(luochaActorForField, 'follow_up', currentParty); // follow_up is a placeholder for talent action
        processPostActionTriggers(luochaActorForField, wasAttack, hpBefore, hpAfter, updatedParty);
      }
    };

    while (currentTime <= simulationEndTime) {
      currentTime++;

      // すべてのアクターのステータスを毎ティック更新します。
      updateAllActorStats(partyActors);

      allActors.forEach(actor => {
        if (!actor) return;
        actor.actionValue += actor.currentStats.total.spd;
      });

      // 最初に行動する準備ができているアクターでソート
      const readyActors = allActors.filter(actor => actor!.actionValue >= 10000 && !actor.isDown);
      if (readyActors.length === 0) continue; // No one is ready, next tick

      // タイブレーク：1. 高いAV、2. 低いパーティーインデックス
      readyActors.sort((a, b) => {
        if (a.actionValue !== b.actionValue) return b.actionValue - a.actionValue;
        // AVが同じ場合、速度が高い方を優先
        if (a.currentStats.total.spd !== b.currentStats.total.spd) {
          return b.currentStats.total.spd - a.currentStats.total.spd;
        }
        return a.index - b.index;
      });

      const currentActor = readyActors[0]; // 最もAVが高いアクターが行動します

      // 羅刹の自動スキルはいつでも発動する可能性があるため、アクターのターンの前にチェックします
      checkAndUseLuochaAutoSkill(currentTime);

      if (currentTime > simulationEndTime) break;

      // --- 通常のターン行動（順次行動） ---
      let performedAction: ActionTypeKey | null = null;
      let turnEnded = true; // Default to ending the turn
      const hpBeforeAction = [...partyActors.map(p => p.currentHp)];

      if (currentActor.name === '敵') {
        // --- 敵の行動 ---
        let isTurnSkipped = false;

        // 敵のターン開始時効果（DoT、デバフ解除など）
        const newEnemyDebuffs: relics.Effect[] = [];
        simulationState.enemyDebuffs.forEach(debuff => {
          const sourceActor = partyActors.find(p => p.index === debuff.sourceActorIndex);
          if (!sourceActor) return;

          let shouldKeep = true;
          let damageDealt = 0;

          // DoTダメージ
          if (debuff.dotScaling) {
            // スキルによるDoT
            damageDealt = calculateSkillDotDamage(sourceActor, debuff, simulationState.enemyDebuffs);
            actionLog.push({ name: '敵', currentTime: currentTime, action: `${debuff.source}ダメージ`, damageDealt: damageDealt, sp: currentSp, activeEffects: [], charge: 0, hp: 0, maxHp: 0, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
          } else if (['裂創', '燃焼', '感電', '風化'].some(dot => debuff.id.includes(dot))) {
            // 弱点撃破によるDoT
            damageDealt = calculateDotDamage(sourceActor, debuff, simulationState.enemyDebuffs);
            actionLog.push({ name: '敵', currentTime: currentTime, action: `${debuff.id.split('_')[2]}ダメージ`, damageDealt: damageDealt, sp: currentSp, activeEffects: [], charge: 0, hp: 0, maxHp: 0, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
          }

          // 付加ダメージと特殊効果
          if (debuff.id.includes('凍結')) {
            damageDealt = calculateDotDamage(sourceActor, debuff, simulationState.enemyDebuffs);
            actionLog.push({ name: '敵', currentTime: currentTime, action: '凍結ダメージ', damageDealt: damageDealt, sp: currentSp, activeEffects: [], charge: 0, hp: 0, maxHp: 0, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
            isTurnSkipped = true;
            currentActor.actionValue = 5000; // 次のターンを50%進める
          } else if (debuff.id.includes('もつれ')) {
            damageDealt = calculateDotDamage(sourceActor, debuff, simulationState.enemyDebuffs);
            actionLog.push({ name: '敵', currentTime: currentTime, action: 'もつれダメージ', damageDealt: damageDealt, sp: currentSp, activeEffects: [], charge: 0, hp: 0, maxHp: 0, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
          } else if (debuff.id.includes('禁錮')) {
            // 禁錮の速度デバフは別途実装
          }

          if (shouldKeep) {
            newEnemyDebuffs.push(debuff);
          }
        });
        simulationState.enemyDebuffs = newEnemyDebuffs;

        if (isTurnSkipped) {
          actionLog.push({ name: '敵', currentTime: currentTime, action: 'ターンをスキップ (凍結)', sp: currentSp, activeEffects: [], charge: 0, hp: 0, maxHp: 0, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
          simulationState.enemyDebuffs = simulationState.enemyDebuffs.filter(d => !d.id.includes('凍結')); // 凍結デバフを解除
          turnEnded = true;
          continue; // 行動せずに次のループへ
        } else if (simulationState.enemyState.isBroken) {
          // 弱点撃破状態から回復しようとする時の処理
          if (simulationState.enemyState.hasPlumBlossom) {
            // 「残梅」が発動
            const ruanMeiActor = partyActors.find(p => p.data.id === 'ruan_mei');
            if (ruanMeiActor) {
              const delayValue = (ruanMeiActor.currentStats.total.breakEffect / 100) * 0.20 + 0.10;
              currentActor.actionValue -= 10000 * delayValue;

              const ruanMeiBreakDamage = calculateBreakDamage(ruanMeiActor, simulationState.enemyDebuffs);
              const talentDamage = ruanMeiBreakDamage * 0.50;
              totalDamage += talentDamage;
              damageDealtByCharacter[ruanMeiActor.index] = (damageDealtByCharacter[ruanMeiActor.index] ?? 0) + talentDamage;actionLog.push({ name: ruanMeiActor.name, currentTime: currentTime, action: '残梅 発動', damageDealt: talentDamage, sp: currentSp, activeEffects: [], charge: ruanMeiActor.charge, hp: ruanMeiActor.currentHp, maxHp: ruanMeiActor.currentStats.total.hp, toughness: simulationState.enemyState.toughness, maxToughness: simulationState.enemyState.maxToughness });
            }
            simulationState.enemyState.hasPlumBlossom = false; // 発動後にフラグを解除
            // 弱点撃破状態を延長（靭性を回復しない）
            turnEnded = true;
            continue; // 「残梅」が発動した場合、敵は行動せずにターンを終了する
          } else {
            // 通常の弱点撃破回復
            simulationState.enemyState.isBroken = false;
            simulationState.enemyState.toughness = simulationState.enemyState.maxToughness;
          }
        } else {
          // ターンがスキップされなかった場合のみ弱点撃破から回復
          //simulationState.enemyState.isBroken = false;
          //simulationState.enemyState.toughness = simulationState.enemyState.maxToughness;
        }
        const livingAllies = partyActors.filter(p => !p.isDown && !p.data.isUntargetableSpirit);
        if (livingAllies.length > 0) {
          for (let i = 0; i < enemyAttacksPerRound; i++) {
            const currentLivingAllies = partyActors.filter(p => !p.isDown && !p.data.isUntargetableSpirit);
            if (currentLivingAllies.length === 0) break; // 全員倒れたらループを抜ける

            const targetActor = currentLivingAllies[Math.floor(Math.random() * currentLivingAllies.length)];
            const hpBeforeThisAttack = partyActors.map(p => p.currentHp);
            let damage = enemyAttackDamage;

            if (targetActor.shield && targetActor.shield.value > 0) {
              const absorbedDamage = Math.min(damage, targetActor.shield.value);
              targetActor.shield.value -= absorbedDamage;
              // 宝命長存の蒔者 4セット (攻撃を受けた判定)
              const longevousSet = partySlots[targetActor.index]?.relicSets.find(s => s.id === 'longevous_disciple' && s.count >= 4);
              if (longevousSet) {
                const longevousBuff = { id: 'longevous_crit_rate', source: '宝命長存の蒔者', target: 'SELF', type: 'STAT_MOD', value: { '会心率': 8 }, duration: 2, maxStacks: 2, sourceActorIndex: targetActor.index } as const;
                addOrRefreshBuff(targetActor, longevousBuff);
                actionLog.push({ name: targetActor.name, currentTime: currentTime, action: '会心率UP (蒔者4)', sp: currentSp, activeEffects: [] });
              }
              damage -= absorbedDamage;
              actionLog.push({ name: targetActor.name, currentTime: currentTime, action: `バリアで吸収 (敵 ${i + 1})`, shieldGranted: -absorbedDamage, sp: currentSp, activeEffects: [], charge: targetActor.charge, hp: targetActor.currentHp, maxHp: targetActor.currentStats.total.hp, shield: targetActor.shield.value });
            }

            if (damage > 0) {
              targetActor.currentHp -= damage;
              actionLog.push({ name: targetActor.name, currentTime: currentTime, action: `被ダメージ (敵 ${i + 1})`, damageDealt: damage, sp: currentSp, activeEffects: [], charge: targetActor.charge, hp: targetActor.currentHp, maxHp: targetActor.currentStats.total.hp, shield: targetActor.shield.value });

              if (targetActor.currentHp <= 0) {
                targetActor.currentHp = 0;
                targetActor.isDown = true;
              }
            }

            const hpAfterThisAttack = partyActors.map(p => p.currentHp);
            processPostActionTriggers(currentActor, true, hpBeforeThisAttack, hpAfterThisAttack, partyActors);
          }
        }
        turnEnded = true;

      } else if (currentActor.data.id === 'archer') {
        // --- アーチャーの特殊AIローテーション ---
        if (currentSp >= archerSpThreshold) {
          // --- アーチャーのスキルシーケンス開始 (SP消費は2) ---
          turnEnded = false; // このターンは終了しないかもしれません
          let skillUses = 0;

          while (skillUses < 5 && currentSp >= 2) {
            skillUses++;
            currentSp -= 2;

            const { wasAttack, hpBefore, hpAfter, updatedParty } = executeAction(currentActor, 'skill', partyActors, false); // SPは手動で引いたので isTurnAction=false
            processPostActionTriggers(currentActor, wasAttack, hpBefore, hpAfter, updatedParty);
          }

          // ループが終了した後（SPまたは5回の使用による）、状態は解除され、ターンは終了します。
          currentActor.selfBuffs = currentActor.selfBuffs.filter(b => b.id !== 'archer-skill-state');
          turnEnded = true;

          // アーチャーが一度もスキルを使用できなかった場合（例：開始時のSP < 2）、通常攻撃を実行します。
          if (skillUses === 0) {
            performedAction = 'basic';
          }

        } else { // アーチャーはSPが閾値以下なので通常攻撃を使用します
          performedAction = 'basic';
        }

      } else {
        // --- 他のキャラクターの標準ローテーション ---
        const currentSlot = partySlots[currentActor.index];
        if (!currentSlot) continue; // イカルンのようなスロットを持たない召喚ユニットはスキップ
        const actorRotation = currentSlot.rotation.split(',').map(s => s.trim().toUpperCase());
        const actionChar = actorRotation[currentActor.rotationIndex % actorRotation.length];

        if (currentActor.data.id === 'blade') {
          // Blade's logic remains here
          if (actionChar === 'S' && currentSp > 0 && currentActor.hellscapeTurns === 0) {
            const { hpBefore: hpBeforeSkill, hpAfter: hpAfterSkill, updatedParty: partyAfterSkill } = executeAction(currentActor, 'skill', partyActors, true);
            processPostActionTriggers(currentActor, false, hpBeforeSkill, hpAfterSkill, partyAfterSkill);
            // スキル発動後に即座に強化通常攻撃
            const { wasAttack, hpBefore, hpAfter, updatedParty } = executeAction(currentActor, 'enhanced_basic', partyAfterSkill, false);
            processPostActionTriggers(currentActor, wasAttack, hpBefore, hpAfter, updatedParty);
          } else if (currentActor.hellscapeTurns > 0) {
            if (actionChar === 'E') {
              performedAction = 'enhanced_basic';
              currentActor.hellscapeTurns--;
            } else {
              performedAction = 'basic';
            }
          } else {
            performedAction = 'basic';
          }
        } else if (currentActor.data.isUntargetableSpirit && currentActor.data.id === 'dragon_spirit_dhth') {
          if (simulationState.dragonSpiritState.isEnhanced && simulationState.dragonSpiritState.enhancedActionsLeft > 0) {
            performedAction = 'enhanced_spirit_skill';
            simulationState.dragonSpiritState.enhancedActionsLeft--;
            if (simulationState.dragonSpiritState.enhancedActionsLeft === 0) {
              simulationState.dragonSpiritState.isEnhanced = false;
              actionLog.push({ name: currentActor.name, currentTime: currentTime, action: '龍霊強化終了', sp: currentSp, activeEffects: [] });
            }
          } else {
            performedAction = 'spirit_skill';
          }

        } else if (currentActor.data.id === 'luocha') {
          performedAction = (actionChar === 'S' && currentSp > 0) ? 'skill' : 'basic';
        } else if (currentActor.data.id === 'xianci') {
          performedAction = (actionChar === 'S' && currentSp > 0) ? 'skill' : 'basic';
        } else { // アーチャー、刃、羅刹以外のキャラクターのロジック
          performedAction = (actionChar === 'S' && currentSp > 0) ? 'skill' : 'basic';
        }
      }

      if (performedAction) {
        const { wasAttack, hpBefore, hpAfter, updatedParty } = executeAction(currentActor, performedAction, partyActors, true);
        currentActor.actionKey = performedAction; // Store the action key for post-action triggers
        processPostActionTriggers(currentActor, wasAttack, hpBefore, hpAfter, updatedParty);

        const toribiiActor = partyActors.find(p => p?.data.id === 'toribii');
        // アーチャーの天賦トリガー
        const archerActor = partyActors.find(p => p?.data.id === 'archer');
        if (archerActor && currentActor.index !== archerActor.index && archerActor.charge > 0) {
          archerActor.charge--;
          currentSp = Math.min(maxSp, currentSp + 1);
          checkAndApplyGuardianBuff(currentSp);

          const archerActiveEffects = [...archerActor.selfBuffs, ...simulationState.partyBuffs];
          const talentDamage = calculateActionDamage(archerActor, 'follow_up', 0, simulationState.partyBuffs, archerActor.selfBuffs, simulationState.enemyDebuffs);
          totalDamage += talentDamage;
          damageDealtByCharacter[archerActor.index] = (damageDealtByCharacter[archerActor.index] ?? 0) + talentDamage;          const epGain = (archerActor.data.actions?.follow_up?.epRecovery ?? 0) * (1 + (archerActor.currentStats.total.epRegenRate / 100));
          archerActor.currentEp += epGain;
          actionLog.push({
            name: archerActor.name,
            currentTime: currentTime,
            action: '天賦(追加攻撃)',
            damageDealt: talentDamage, sp: currentSp, activeEffects: archerActiveEffects.map(e => `${e.source}${e.currentStacks && e.currentStacks > 1 ? `(${e.currentStacks}層)` : ''}`), charge: archerActor.charge
          });
        }
        if (toribiiActor && currentActor.index !== toribiiActor.index) {
          const actionData = currentActor.data.actions?.[performedAction];
          if (actionData && performedAction) {
            let enemiesHit = 0;
            if (actionData.targetType === 'single') enemiesHit = 1;
            else if (actionData.targetType === 'blast') enemiesHit = Math.min(3, enemyCount);
            else if (actionData.targetType === 'aoe') enemiesHit = enemyCount;
            if (enemiesHit > 0) {
              const epGain = (1.5 * enemiesHit) * (1 + (toribiiActor.currentStats.total.epRegenRate / 100));
              toribiiActor.currentEp = Math.min(toribiiActor.data.maxEp ?? 120, toribiiActor.currentEp + epGain);
            }
          }
        }
      }

      // すべてのターン行動と必殺技の後、ターンが終わったアクターの持続時間を更新します。
      if (turnEnded) {
        const actorIndex = allActors.findIndex(a => a.index === currentActor.index && a.name === currentActor.name);
        if (actorIndex !== -1) {
          const actorToEndTurn = allActors[actorIndex];
          actorToEndTurn.actionValue = 0; // AVをリセット
          actorToEndTurn.rotationIndex++;
          actorToEndTurn.turnCount++;

          // 味方キャラクターにのみ適用される処理
          if (actorToEndTurn.index !== -1) {
            actorToEndTurn.autoSkillCooldown = Math.max(0, actorToEndTurn.autoSkillCooldown - 1);
            actorToEndTurn.selfBuffs = actorToEndTurn.selfBuffs.map(b => ({ ...b, duration: (b.duration ?? 1) - 1 })).filter(b => b.duration > 0);
          }

          // 敵には適用されないターン終了効果
          if (currentActor.name !== '敵') {
            // ルアン・メェイの軌跡「広がる想像」
            if (currentActor.data.id === 'ruan_mei') {
              const epGain = 5 * (1 + (currentActor.currentStats.total.epRegenRate / 100));
              currentActor.currentEp = Math.min(currentActor.data.maxEp, currentActor.currentEp + epGain);
            }
            // ルアン・メェイの軌跡「広がる想像」
            const ruanMeiTrace2 = currentActor.data.traces?.talents.find((t: any) => t.id === 'ruan_mei_trace_2');
            if (ruanMeiTrace2) {
              const epGain = 5 * (1 + (currentActor.currentStats.total.epRegenRate / 100));
              currentActor.currentEp = Math.min(currentActor.data.maxEp ?? 130, currentActor.currentEp + epGain);
            }
          }
        }

        // ヒアンシーの「雨上がり」状態は彼女のターンで減少します
        if (simulationState.xianciRainfall.active && simulationState.xianciRainfall.sourceActorIndex === currentActor.index) {
          simulationState.xianciRainfall.duration--;
          if (simulationState.xianciRainfall.duration <= 0) {
            simulationState.xianciRainfall.active = false;
            simulationState.partyBuffs = simulationState.partyBuffs.filter(b => b.id !== 'xianci-ult-hp-buff');actionLog.push({ name: 'System', currentTime: currentTime, action: `雨上がり 状態終了`, sp: currentSp, activeEffects: [], charge: undefined, ep: undefined, hp: undefined });
          }
        }

        // パーティーバフはソースのターンに基づいて減少します。
        if (simulationState.luochaField.active && simulationState.luochaField.sourceActorIndex === currentActor.index) {
          simulationState.luochaField.duration--;
          if (simulationState.luochaField.duration <= 0) {
              simulationState.luochaField.active = false;
              actionLog.push({ name: 'System', currentTime: currentTime, action: `羅刹の結界終了`, sp: currentSp, activeEffects: [], charge: undefined, ep: undefined, hp: undefined });
          }
        }

        // ルアン・メェイの結界は彼女のターンで減少します
        if (simulationState.ruanMeiField.active && simulationState.ruanMeiField.sourceActorIndex === currentActor.index) {
          simulationState.ruanMeiField.duration--;
          if (simulationState.ruanMeiField.duration <= 0) {
            simulationState.ruanMeiField.active = false;
            actionLog.push({ name: 'System', currentTime: currentTime, action: `ルアン・メェイの結界終了`, sp: currentSp, activeEffects: [], charge: undefined, ep: undefined, hp: undefined });
            // 関連するバフも削除
            simulationState.partyBuffs = simulationState.partyBuffs.filter(b => b.id !== 'ruan_mei_ult_res_pen');
          }
        }

        // トリビーの結界は彼女のターンで減少します
        if (simulationState.toribiiField.active && simulationState.toribiiField.sourceActorIndex === currentActor.index) {
          simulationState.toribiiField.duration--;
          if (simulationState.toribiiField.duration <= 0) {
            simulationState.toribiiField.active = false;
              actionLog.push({ name: 'System', currentTime: currentTime, action: `トリビーの結界終了`, sp: currentSp, activeEffects: [], charge: undefined, ep: undefined, hp: undefined });
          }
        }

        simulationState.partyBuffs = simulationState.partyBuffs.map(b => b.sourceActorIndex === currentActor.index ? { ...b, duration: (b.duration ?? 1) - 1 } : b).filter(b => (b.duration ?? 0) > 0);
        simulationState.enemyDebuffs = simulationState.enemyDebuffs.map(b => b.sourceActorIndex === currentActor.index ? { ...b, duration: (b.duration ?? 1) - 1 } : b).filter(b => (b.duration ?? 0) > 0);

        // バフ/デバフの持続時間更新後にステータスを再計算
        updateAllActorStats(partyActors);
      }

      // 追加攻撃後のトリビーの自己バフをチェック
      if (actionLog[actionLog.length - 1]?.action === '天賦(追加攻撃)' && currentActor.data.id === 'toribii') {
        const buffEffect = currentActor.data.traces?.talents.find(t => t.id === 'toribii-talent1')?.effects?.[0];
        if (buffEffect) {
          const existingBuff = currentActor.selfBuffs.find(b => b.id === buffEffect.id);
          if (existingBuff) {
            existingBuff.currentStacks = Math.min(existingBuff.maxStacks ?? 1, (existingBuff.currentStacks ?? 1) + 1);
            existingBuff.duration = buffEffect.duration; // Refresh duration
          } else {
            currentActor.selfBuffs.push({ ...buffEffect, currentStacks: 1 });
          }
        }
      }
      partyActors.forEach(checkAndUseUltimate);

      // 回復量の変動を計算
      const healingValues = Object.values(healingReceivedByCharacter);
      let healingCoefficientOfVariation = 0;

      if (healingValues.length > 0 && totalHealing > 0) {
        const meanHealing = totalHealing / healingValues.length;
        const healingVariance = healingValues.reduce((acc, val) => acc + Math.pow(val - meanHealing, 2), 0) / healingValues.length;
        const standardDeviation = Math.sqrt(healingVariance);
        healingCoefficientOfVariation = standardDeviation / meanHealing;
      }

      const breakdown = partyActors.map(actor => {
        if (!actor) return null;
        return {
          name: actor.name,
          totalDamage: Math.round(damageDealtByCharacter[actor.index] ?? 0),
          totalHealingDone: Math.round(healingDoneByCharacter[actor.index] ?? 0),
          totalShieldGranted: Math.round(shieldGrantedByCharacter[actor.index] ?? 0),
        };
      }).filter(Boolean);

      setSimulationResult({
        totalDamage: Math.round(totalDamage),
        totalHealing: Math.round(totalHealing),
        totalShieldGranted: Math.round(totalShieldGranted),
        healingCoefficientOfVariation: healingCoefficientOfVariation,
        log: actionLog,
        breakdown: breakdown
      });
    };
  };

    return (
      <main className="min-h-screen p-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold">崩壊：スターレイル計算アプリ</h1>
          <p className="mt-4 text-lg">キャラクターのダメージやステータスをシミュレートします。</p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- 左列：入力 --- */}
          <div className="md:col-span-1 space-y-6">
            {/* パーティー編成 */}
            <div className="p-4 border rounded-md">
              <h2 className="text-xl font-semibold text-center mb-4">パーティー編成</h2>
              <div className="grid grid-cols-4 gap-2">
                {partySlots.map((slot, index) => (
                  <div key={index} onClick={() => setActiveSlotIndex(index)} className={`p-2 border-2 rounded-md cursor-pointer ${activeSlotIndex === index ? 'border-indigo-500' : 'border-gray-600'}`}>
                    <select
                      value={slot.characterId}
                      onChange={(e) => handleCharacterChange(index, e.target.value)}
                      className="block w-full rounded-md bg-white dark:bg-gray-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      <option value="">Slot {index + 1}</option>
                      {characters.map((char) => (
                        <option key={char.id} value={char.id}>
                          {!char.isSummonedSpirit && char.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  設定をインポート
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {exportButtonText}
                </button>
              </div>
            </div>

            {/* アクティブなキャラクターのビルドエディター */}
            {selectedCharacterData && !selectedCharacterData.isSummonedSpirit && (
              <>
                <div>
                  <div className="mb-4 flex justify-center gap-4">
                    <button
                      onClick={() => setIsCharImportModalOpen(true)}
                      className="px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                    >
                      キャラクター設定をインポート
                    </button>
                    <button
                      onClick={handleCharExport}
                      className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      {charExportButtonText}
                    </button>
                  </div>
                  <label htmlFor="lightcone-select" className="block text-sm font-medium mb-2">
                    光円錐を選択 ({selectedCharacterData.path})
                  </label>
                  <select
                    id="lightcone-select"
                    value={selectedLightCone}
                    onChange={(e) => updatePartySlot(activeSlotIndex, { lightConeId: e.target.value })}
                    className="block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  >
                    <option value="">光円錐なし</option>
                    {availableLightCones.map((lc) => (
                      <option key={lc.id} value={lc.id}>
                        {lc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {selectedLightConeData && (
              <div className="text-xs text-gray-400 p-3 bg-white/5 rounded-md">
                <p>
                  <strong>S{lightConeRank}: </strong>
                  {
                    selectedLightConeData.effects[lightConeRank - 1]?.description
                  }
                </p>
              </div>
            )}
            <div>
              <label htmlFor="eidolon-level" className="block text-sm font-medium mb-2">星魂レベル</label>
              <select id="eidolon-level" value={eidolonLevel} onChange={e => updatePartySlot(activeSlotIndex, { eidolonLevel: Number(e.target.value) })} className="w-full rounded-md dark:bg-gray-800">
                {[0, 1, 2, 3, 4, 5, 6].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="lc-rank" className="block text-sm font-medium mb-2">光円錐ランク</label>
              <select id="lc-rank" value={lightConeRank} onChange={e => updatePartySlot(activeSlotIndex, { lightConeRank: Number(e.target.value) })} className="w-full rounded-md dark:bg-gray-800">
                {[1, 2, 3, 4, 5].map(lvl => <option key={lvl} value={lvl}>S{lvl}</option>)}
              </select>
            </div>

            {/* 遺物セクション */}
            {selectedCharacterData && !selectedCharacterData.isSummonedSpirit && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">ビルド詳細</h2>

                {/* Trace Selection */}
                {selectedCharacterData.traces && (
                  <div className="p-4 border rounded-md space-y-3">
                    <h3 className="text-lg font-bold text-center">軌跡ボーナス</h3>
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-md font-semibold text-center mb-2">追加能力</h4>
                      <div className="space-y-2">
                        {selectedCharacterData.traces.talents.map(talent => (
                          <div key={talent.id} className="text-sm">
                            <div>
                              <span className="font-bold">{talent.name}</span>
                              <p className="text-xs text-gray-400">{talent.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Relic Set Selection */}
                <div className="p-4 border rounded-md space-y-3">
                  <h3 className="text-lg font-bold text-center">遺物セット効果</h3>
                  {[0, 1].map(index => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={selectedRelicSets[index].id}
                        onChange={(e) => handleRelicSetChange(index, 'id', e.target.value)}
                        className="flex-grow rounded-md dark:bg-gray-800"
                        disabled={index === 1 && selectedRelicSets[0].count === 4}
                      >
                        <option value="">セット{index + 1}...</option>
                        {relics.RELIC_SETS.map(set => (
                          <option key={set.id} value={set.id}>{set.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedRelicSets[index].count}
                        onChange={(e) => handleRelicSetChange(index, 'count', Number(e.target.value))}
                        className="w-24 rounded-md dark:bg-gray-800"
                        disabled={!selectedRelicSets[index].id || (index === 1 && selectedRelicSets[0].count === 4)}
                      >
                        <option value={0}>0</option>
                        <option value={2}>2</option>
                        {index === 0 && <option value={4}>4</option>}
                      </select>
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    {selectedRelicSets.map((set, index) => {
                      if (!set.id || set.count === 0) return null;
                      const setData = relics.RELIC_SETS.find(s => s.id === set.id);
                      if (!setData) return null;
                      return (
                        <div key={index}>
                          {set.count >= 2 && <p><strong>{setData.name} 2セット:</strong> {setData.effects[2]?.description}</p>}
                          {set.count >= 4 && setData.effects[4] && <p><strong>{setData.name} 4セット:</strong> {setData.effects[4]?.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Planar Ornament Selection */}
                <div className="p-4 border rounded-md space-y-3">
                  <h3 className="text-lg font-bold text-center">次元界オーナメント</h3>
                  <select
                    value={selectedPlanarOrnament}
                    onChange={(e) => updatePartySlot(activeSlotIndex, { planarOrnamentId: e.target.value })}
                    className="w-full rounded-md dark:bg-gray-800"
                  >
                    <option value="">オーナメントなし</option>
                    {relics.PLANAR_ORNAMENTS.map(ornament => (
                      <option key={ornament.id} value={ornament.id}>{ornament.name}</option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    {(() => {
                      if (!selectedPlanarOrnament) return null;
                      const ornamentData = relics.PLANAR_ORNAMENTS.find(o => o.id === selectedPlanarOrnament);
                      if (!ornamentData) return null;
                      return (
                        <p><strong>2セット:</strong> {ornamentData.effects[2]?.description}</p>
                      );
                    })()}
                  </div>
                </div>

                {/* Main Stats */}
                <div className="p-4 border rounded-md space-y-3">
                  <h3 className="text-lg font-bold text-center">メインステータス</h3>
                  {relics.RELIC_PARTS.map(part => (
                    <div key={part}>
                      <label className="block text-sm font-medium mb-1">{relics.RELIC_PART_NAMES[part]}</label>
                      <div className="flex gap-2">
                        {relics.MAIN_STATS[part].length > 1 ? (
                          <select
                            value={relicStates[part].mainStat.type}
                            onChange={(e) => handleRelicMainStatChange(part, 'type', e.target.value)}
                            className="w-2/3 rounded-md dark:bg-gray-800"
                          >
                            <option value="">選択...</option>
                            {relics.MAIN_STATS[part].map(stat => <option key={stat} value={stat}>{stat}</option>)}
                          </select>
                        ) : (
                          <span className="w-2/3 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-sm">{relics.MAIN_STATS[part][0]}</span>
                        )}
                        <input
                          type="number"
                          value={relicStates[part].mainStat.value || ''}
                          onChange={(e) => handleRelicMainStatChange(part, 'value', e.target.value)}
                          className="w-1/3 rounded-md dark:bg-gray-800"
                          placeholder="値"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub Stats */}
                <div className="p-4 border rounded-md space-y-3">
                  <h3 className="text-lg font-bold text-center">サブステータス合計</h3>
                  <div className="space-y-2">
                    {subStats.map((stat, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select value={stat.type} onChange={(e) => handleSubStatChange(i, 'type', e.target.value)} className="flex-grow rounded-md dark:bg-gray-800">
                          <option value="">選択...</option>
                          {relics.SUB_STATS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="number" value={stat.value || ''} onChange={(e) => handleSubStatChange(i, 'value', e.target.value)} className="w-24 rounded-md dark:bg-gray-800" placeholder="値" />
                        <button onClick={() => removeSubStat(i)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md">
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addSubStat} className="w-full mt-2 py-1 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md">
                    + サブステータスを追加
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- 右列：ステータスとシミュレーション --- */}
          {selectedCharacterData && finalStats && (
            <div className="md:col-span-2 p-6 border rounded-md h-fit sticky top-10">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                {selectedCharacterData.name} のステータス
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <h3 className="font-bold border-b pb-2 mb-2 text-center">基礎ステータス</h3>
                  <div className="grid grid-cols-2 gap-x-4">
                    <span>HP</span><span className="text-right">{finalStats.base.hp}</span>
                    <span>攻撃力</span><span className="text-right">{finalStats.base.atk}</span>
                    <span>防御力</span><span className="text-right">{finalStats.base.def}</span>
                    <span>速度</span><span className="text-right">{finalStats.base.spd}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold border-b pb-2 mb-2 text-center">合計ステータス</h3>
                  <div className="grid grid-cols-2 gap-x-4">
                    <span>HP</span><span className="text-right">{finalStats.total.hp}</span>
                    <span>攻撃力</span><span className="text-right">{finalStats.total.atk}</span>
                    <span>防御力</span><span className="text-right">{finalStats.total.def}</span>
                    <span>速度</span><span className="text-right">{finalStats.total.spd.toFixed(1)}</span>
                    <span>会心率</span><span className="text-right">{finalStats.total.critRate.toFixed(1)}%</span>
                    <span>会心ダメージ</span><span className="text-right">{finalStats.total.critDmg.toFixed(1)}%</span>
                    <span>効果抵抗</span><span className="text-right">{finalStats.total.effectRes.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* --- 単発ダメージシミュレーション アコーディオン --- */}
              <details className="mt-6 border-t pt-4 group">
                <summary className="text-xl font-semibold text-center cursor-pointer list-none">
                  <span className="group-open:hidden">▼ </span>
                  <span className="hidden group-open:inline">▲ </span>
                  単発ダメージ計算
                </summary>
                <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-4">
                  {/* シミュレーションコントロール */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enemy-level" className="block text-sm font-medium mb-1">敵レベル</label>
                      <input id="enemy-level" type="number" value={enemyLevel} onChange={e => setEnemyLevel(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="action-type" className="block text-sm font-medium mb-1">行動選択</label>
                      <select id="action-type" value={actionType} onChange={e => setActionType(e.target.value)} className="w-full rounded-md dark:bg-gray-800">
                        <option value="basic">通常攻撃</option>
                        <option value="skill">戦闘スキル</option>
                        <option value="ultimate">必殺技</option>
                        <option value="follow_up">天賦(追加攻撃)</option>
                      </select>
                    </div>
                    {/* 刃の必殺技用の条件付き入力 */}
                    {selectedCharacterData.id === 'blade' && actionType === 'ultimate' && (
                      <div className="col-span-2">
                        <label htmlFor="lost-hp" className="block text-sm font-medium mb-1">失ったHP累計</label>
                        <input id="lost-hp" type="number" value={lostHp} onChange={e => setLostHp(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                      </div>
                    )}
                  </div>

                  {/* 戦闘状態コントロール */}
                  {togglableEffects.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-lg font-bold text-center mb-2">戦闘状況</h4>
                      <div className="flex flex-col items-center space-y-2">
                        {togglableEffects.map((effect: relics.Effect) => (
                          <label key={effect.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={!!combatState[effect.id]} onChange={e => handleCombatStateChange(effect.id, e.target.checked)} className="rounded" />
                            <span>{effect.source}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ダメージ結果 */}
                  {damageResult && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-lg font-bold text-center mb-2">計算結果 (メインターゲット)</h4>
                      <div className="grid grid-cols-3 gap-x-4 text-center">
                        <div>
                          <p className="text-sm text-gray-400">非会心</p>
                          <p className="text-xl font-mono">{damageResult.nonCrit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">会心</p>
                          <p className="text-xl font-mono">{damageResult.crit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">期待値</p>
                          <p className="text-xl font-mono font-bold">{damageResult.average.toLocaleString()}</p>
                        </div>
                      </div>
                      {damageResult.averageAdjacent > 0 && (
                        <div className="mt-3 text-center">
                          <p className="text-sm text-gray-400">期待値 (隣接)</p>
                          <p className="text-lg font-mono font-bold">{damageResult.averageAdjacent.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-white/20 text-center">
                        <p className="text-md font-bold">合計期待値</p>
                        <p className="text-2xl font-mono font-bold text-indigo-400">
                          {damageResult.totalAverage.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </details>

              {/* --- ラウンドシミュレーション アコーディオン --- */}
              <details className="mt-6 border-t pt-4 group">
                <summary className="text-xl font-semibold text-center cursor-pointer list-none">
                  <span className="group-open:hidden">▼ </span>
                  <span className="hidden group-open:inline">▲ </span>
                  戦闘シミュレーション (nラウンド)
                </summary>
                <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-4">
                  {/* シミュレーション設定 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sim-rounds" className="block text-sm font-medium mb-1">シミュレーションラウンド数</label>
                      <input id="sim-rounds" type="number" value={simulationRounds} min={1} max={20} onChange={e => setSimulationRounds(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="enemy-count-sim" className="block text-sm font-medium mb-1">敵の数</label>
                      <input id="enemy-count-sim" type="number" value={enemyCount} min={1} max={5} onChange={e => setEnemyCount(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="enemy-attacks-per-round" className="block text-sm font-medium mb-1">ラウンド毎の敵の攻撃回数</label>
                      <input id="enemy-attacks-per-round" type="number" value={enemyAttacksPerRound} min={0} onChange={e => setEnemyAttacksPerRound(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="enemy-attack-damage" className="block text-sm font-medium mb-1">敵の単発ダメージ</label>
                      <input id="enemy-attack-damage" type="number" value={enemyAttackDamage} min={0} onChange={e => setEnemyAttackDamage(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="enemy-max-toughness" className="block text-sm font-medium mb-1">敵の靭性</label>
                      <input id="enemy-max-toughness" type="number" value={enemyMaxToughness} min={0} onChange={e => setEnemyMaxToughness(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="enemy-max-hp" className="block text-sm font-medium mb-1">敵の最大HP</label>
                      <input id="enemy-max-hp" type="number" value={enemyMaxHp} min={1} onChange={e => setEnemyMaxHp(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                    <div>
                      <label htmlFor="enemy-type" className="block text-sm font-medium mb-1">敵の種類</label>
                      <select id="enemy-type" value={enemyType} onChange={e => setEnemyType(e.target.value as 'normal' | 'elite')} className="w-full rounded-md dark:bg-gray-800"><option value="normal">通常</option><option value="elite">精鋭/ボス</option></select>
                    </div>
                    <div>
                      <label htmlFor="enemy-speed" className="block text-sm font-medium mb-1">敵の速度</label>
                      <input id="enemy-speed" type="number" value={enemySpeed} min={1} onChange={e => setEnemySpeed(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-md font-semibold text-center">行動戦略</h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {partySlots.map((slot, index) => {
                        const char = characters.find(c => c.id === slot.characterId);
                        if (!char) return <div key={index} className="p-3 border border-dashed border-white/20 rounded-md min-h-[100px]"></div>;
                        return (
                          <div key={index} className="p-3 border border-white/10 rounded-md">
                            <p className="text-sm font-bold mb-2 text-center">{char.name}</p>
                            <div className="space-y-3">
                              {char.id === 'archer' ? (
                                <div>
                                  <label className="block text-xs font-medium mb-1">SP閾値</label>
                                  <input type="number" value={archerSpThreshold} min={2} onChange={e => setArcherSpThreshold(Number(e.target.value))} className="w-full rounded-md dark:bg-gray-800 text-sm" />
                                </div>
                              ) : (
                                <div>
                                  <label htmlFor={`sim-rotation-${index}`} className="block text-xs font-medium mb-1">行動ローテーション</label>
                                  <input id={`sim-rotation-${index}`} type="text" value={slot.rotation} onChange={e => updatePartySlot(index, { rotation: e.target.value })} className="w-full rounded-md dark:bg-gray-800 font-mono text-sm" placeholder="S,E,B" />
                                </div>
                              )}
                              {char.id === 'hanya' && (
                                <div>
                                  <label htmlFor={`ult-target-${index}`} className="block text-xs font-medium mb-1">必殺技ターゲット</label>
                                  <select id={`ult-target-${index}`} value={slot.ultimateTargetIndex} onChange={e => updatePartySlot(index, { ultimateTargetIndex: Number(e.target.value) })} className="w-full rounded-md dark:bg-gray-800 text-sm">
                                    <option value={-1}>選択...</option>
                                    {partySlots.filter(p => p.characterId && !characters.find(c => c.id === p.characterId)?.isSummonedSpirit).map((p, i) => {
                                      const pChar = characters.find(c => c.id === p.characterId);
                                      return pChar ? <option key={i} value={i}>{pChar.name}</option> : null;
                                    })}
                                  </select>
                                </div>
                              )}
                              <div>
                                <label htmlFor={`ult-strategy-${index}`} className="block text-xs font-medium mb-1">必殺技戦略</label>
                                <div className="flex gap-2">
                                  <select id={`ult-strategy-${index}`} value={slot.ultimateStrategy} onChange={e => updatePartySlot(index, { ultimateStrategy: e.target.value })} className="flex-grow rounded-md dark:bg-gray-800 text-sm">
                                    <option value="onReady">EPが溜まり次第</option>
                                    <option value="everyNTurns">nターン毎</option>
                                  </select>
                                  {slot.ultimateStrategy === 'everyNTurns' && (
                                    <input type="number" value={slot.ultimateTurnInterval} min={1} onChange={e => updatePartySlot(index, { ultimateTurnInterval: Number(e.target.value) })} className="w-16 rounded-md dark:bg-gray-800 text-center text-sm" />
                                  )}
                                </div>
                              </div>
                              {char.technique && (
                                <div className="flex items-center pt-2">
                                  <input id={`technique-${index}`} type="checkbox" checked={slot.useTechnique} onChange={e => updatePartySlot(index, { useTechnique: e.target.checked })} className="h-4 w-4 rounded" />
                                  <label htmlFor={`technique-${index}`} className="ml-2 block text-sm">秘技を使用する</label>
                                </div>
                              )}
                              {char.id === 'dan_heng_teng_huang' && (
                                <div>
                                  <label htmlFor={`comrade-target-${index}`} className="block text-xs font-medium mb-1">同袍ターゲット</label>
                                  <select id={`comrade-target-${index}`} value={slot.comradeTargetIndex} onChange={e => updatePartySlot(index, { comradeTargetIndex: Number(e.target.value) })} className="w-full rounded-md dark:bg-gray-800 text-sm">
                                    <option value={-1}>選択...</option>
                                    {partySlots.filter(p => p.characterId && !characters.find(c => c.id === p.characterId)?.isTargetableSpirit && !characters.find(c => c.id === p.characterId)?.isUntargetableSpirit).map((p, i) => {
                                      const pChar = characters.find(c => c.id === p.characterId);
                                      return pChar ? <option key={i} value={i}>{pChar.name}</option> : null;
                                    })}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-center">S:スキル, E:強化通常, B:通常 (U:必殺技は自動発動)</p>
                  </div>
                  <button onClick={handleRunSimulation} className="w-full mt-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md">
                    シミュレーション開始
                  </button>

                  {/* シミュレーション結果 */}
                  {simulationResult && (
                    <div className="mt-4 pt-4 border-t border-white/20 text-center">
                      <p className="text-md font-bold">総ダメージ期待値 ({simulationRounds}ラウンド)</p>
                      <p className="text-2xl font-mono font-bold text-green-400">
                        {simulationResult.totalDamage.toLocaleString()}
                      </p>
                      <p className="text-md font-bold mt-2">総回復量</p>
                      <p className="text-2xl font-mono font-bold text-cyan-400">
                        {simulationResult.totalHealing.toLocaleString()}
                      </p>
                      <p className="text-md font-bold mt-2">総付与バリア量</p>
                      <p className="text-2xl font-mono font-bold text-blue-400">
                        {simulationResult.totalShieldGranted.toLocaleString()}
                      </p>
                      <p className="text-sm font-bold mt-2">回復量変動係数</p>
                      <p className="text-lg font-mono font-bold text-cyan-300">
                        {simulationResult.healingCoefficientOfVariation.toFixed(2)}
                      </p>
                      {/* 内訳テーブル */}
                      <div className="mt-4 text-left">
                        <h5 className="text-md font-semibold mb-2 text-center">キャラクター別内訳</h5>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th className="p-1 font-normal text-left">キャラクター</th>
                              <th className="p-1 font-normal text-right">与ダメージ</th>
                              <th className="p-1 font-normal text-right">与回復量</th>
                              <th className="p-1 font-normal text-right">付与バリア量</th>
                            </tr>
                          </thead>
                          <tbody>
                            {simulationResult.breakdown.map((charBreakdown: any, index: number) => (
                              <tr key={index} className="border-t border-white/10">
                                <td className="p-1 font-semibold">{charBreakdown.name}</td>
                                <td className="p-1 text-right font-mono">{charBreakdown.totalDamage > 0 ? charBreakdown.totalDamage.toLocaleString() : '-'}</td>
                                <td className="p-1 text-right font-mono text-cyan-400">{charBreakdown.totalHealingDone > 0 ? `+${charBreakdown.totalHealingDone.toLocaleString()}` : '-'}</td>
                                <td className="p-1 text-right font-mono text-blue-400">{charBreakdown.totalShieldGranted > 0 ? `+${charBreakdown.totalShieldGranted.toLocaleString()}` : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* 行動ログ */}
                      <div className="mt-4 text-left max-h-96 overflow-y-auto">
                        <h5 className="text-md font-semibold mb-2 text-center">行動ログ</h5>
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-800/50 backdrop-blur-sm">
                            <tr>
                              <th className="p-1 font-normal text-left">キャラ</th>
                              <th className="p-1 font-normal text-center">AV</th>
                              <th className="p-1 font-normal text-left">行動</th>
                              <th className="p-1 font-normal text-center">EP</th>
                              <th className="p-1 font-normal text-center">SP</th>
                              <th className="p-1 font-normal text-center">チャージ</th>
                              <th className="p-1 font-normal text-right">与ダメージ</th>
                              <th className="p-1 font-normal text-right">回復量</th>
                              <th className="p-1 font-normal text-right">付与バリア量</th>
                              <th className="p-1 font-normal text-right">残りHP</th>
                              <th className="p-1 font-normal text-right">最大HP</th>
                              <th className="p-1 font-normal text-right">靭性</th><th className="p-1 font-normal text-right">バリア</th>
                            </tr>
                          </thead>
                          <tbody>
                            {simulationResult.log.map((entry: any, index: number) => {
                              if (entry.name === 'System') {
                                return (
                                  <tr key={index} className="border-t border-white/10 text-xs">
                                    <td colSpan={13} className="p-1 text-center font-bold text-indigo-400 bg-indigo-500/10">{entry.action}</td>
                                  </tr>
                                );
                              }
                              return (
                                <React.Fragment key={index}>
                                  <tr className="border-t border-white/10">
                                    <td className={`p-1 text-left font-semibold ${entry.action.includes('デバフ解除') ? 'text-yellow-400' : ''}`}>{entry.name}</td>
                                    <td className="p-1 text-center font-mono">{entry.currentTime.toFixed(1)}</td>
                                    <td className="p-1">{entry.action}</td>
                                    <td className="p-1 text-center font-mono">{typeof entry.ep === 'number' ? Math.round(entry.ep) : '-'}</td>
                                    <td className="p-1 text-center font-mono">{entry.sp}</td>
                                    <td className="p-1 text-center font-mono">{typeof entry.charge === 'number' ? entry.charge : '-'}</td>
                                    <td className="p-1 text-right font-mono">{entry.damageDealt ? Math.round(entry.damageDealt).toLocaleString() : '-'}</td>
                                    <td className="p-1 text-right font-mono text-cyan-400">{entry.healingDone ? `+${Math.round(entry.healingDone).toLocaleString()}` : '-'}</td>
                                    <td className="p-1 text-right font-mono text-blue-400">{entry.shieldGranted ? `+${Math.round(entry.shieldGranted).toLocaleString()}` : (entry.shieldGranted < 0 ? Math.round(entry.shieldGranted).toLocaleString() : '-')}</td>
                                    <td className="p-1 text-right font-mono">{typeof entry.hp === 'number' ? Math.round(entry.hp).toLocaleString() : '-'}</td>
                                    <td className="p-1 text-right font-mono">{typeof entry.maxHp === 'number' ? Math.round(entry.maxHp).toLocaleString() : '-'}</td>
                                    <td className="p-1 text-right font-mono">{typeof entry.toughness === 'number' ? `${Math.round(entry.toughness)} / ${entry.maxToughness}` : '-'}</td>
                                    <td className="p-1 text-right font-mono text-blue-400">{typeof entry.shield === 'number' && entry.shield > 0 ? Math.round(entry.shield).toLocaleString() : '-'}</td>
                                  </tr>
                                  {entry.activeEffects && entry.activeEffects.length > 0 && (
                                    <tr className="border-b border-white/10">
                                      <td></td>
                                      <td colSpan={12} className="px-1 py-0.5 text-xs text-gray-400">
                                        <span className="font-bold">効果: </span>{entry.activeEffects.join(', ')}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </details>

            </div>
          )}
        </div>

        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">パーティー設定をインポート</h2>
              <p className="text-sm text-gray-400 mb-4">エクスポートしたJSONデータを以下に貼り付けてください。</p>
              <textarea
                value={importJsonString}
                onChange={(e) => setImportJsonString(e.target.value)}
                className="w-full h-64 p-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-md"
                placeholder='[{"characterId": "blade", ...}]'
              />
              <div className="mt-4 flex justify-end gap-4">
                <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-700">
                  キャンセル
                </button>
                <button onClick={handleImport} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  適用する
                </button>
              </div>
            </div>
          </div>
        )}

        {isCharImportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">キャラクター設定をインポート</h2>
              <p className="text-sm text-gray-400 mb-4">エクスポートしたキャラクターのJSONデータを以下に貼り付けてください。</p>
              <textarea
                value={importCharJsonString}
                onChange={(e) => setImportCharJsonString(e.target.value)}
                className="w-full h-64 p-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-md"
                placeholder='{"characterId": "blade", ...}'
              />
              <div className="mt-4 flex justify-end gap-4">
                <button onClick={() => setIsCharImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-700">
                  キャンセル
                </button>
                <button onClick={handleCharImport} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  適用する
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }
