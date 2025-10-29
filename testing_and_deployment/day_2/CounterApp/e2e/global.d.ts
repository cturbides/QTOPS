import type { DetoxCircusEnvironment, DetoxCircusListener } from 'detox/runners/jest-circus';

declare global {
  var device: DetoxCircusEnvironment['device'];
  var element: DetoxCircusEnvironment['element'];
  var expect: DetoxCircusEnvironment['expect'];
  var by: DetoxCircusEnvironment['by'];
  var waitFor: DetoxCircusEnvironment['waitFor'];
}

export {};
