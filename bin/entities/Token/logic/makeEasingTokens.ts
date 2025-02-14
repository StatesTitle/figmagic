import { FRAME as Frame } from '../../../contracts/Figma';
import { EasingTokens } from '../../../contracts/Tokens';

import { sanitizeString } from '../../../frameworks/string/sanitizeString';

import {
  ErrorMakeEasingTokensNoFrame,
  ErrorMakeEasingTokensNoChildren,
  ErrorMakeEasingTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma easings into a clean object
 */
export function makeEasingTokens(easingFrame: Frame, camelizeTokenNames?: boolean): EasingTokens {
  if (!easingFrame) throw Error(ErrorMakeEasingTokensNoFrame);
  if (!easingFrame.children) throw Error(ErrorMakeEasingTokensNoChildren);

  const easings: Record<string, unknown> = {};
  // Only process $ prefixed elements to allow for arbitrary documentation items in the Figma frame.
  const TOKENS = easingFrame.children.filter((item) => item.name.startsWith('$')).reverse();
  TOKENS.forEach((item: Frame) => makeEasingToken(item, easings, camelizeTokenNames));

  return easings;
}

function makeEasingToken(
  item: Frame,
  easings: Record<string, unknown>,
  camelizeTokenNames?: boolean
) {
  if (!item.name || !item.characters) throw Error(ErrorMakeEasingTokensMissingProps);
  const NAME = sanitizeString(item.name, camelizeTokenNames);
  easings[NAME] = item.characters.trim();
}
