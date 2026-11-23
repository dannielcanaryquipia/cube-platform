// The cube theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in cube.settings.json and the generated cube.settings.ts;
// change them with `astryx experimental theme editor set cube ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {cubeSettings} from './cube.settings';

export const cubeTheme = defineTheme({
  extends: cubeSettings,
  name: 'cube',
});
