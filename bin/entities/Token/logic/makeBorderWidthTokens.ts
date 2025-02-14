import { FRAME as Frame } from '../../../contracts/Figma';
import { BorderWidthTokens } from '../../../contracts/Tokens';
import { BorderWidthUnit } from '../../../contracts/Config';

import { sanitizeString } from '../../../frameworks/string/sanitizeString';

import {
  ErrorMakeBorderWidthTokensNoFrame,
  ErrorMakeBorderWidthTokensNoChildren,
  ErrorMakeBorderWidthTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma border widths into a clean object
 */
export function makeBorderWidthTokens(
  borderWidthFrame: Frame,
  borderWidthUnit: BorderWidthUnit,
  remSize: number,
  camelizeTokenNames?: boolean
): BorderWidthTokens {
  if (!borderWidthFrame) throw Error(ErrorMakeBorderWidthTokensNoFrame);
  if (!borderWidthFrame.children) throw Error(ErrorMakeBorderWidthTokensNoChildren);

  const borderWidths: Record<string, unknown> = {};
  // Only process $ prefixed elements to allow for arbitrary documentation items in the Figma frame.
  const TOKENS = borderWidthFrame.children.filter((item) => item.name.startsWith('$')).reverse();
  TOKENS.forEach((item: Frame) =>
    makeBorderWidthToken(item, borderWidths, remSize, borderWidthUnit, camelizeTokenNames)
  );

  return borderWidths;
}

function makeBorderWidthToken(
  item: Frame,
  borderWidths: Record<string, unknown>,
  remSize: number,
  borderWidthUnit: string,
  camelizeTokenNames?: boolean
) {
  if (!item.name || item.strokeWeight === undefined)
    throw Error(ErrorMakeBorderWidthTokensMissingProps);

  const NAME = sanitizeString(item.name, camelizeTokenNames);
  const BORDER_WIDTH = (() => {
    if (borderWidthUnit === 'px') return item.strokeWeight + borderWidthUnit;
    else return (item.strokeWeight as unknown as number) / remSize + borderWidthUnit;
  })();

  borderWidths[NAME] = BORDER_WIDTH;
}
