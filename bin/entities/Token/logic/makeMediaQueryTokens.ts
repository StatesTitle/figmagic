import { FRAME as Frame } from '../../../contracts/Figma';
import { MediaQueryTokens } from '../../../contracts/Tokens';
import { MediaQueryUnit } from '../../../contracts/Config';
import { sanitizeString } from '../../../frameworks/string/sanitizeString';

import {
  ErrorSetupMediaQueryTokensNoFrame,
  ErrorSetupMediaQueryTokensNoChildren,
  ErrorSetupMediaQueryTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma media queries into a clean object
 */
export function makeMediaQueryTokens(
  mediaQueryFrame: Frame,
	remSize: number,
	mediaQueryUnit?: MediaQueryUnit,
  camelizeTokenNames?: boolean
): MediaQueryTokens {
  if (!mediaQueryFrame) throw Error(ErrorSetupMediaQueryTokensNoFrame);
  if (!mediaQueryFrame.children) throw Error(ErrorSetupMediaQueryTokensNoChildren);

  const mediaQueries: Record<string, unknown> = {};
  const TOKENS = mediaQueryFrame.children.reverse();
  TOKENS.forEach((item: Frame) => makeMediaQueryToken(item, mediaQueries, 
		remSize, mediaQueryUnit, camelizeTokenNames));

  return mediaQueries;
}

function makeMediaQueryToken(
  item: Frame,
  mediaQueries: Record<string, unknown>,
	remSize: number,
	mediaQueryUnit?: MediaQueryUnit,
  camelizeTokenNames?: boolean
) {
  if (!item.name || !item.absoluteBoundingBox) throw Error(ErrorSetupMediaQueryTokensMissingProps);

  const NAME = sanitizeString(item.name, camelizeTokenNames);
	let mqunit:string = (mediaQueryUnit) ? mediaQueryUnit : "px";
	const breakpoint:number = (item.absoluteBoundingBox.width) ? item.absoluteBoundingBox.width : 0;
	if (mqunit==="rem")	{
		mediaQueries[NAME] = `${breakpoint/remSize}${mqunit}`;
	}
	else {
		mediaQueries[NAME] = `${breakpoint}${mqunit}`;
	}
}