import { FRAME as Frame } from '../../contracts/Figma';
import { Config } from '../../contracts/Config';
import { Token } from '../Token';
import {
  ErrorMakeColorTokensNoFrame,
  ErrorMakeColorTokensNoPrimitive,
  ErrorMakeFontTokensNoFrame
} from '../../frameworks/errors/errors';
import { makeSemanticColorTokens } from './logic/makeSemanticColorTokens';
import { makeSemanticFontTokens } from './logic/makeSemanticFontTokens';

export const makeSemanticToken = (
  token: Frame,
  tokenName: string,
  config: Config,
  primitives: []
): Token => {
  return new SemanticToken(token, tokenName, config, primitives).extract();
};

class SemanticToken extends Token {
  primitives: [];

  constructor(token: Frame, tokenName: string, config: Config, primitives: []) {
    super(token, tokenName, config);
    this.primitives = primitives;
    // Alternative to class level to primitives is to pass primitives through
    // extractTokens to getTokens. Didn't seem worth it to provide an
    // extractTokens override just to do that.
  }

  protected getTokens = (frame: Frame, name: string, config: Config): any => {
    const { camelizeTokenNames, outputFormatColors } = config;

    const tokenOperations = {
      semanticcolors: () => {
        // Get the color primitives object for the keys (i.e., token names) so we can
        // check that the primitive referenced by the semantic token exists.
        const colorPrimitives = this.primitives.find((tokenType: any) => {
          return tokenType.name === 'colors';
        });
        if (colorPrimitives === undefined) {
          throw Error(ErrorMakeColorTokensNoPrimitive);
        }
        const colorByThemes: any = {};
        if (!frame.children) throw Error(ErrorMakeColorTokensNoFrame);
        const themes = frame.children.reverse();
        themes.forEach((f: Frame) => {
          if (f.type === 'FRAME' && f.name.startsWith('theme/')) {
            colorByThemes[f.name.substring(6)] = makeSemanticColorTokens(
              f,
              outputFormatColors,
              colorPrimitives,
              camelizeTokenNames
            );
          }
        });
        return colorByThemes;
      },
      semanticdesktoptypography: () => {
        if (this.primitives === undefined) {
          throw Error(ErrorMakeColorTokensNoPrimitive);
        }
        if (!frame.children) throw Error(ErrorMakeFontTokensNoFrame);
        return makeSemanticFontTokens(frame, this.primitives, camelizeTokenNames);
      },
      semanticmobiletypography: () => {
        return makeSemanticFontTokens(frame, this.primitives, camelizeTokenNames);
      }
    };
    // @ts-ignore
    if (tokenOperations.hasOwnProperty(name)) return tokenOperations[name]();
  };
}
