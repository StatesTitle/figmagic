import { GetFileDataOperation, FileContentWithPath } from '../../contracts/Write';
import {
  PrepComponent,
  PrepCss,
  PrepDescription,
  PrepStorybook,
  PrepStyledComponents,
  PrepGraphicComponent
} from '../../contracts/PrepFile';
import { ProcessedToken } from '../../contracts/ProcessedToken';

import {
  prepComponent,
  prepStyledComponents,
  prepCss,
  prepStorybook,
  prepDescription,
  prepGraphicComponent
} from './prepFile';

import { createEnumStringOutOfObject } from '../../frameworks/string/createEnumStringOutOfObject';

import { MsgGeneratedFileWarning } from '../messages/messages';
import {
  ErrorGetFileContentAndPath,
  ErrorGetFileContentAndPathMissingFields,
  ErrorGetFileContentAndPathNoReturn
} from '../errors/errors';
import util from 'util';

/**
 * Orchestrator to get file content and path, before writing files
 */
export function getFileContentAndPath(
  getFileContentAndPathOperation: GetFileDataOperation
):
  | FileContentWithPath
  | Record<string, string>
  | PrepComponent
  | PrepStyledComponents
  | PrepCss
  | PrepStorybook
  | PrepDescription {
  try {
    if (!getFileContentAndPathOperation) throw Error(ErrorGetFileContentAndPath);
    if (!checkIfFieldsExist(getFileContentAndPathOperation))
      throw Error(ErrorGetFileContentAndPathMissingFields);

    const {
      type,
      file,
      path,
      name,
      format,
      text,
      element,
      imports,
      extraProps,
      metadata,
      templates
    } = getFileContentAndPathOperation;

    let filePath = `${path}/${name}`;

    const fileOperations = {
      raw: () => {
        return { fileContent: `${JSON.stringify(file, null, ' ')}`, filePath };
      },
      token: () => {
        if (metadata && metadata.dataType === 'enum')
          return { fileContent: getTokenString(file, name, format, metadata.dataType), filePath };
        filePath += `.${format}`;
        if (name.startsWith('semantic')) {
          return { fileContent: getSemanticTokenString(file, name, format), filePath };
        } else {
          //Otherwise primitive token
          return { fileContent: getTokenString(file, name, format), filePath };
        }
      },
      component: () => {
        if (type === 'component' && templates)
          return prepComponent({
            name,
            filePath,
            format,
            templates,
            text,
            extraProps,
            element
          } as PrepComponent);
      },
      styled: () => {
        if (type === 'styled' && templates)
          return prepStyledComponents({
            name,
            filePath,
            format,
            templates,
            element
          } as PrepStyledComponents);
      },
      story: () => {
        if (type === 'story' && templates)
          return prepStorybook({ name, filePath, format, templates, text } as PrepStorybook);
      },
      css: () => prepCss({ name, filePath, format, imports, file } as PrepCss),
      description: () => prepDescription({ filePath, file, format } as PrepDescription),
      graphic: () =>
        prepGraphicComponent({
          name,
          filePath,
          format,
          templates,
          file
        } as PrepGraphicComponent)
    };

    // @ts-ignore
    if (fileOperations.hasOwnProperty(type)) return fileOperations[type]();
    else throw Error(ErrorGetFileContentAndPathNoReturn);
  } catch (error: any) {
    throw Error(error);
  }
}

/**
 * @description Add trailing comma to token objects
 */
const addTrailingComma = (dataString: string) => dataString.replace(/\n}/, ',\n}');

/**
 * @description Get file data string for tokens using either null/no data type or enum data type
 */
const getTokenString = (
  file: string | ProcessedToken,
  name: string,
  format: string,
  dataType?: string
) => {
  if (format === 'json') return `${JSON.stringify(file, null, ' ')}`;

  const EXPORT = format === 'js' ? `module.exports = ${name};\n` : ``;

  if (dataType === 'enum') {
    return `// ${MsgGeneratedFileWarning}\n\nenum ${name} {${createEnumStringOutOfObject(
      file
    )}\n}\n${EXPORT};`;
  }

  const CONST_ASSERTION = format === 'ts' ? ' as const' : '';
  const DATA = addTrailingComma(util.inspect(file));

  // In order to support semantic tokens, need to switch from using JSON.stringify to util.inspect
  // so that output is a primitive token reference as opposed to a quoted string of the token name
  return `// ${MsgGeneratedFileWarning}\n\nexport const ${name} = ${DATA}${CONST_ASSERTION}\n${EXPORT}`;
};

// https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
const getSemanticTokenString = (file: string | ProcessedToken, name: string, format: string) => {
  const CONST_ASSERTION = format === 'ts' ? ' as const' : '';
  const EXPORT = format === 'js' ? `module.exports = ${name}\n` : ``;
  // For typography there could be several imports required since the styled
  // element in Figma will be composed of several tokens.
  let output = '';
  const importStatements: string[] = [];
  switch (name) {
    case 'semanticColors':
      importStatements.push("import { colors } from './colors'\n");
      break;
    case 'semanticMobileTypography':
      importStatements.push("import { fontFamilies } from './fontFamilies'\n");
      importStatements.push("import { mobileFontSizes } from './mobileFontSizes'\n");
      importStatements.push("import { fontWeights } from './fontWeights'\n");
      importStatements.push("import { letterSpacings } from './letterSpacings'\n");
      importStatements.push("import { lineHeights } from './lineHeights'\n");
      break;
    case 'semanticDesktopTypography':
    case 'semanticTabletTypography':
      importStatements.push("import { fontFamilies } from './fontFamilies'\n");
      importStatements.push("import { fontSizes } from './fontSizes'\n");
      importStatements.push("import { fontWeights } from './fontWeights'\n");
      importStatements.push("import { letterSpacings } from './letterSpacings'\n");
      importStatements.push("import { lineHeights } from './lineHeights'\n");
      break;
  }
  output += `// ${MsgGeneratedFileWarning}\n\n`;
  importStatements.forEach((statement) => (output += statement));
  // Stackoverflow mentions utill is a debugging lib and the output string may be
  // subject to change.
  let jsonObj: string = util.inspect(file);

  // Strip surrounding quotes from property values to arrive at variable
  // references for the property
  const matches = jsonObj.match(/'/gm);
  matches?.forEach((m) => {
    jsonObj = jsonObj.replace(m, '');
  });
  const data = addTrailingComma(jsonObj);
  output += `\nexport const ${name} = ${data}${CONST_ASSERTION}\n${EXPORT}`;
  return output;
};

/**
 * @description Validate whether required fields exist on GetFileDataOperation type
 */
const checkIfFieldsExist = (getFileContentAndPathOperation: GetFileDataOperation): boolean => {
  if (
    !getFileContentAndPathOperation.type ||
    !getFileContentAndPathOperation.file ||
    !getFileContentAndPathOperation.path ||
    !getFileContentAndPathOperation.name ||
    !getFileContentAndPathOperation.format ||
    !getFileContentAndPathOperation.element
  )
    return false;
  return true;
};
