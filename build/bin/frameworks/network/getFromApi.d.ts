import { ImageResponse } from '../../contracts/ImageResponse';
export declare function getFromApi(figmaToken: string, figmaUrl: string, versionName?: string | null, type?: string): Promise<ImageResponse>;
