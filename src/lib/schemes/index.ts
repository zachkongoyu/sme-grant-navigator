import type { Scheme } from '@/types';

import { budEcommerceEasyScheme } from './bud-ecommerce-easy';
import { budGeneralScheme } from './bud-general';
import { createSmartScheme } from './createsmart';
import { easyBudScheme } from './easy-bud';
import { hkstpScheme } from './hkstp';
import { itfScheme } from './itf';
import { sampleSchemes } from './sample-schemes';

export const schemes = [
  easyBudScheme,
  budGeneralScheme,
  budEcommerceEasyScheme,
  itfScheme,
  hkstpScheme,
  createSmartScheme,
  ...sampleSchemes,
] as const satisfies ReadonlyArray<Scheme>;