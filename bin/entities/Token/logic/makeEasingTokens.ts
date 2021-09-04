import { FRAME as Frame } from '../../../contracts/Figma';
import { EasingTokens } from '../../../contracts/Tokens';

import { camelize } from '../../../frameworks/string/camelize';

import {
  ErrorMakeEasingTokensNoFrame,
  ErrorMakeEasingTokensNoChildren,
  ErrorMakeEasingTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma easings into a clean object
 */
export function makeEasingTokens(easingFrame: Frame): EasingTokens {
  if (!easingFrame) throw Error(ErrorMakeEasingTokensNoFrame);
  if (!easingFrame.children) throw Error(ErrorMakeEasingTokensNoChildren);

  const easings: Record<string, unknown> = {};
  const TOKENS = easingFrame.children.reverse();
  TOKENS.forEach((item: Frame) => makeEasingToken(item, easings));

  return easings;
}

function makeEasingToken(item: Frame, easings: Record<string, unknown>) {
  if (!item.name || !item.characters) throw Error(ErrorMakeEasingTokensMissingProps);
  const NAME = camelize(item.name);
  easings[NAME] = item.characters.trim();
}
