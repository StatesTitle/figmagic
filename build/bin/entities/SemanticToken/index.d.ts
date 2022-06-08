import { FRAME as Frame } from '../../contracts/Figma';
import { Config } from '../../contracts/Config';
import { Token } from '../Token';
export declare const makeSemanticToken: (token: Frame, tokenName: string, config: Config, primitives: []) => Token;
