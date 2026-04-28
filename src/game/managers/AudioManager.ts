import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private masterVolume = 1;
  private musicVolume = 0.5;
  private sfxVolume = 0.8;
  private currentMusic?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playMusic(key: string, loop = true, fadeMs = 1000): void {
    if (this.currentMusic && 'stop' in this.currentMusic) {
      this.currentMusic.stop();
    }

    try {
      const music = this.scene.sound.add(key, {
        loop,
        volume: this.masterVolume * this.musicVolume,
      });

      if (music instanceof Phaser.Sound.WebAudioSound) {
        music.play();
        music.setVolume(0);
        this.scene.tweens.add({
          targets: { v: 0 },
          v: this.masterVolume * this.musicVolume,
          duration: fadeMs,
          onUpdate: (_tween, target) => music.setVolume(target.v),
        });
      }

      this.currentMusic = music;
    } catch {
      // Sound key may not exist in MVP
    }
  }

  playSFX(key: string, volume?: number): void {
    try {
      this.scene.sound.play(key, {
        volume: (volume ?? this.sfxVolume) * this.masterVolume,
      });
    } catch {
      // Sound key may not exist in MVP
    }
  }

  stopMusic(fadeMs = 500): void {
    if (this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
      const start = this.currentMusic.volume;
      this.scene.tweens.add({
        targets: { v: start },
        v: 0,
        duration: fadeMs,
        onUpdate: (_tween, target) => {
          if (this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
            this.currentMusic.setVolume(target.v);
          }
        },
        onComplete: () => {
          if (this.currentMusic && 'stop' in this.currentMusic) {
            this.currentMusic.stop();
          }
          this.currentMusic = undefined;
        },
      });
    }
  }

  setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
      this.currentMusic.setVolume(this.masterVolume * this.musicVolume);
    }
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
      this.currentMusic.setVolume(this.masterVolume * this.musicVolume);
    }
  }

  setSFXVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted: boolean): void {
    this.scene.sound.setMute(muted);
  }

  get isMusicPlaying(): boolean {
    return this.currentMusic !== undefined;
  }
}
