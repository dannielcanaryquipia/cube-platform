export type TwistyCommand = {
  seq: number;
  name: 'play' | 'pause' | 'toggle' | 'reset' | 'jump' | 'step' | 'speed' | 'end' | 'idle';
  arg?: number;
};
