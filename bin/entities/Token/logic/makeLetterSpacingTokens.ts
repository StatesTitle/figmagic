import { FRAME as Frame } from '../../../contracts/Figma';
import { LetterSpacingTokens } from '../../../contracts/Tokens';
import { LetterSpacingUnit } from '../../../contracts/Config';

import { sanitizeString } from '../../../frameworks/string/sanitizeString';

import {
  ErrorMakeLetterSpacingTokensNoFrame,
  ErrorMakeLetterSpacingTokensNoChildren,
  ErrorMakeLetterSpacingTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma letter spacings into a clean object
 *
 * Figma allows to provide (in the Figma document itself) letterSpacing in either "%" or "px".
 * The API internally converts the provided value in a number, which is the calculated value based on the font-size (no unit is provided, but the value corresponds to px)
 * Ex: if the font-size is 32px and the letterSpacing 4%, the exported value from the API will be 32 * 4 / 100 = 1.28.
 * In CSS however, the letter-spacing length allows either "px" or "em" units (or even "rem" even though it hardly make any sense for letter-spacing in practice):
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
 *
 */
// TODO: Refactor
export function makeLetterSpacingTokens(
  letterSpacingFrame: Frame,
  letterSpacingUnit: LetterSpacingUnit,
  camelizeTokenNames?: boolean
): LetterSpacingTokens {
  if (!letterSpacingFrame) throw Error(ErrorMakeLetterSpacingTokensNoFrame);
  if (!letterSpacingFrame.children) throw Error(ErrorMakeLetterSpacingTokensNoChildren);

  // Only process $ prefixed elements to allow for arbitrary documentation items in the Figma frame.
  const TOKENS = letterSpacingFrame.children.filter((item) => item.name.startsWith('$')).reverse();

  const letterSpacings = TOKENS.reduce((tokens: { [index: string]: any }, item: Frame) => {
    if (!item.name || !item.style) throw Error(ErrorMakeLetterSpacingTokensMissingProps);

    const NAME = sanitizeString(item.name, camelizeTokenNames);

    /**
     * Assuming Figma API always export the node font-size as an integer in our case
     * @see https://www.figma.com/plugin-docs/api/TextNode/#fontsize
     */
    const FONT_SIZE = item.style.fontSize;
    const LETTER_SPACING_VALUE_IN_PX =
      typeof item.style.letterSpacing !== 'undefined'
        ? Math.round(item.style.letterSpacing * 1000) / 1000
        : 0;
    let value = '0';

    switch (letterSpacingUnit) {
      case 'px':
        value = `${LETTER_SPACING_VALUE_IN_PX}px`;
        break;
      case 'em':
      default:
        if (!FONT_SIZE) {
          throw Error(ErrorMakeLetterSpacingTokensMissingProps);
        }
        /**
         * Dividing the value by the current FONT_SIZE will give the %-based em value.
         * Ex: if the letterSpacing value is 1.28 and FONT_SIZE is 32, em value should be 1.28 / 32 = 0.04em.
         */
        const valueCalc = Math.round((10000 * LETTER_SPACING_VALUE_IN_PX) / FONT_SIZE) / 10000;
        value = `${valueCalc}em`;
        break;
    }

    tokens[NAME] = value;

    return tokens;
  }, {});

  return letterSpacings;
}
