import type { CombatState, CombatCreature, Tactic, BattleResult, StatusEffectType } from '@/data/types/CombatTypes';
import { CombatAI } from './CombatAI';
import { AttackResolver } from './AttackResolver';

export class CombatEngine {
  private state: CombatState;
  private ai: CombatAI;
  private resolver: AttackResolver;

  constructor(
    playerCreature: CombatCreature,
    enemyCreature: CombatCreature,
    private onStateChange?: (state: CombatState) => void,
  ) {
    this.ai = new CombatAI();
    this.resolver = new AttackResolver();
    this.state = this.createInitialState(playerCreature, enemyCreature);
  }

  createInitialState(player: CombatCreature, enemy: CombatCreature): CombatState {
    const playerRoll = player.stats.spd + Math.random() * 5;
    const enemyRoll = enemy.stats.spd + Math.random() * 5;
    return {
      phase: 'init',
      playerCreature: player,
      enemyCreature: enemy,
      turnOrder: playerRoll >= enemyRoll ? 'player' : 'enemy',
      roundNumber: 1,
      selectedTactic: null,
      battleLog: [],
      isPaused: false,
      rewards: [],
      timeSkipped: 15,
    };
  }

  start() {
    this.transitionTo('start');
  }

  selectTactic(tactic: Tactic) {
    if (this.state.phase !== 'player') return;
    this.state.selectedTactic = tactic;
    this.transitionTo('tacticSelected');
    this.processPlayerTurn();
  }

  processPlayerTurn() {
    this.transitionTo('creatureAI');
    const effectiveTactic = this.ai.decideTactic(
      this.state.selectedTactic!,
      this.state.playerCreature,
    );

    this.transitionTo('attackChosen');
    const attack = this.ai.selectAttack(
      effectiveTactic,
      this.state.playerCreature,
    );

    this.transitionTo('resolve');
    const result = this.resolver.resolveAttack(
      this.state.playerCreature,
      this.state.enemyCreature,
      attack,
    );

    this.applyResult(result, 'player');

    this.transitionTo('checkWin');
    if (this.state.enemyCreature.currentHp <= 0) {
      this.transitionTo('victory');
      this.generateRewards();
      return;
    }

    this.processEnemyTurn();
  }

  processEnemyTurn() {
    this.transitionTo('enemyTurn');
    const attack = this.ai.selectEnemyAttack(this.state.enemyCreature);
    const result = this.resolver.resolveAttack(
      this.state.enemyCreature,
      this.state.playerCreature,
      attack,
    );

    this.applyResult(result, 'enemy');

    if (this.state.playerCreature.currentHp <= 0) {
      this.transitionTo('defeat');
      return;
    }

    this.state.roundNumber++;
    this.state.selectedTactic = null;
    this.transitionTo('player');
  }

  transitionTo(phase: CombatState['phase']) {
    this.state.phase = phase;
    this.onStateChange?.(this.state);
  }

  applyResult(result: import('./AttackResolver').AttackResult, actor: 'player' | 'enemy') {
    const target = actor === 'player' ? this.state.enemyCreature : this.state.playerCreature;
    const attacker = actor === 'player' ? this.state.playerCreature : this.state.enemyCreature;

    if (result.isHit) {
      target.currentHp = Math.max(0, target.currentHp - result.damage);

      const actionVerb = result.isCrit ? 'critical hit' : 'hit';
      this.state.battleLog.push({
        timestamp: Date.now(),
        actor,
        action: actionVerb,
        description: `${attacker.name} ${actionVerb} ${target.name} for ${result.damage} damage`,
        damage: result.damage,
      });
    } else {
      this.state.battleLog.push({
        timestamp: Date.now(),
        actor,
        action: 'miss',
        description: `${attacker.name}'s attack missed`,
      });
    }

    if (result.recoilDamage > 0) {
      attacker.currentHp = Math.max(0, attacker.currentHp - result.recoilDamage);
      this.state.battleLog.push({
        timestamp: Date.now(),
        actor,
        action: 'recoil',
        description: `${attacker.name} took ${result.recoilDamage} recoil damage`,
        damage: result.recoilDamage,
      });
    }

    for (const effect of result.effectsApplied) {
      this.state.battleLog.push({
        timestamp: Date.now(),
        actor,
        action: 'statusEffect',
        description: `${target.name} was afflicted with ${effect}`,
        statusEffect: effect as StatusEffectType,
      });
    }
  }

  generateRewards() {
    this.state.rewards = [];
  }

  getResult(): BattleResult {
    const isVictory = this.state.phase === 'victory';
    return {
      winner: isVictory ? 'player' : 'enemy',
      rewards: this.state.rewards,
      flags: [],
      timeSkipped: this.state.timeSkipped,
      careMistake: this.state.phase === 'defeat',
    };
  }

  getState(): CombatState {
    return this.state;
  }
}
