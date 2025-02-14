import { FRAME as Frame } from '../../../contracts/Figma';
import { DelayTokens } from '../../../contracts/Tokens';

import { sanitizeString } from '../../../frameworks/string/sanitizeString';

import {
  ErrorMakeDelayTokensNoFrame,
  ErrorMakeDelayTokensNoChildren,
  ErrorMakeDelayTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma delays into a clean object
 */
export function makeDelayTokens(delayFrame: Frame, camelizeTokenNames?: boolean): DelayTokens {
  if (!delayFrame) throw Error(ErrorMakeDelayTokensNoFrame);
  if (!delayFrame.children) throw Error(ErrorMakeDelayTokensNoChildren);

  const delays: Record<string, unknown> = {};
  // Only process $ prefixed elements to allow for arbitrary documentation items in the Figma frame.
  const TOKENS = delayFrame.children.filter((item) => item.name.startsWith('$')).reverse();
  TOKENS.forEach((item: Frame) => makeDelayToken(item, delays, camelizeTokenNames));

  return delays;
}

function makeDelayToken(
  item: Frame,
  delays: Record<string, unknown>,
  camelizeTokenNames?: boolean
) {
  if (!item.name || !item.characters) throw Error(ErrorMakeDelayTokensMissingProps);
  const NAME = sanitizeString(item.name, camelizeTokenNames);
  delays[NAME] = parseFloat(item.characters);
}
