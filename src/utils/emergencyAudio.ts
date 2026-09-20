// Web Audio API emergency acoustic synthesizer
// Provides browser-compatible audio generation for marine hazard sirens,
// emergency evacuation alerts, and notification chimes without external mp3 dependencies.

class EmergencyAudioEngine {
  private ctx: AudioContext | null = null;
  private currentSirenNodes: {
    osc: OscillatorNode;
    gain: GainNode;
    modOsc?: OscillatorNode;
    modGain?: GainNode;
    intervalId?: any;
  } | null = null;

  private isMuted: boolean = false;
  private currentSirenType: 'HIGH' | 'EXTREME' | null = null;

  constructor() {
    try {
      const savedMute = localStorage.getItem('wave_emergency_muted');
      this.isMuted = savedMute === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    return this.ctx;
  }

  public isBlocked(): boolean {
    const ctx = this.getContext();
    return ctx ? ctx.state === 'suspended' : false;
  }

  public async unlock(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return ctx.state === 'running';
    } catch (e) {
      console.warn('Audio unlock failed:', e);
      return false;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('wave_emergency_muted', String(muted));
    } catch {}

    if (muted) {
      this.stopSiren();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * SIREN FEATURE REMOVED PER EXPLICIT USER MANDATE.
   * Emergency High-Risk Siren Sound is completely disabled.
   * Replaced by Multilingual Coastal Emergency Public Announcement Voice Alert System.
   */
  public playHighWarningSiren(): void {
    // Intentionally disabled - Siren removed completely
    console.log('[AudioEngine] Siren sound removed per emergency broadcast mandate.');
  }

  /**
   * SIREN FEATURE REMOVED PER EXPLICIT USER MANDATE.
   * Emergency High-Risk Siren Sound is completely disabled.
   * Replaced by Multilingual Coastal Emergency Public Announcement Voice Alert System.
   */
  public playExtremeSiren(): void {
    // Intentionally disabled - Siren removed completely
    console.log('[AudioEngine] Siren sound removed per emergency broadcast mandate.');
  }

  /**
   * Short Notification Chime (for in-app toasts & alert popups)
   */
  public playNotificationSound(severity: 'info' | 'caution' | 'warning' | 'danger' = 'warning'): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (severity === 'danger') {
        // Urgent 3-tone chime for EXTREME/CRITICAL
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174, now + 0.12);
        osc.frequency.setValueAtTime(1480, now + 0.24);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.56);
      } else if (severity === 'warning') {
        // 2-tone warning chime for HIGH
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659, now);
        osc.frequency.setValueAtTime(880, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);
      } else {
        // Subtle single chime for MODERATE/Caution
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (err) {
      console.warn('Notification chime failed:', err);
    }
  }

  /**
   * Public Address (PA) Loudspeaker Attention Chime
   * Classic two-tone chime (High -> Low: 880Hz -> 587Hz) broadcast over beach horn towers
   */
  public playPADingDongChime(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted) {
        resolve();
        return;
      }
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        // First tone (High: 880 Hz - A5)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.28, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.46);

        // Second tone (Low: 587 Hz - D5)
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(587.33, now + 0.38);
        gain2.gain.setValueAtTime(0.32, now + 0.38);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.38);
        osc2.stop(now + 0.96);

        setTimeout(() => {
          resolve();
        }, 1000);
      } catch (err) {
        console.warn('PA Chime failed:', err);
        resolve();
      }
    });
  }

  /**
   * VHF Marine Radio Channel 16 Distress Alert Tone & Squelch
   * High-intensity maritime radio broadcast tone (1050 Hz + 156.8 MHz simulated transmission burst)
   */
  public playRadioTransmissionBeep(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted) {
        resolve();
        return;
      }
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Standard maritime VHF emergency tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1050, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);

        setTimeout(() => {
          resolve();
        }, 400);
      } catch (err) {
        console.warn('Radio beep failed:', err);
        resolve();
      }
    });
  }

  public stopSiren(): void {
    this.currentSirenType = null;
    this.stopSirenNodes();
  }

  public stopTone(): void {
    this.stopSiren();
  }

  private stopSirenNodes(): void {
    if (this.currentSirenNodes) {
      try {
        if (this.currentSirenNodes.intervalId) {
          clearInterval(this.currentSirenNodes.intervalId);
        }
        if (this.currentSirenNodes.modOsc) {
          this.currentSirenNodes.modOsc.stop();
          this.currentSirenNodes.modOsc.disconnect();
        }
        this.currentSirenNodes.osc.stop();
        this.currentSirenNodes.osc.disconnect();
        this.currentSirenNodes.gain.disconnect();
      } catch {
        // already stopped
      }
      this.currentSirenNodes = null;
    }
  }
}

export const emergencyAudio = new EmergencyAudioEngine();
