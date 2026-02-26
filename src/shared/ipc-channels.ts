export const IPC_CHANNELS = {
  // 錄音相關 (Main → Renderer)
  RECORDING_START: 'recording:start',
  RECORDING_STOP: 'recording:stop',
  RECORDING_CANCEL: 'recording:cancel',

  // 音訊處理 (Renderer → Main)
  AUDIO_PROCESS: 'audio:process',

  // 設定 (雙向)
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_GET_ALL: 'config:get-all',

  // 歷史紀錄 (Renderer → Main)
  HISTORY_LIST: 'history:list',
  HISTORY_DELETE: 'history:delete',
  HISTORY_SEARCH: 'history:search',
  HISTORY_EXPORT: 'history:export',

  // 字典 (Renderer → Main)
  DICT_LIST: 'dict:list',
  DICT_ADD: 'dict:add',
  DICT_REMOVE: 'dict:remove',
  DICT_IMPORT: 'dict:import',

  // 貼上 (Renderer → Main)
  PASTE_TEXT: 'paste:text',

  // 統計 (Renderer → Main)
  STATS_GET: 'stats:get'
} as const
