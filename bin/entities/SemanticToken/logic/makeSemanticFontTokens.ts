import { FRAME as Frame } from '../../../contracts/Figma';
import { FontTokens } from '../../../contracts/Tokens';
// import { OutputFormatColors } from '../../../contracts/Config';
import { sanitizeString } from '../../../frameworks/string/sanitizeString';
// import { createSolidColorString } from '../../../frameworks/string/createSolidColorString';
import {
  ErrorMakeFontTokensNoFrame,
  ErrorMakeFontTokensNoChildren
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma color frames into a clean object
 */
export function makeSemanticFontTokens(
  fontFrame: Frame,
  primitives: [],
  //   outputFormatColors: OutputFormatColors,
  camelizeTokenNames?: boolean
): FontTokens {
  if (!fontFrame) throw Error(ErrorMakeFontTokensNoFrame);
  if (!fontFrame.children) throw Error(ErrorMakeFontTokensNoChildren);

  const typography: Record<string, unknown> = {};
  const TOKENS = fontFrame.children.reverse();
  //Only process $ prefaced items
  TOKENS.forEach((item: Frame) => {
    if (item.name.startsWith('$')) {
      makeSemFontToken(item, typography, primitives, fontFrame.name);
    }
  });
  return typography;
}

function makeSemFontToken(
  item: Frame,
  typography: Record<string, unknown>,
  primitives: [],
  fontFrameName: string,
  //outputFormatColors: OutputFormatColors,
  camelizeTokenNames?: boolean
) {
  function getKeyByValue(object: any, value: string): string | undefined {
    return Object.keys(object).find((key) => object[key] === value);
  }

  function getTokenFile(name: string): any {
    const tokenStruct: any = primitives.find((f: any) => {
      return f.name === name;
    });
    return tokenStruct;
  }

  if (!item.fills || item.fills.length === 0) return null;
  //NAME is the item name.
  const NAME = sanitizeString(item.name, camelizeTokenNames);
  const STYLE = item.style;
  //   const FILLS = item.fills[0];

  //   const colors = getTokenFile('colors');
  const fonts = getTokenFile('fontFamilies');
  const weights = getTokenFile('fontWeights');
  const sizes = getTokenFile(
    fontFrameName.toLocaleLowerCase().includes('mobile') ? 'mobileFontSizes' : 'fontSizes'
  );
  const lineHeights = getTokenFile('lineHeights');
  const letterSpacings = getTokenFile('letterSpacings');

  // A type style includes a number of properties that each should be referencing
  // the appropriate primitive token.

  // Get the text color
  //   if (item.fills[0].type === 'SOLID') {
  //     const colorVal = createSolidColorString(FILLS, outputFormatColors);
  //     let colorKey = getKeyByValue(colors.file, colorVal);
  //     if (colorKey !== undefined) {
  //       typography[NAME + 'Color'] = `${colors.name}.${colorKey}`;
  //     }
  //   }

  // Create size token reference
  // Go to REM; do not assume 16px; this needs config somewhere
  const sizeVal = (STYLE.fontSize / 16).toString() + 'rem';
  let sizeKey = getKeyByValue(sizes.file, sizeVal);
  if (sizeKey !== undefined) {
    typography[NAME + 'Size'] = `${sizes.name}.${sizeKey}`;
  }

  // Create font family token reference
  let fontKey = getKeyByValue(fonts.file, STYLE.fontFamily);
  if (fontKey !== undefined) {
    typography[NAME + 'Font'] = `${fonts.name}.${fontKey}`;
  }

  // Create font weights token reference
  let weightsKey = getKeyByValue(weights.file, STYLE.fontWeight);
  if (weightsKey !== undefined) {
    typography[NAME + 'Weight'] = `${weights.name}.${weightsKey}`;
  }

  // Create line height token reference
  let heightsKey = getKeyByValue(
    lineHeights.file,
    (STYLE.lineHeightPercentFontSize / 100).toPrecision(3).toString()
  );
  if (heightsKey !== undefined) {
    typography[NAME + 'LineHeight'] = `${lineHeights.name}.${heightsKey}`;
  }

  // Create letter spacing token reference
  // (assuming 'regular' as the key for 0em spacing. will need to change if the figma changes)
  let letterSpacingsKey = getKeyByValue(letterSpacings.file, STYLE.letterSpacing);
  typography[NAME + 'LetterSpacing'] = `${letterSpacings.name}.${
    letterSpacingsKey !== undefined ? letterSpacingsKey : 'regular'
  }`;
}
