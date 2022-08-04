import { FRAME as Frame } from '../../../contracts/Figma';
import { MediaQueryTokens } from '../../../contracts/Tokens';
import { MediaQueryUnit } from '../../../contracts/Config';
export declare function makeMediaQueryTokens(mediaQueryFrame: Frame, remSize: number, mediaQueryUnit?: MediaQueryUnit, camelizeTokenNames?: boolean): MediaQueryTokens;
