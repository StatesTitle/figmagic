import { FRAME as Frame } from '../../../contracts/Figma';
import { RadiusTokens } from '../../../contracts/Tokens';
import { RadiusUnit } from '../../../contracts/Config';

import { sanitizeString } from '../../../frameworks/string/sanitizeString';
import { normalizeUnits } from '../../../frameworks/string/normalizeUnits';

import {
  ErrorMakeRadiusTokensNoFrame,
  ErrorMakeRadiusTokensNoChildren,
  ErrorMakeRadiusTokensMissingProps
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma radii into a clean object
 */
export function makeRadiusTokens(
  radiusFrame: Frame,
  radiusUnit: RadiusUnit,
  remSize: number,
  camelizeTokenNames?: boolean
): RadiusTokens {
  if (!radiusFrame) throw Error(ErrorMakeRadiusTokensNoFrame);
  if (!radiusFrame.children) throw Error(ErrorMakeRadiusTokensNoChildren);

  const cornerRadii: Record<string, unknown> = {};
  // Only process $ prefixed elements to allow for arbitrary documentation items in the Figma frame.
  const tokens = radiusFrame.children.filter((item) => item.name.startsWith('$')).reverse();
  tokens.forEach((item: Frame) =>
    makeRadiusToken(item, cornerRadii, radiusUnit, remSize, camelizeTokenNames)
  );

  return cornerRadii;
}

function makeRadiusToken(
  item: Frame,
  cornerRadii: Record<string, unknown>,
  radiusUnit: RadiusUnit,
  remSize: number,
  camelizeTokenNames?: boolean
) {
  if (!item.name) throw Error(ErrorMakeRadiusTokensMissingProps);

  const name: string = sanitizeString(item.name, camelizeTokenNames);
  const cornerRadius: string = item.cornerRadius
    ? normalizeUnits(item.cornerRadius, 'px', radiusUnit as string, remSize)
    : `0${radiusUnit}`;
  cornerRadii[name] = cornerRadius;
}
