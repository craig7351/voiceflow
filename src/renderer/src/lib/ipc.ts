const api = window.api

export const ipc = {
  processAudio: api.processAudio,
  pasteText: api.pasteText,
  getConfig: api.getConfig,
  setConfig: api.setConfig,
  getAllConfig: api.getAllConfig,
  getHistory: api.getHistory,
  searchHistory: api.searchHistory,
  deleteHistory: api.deleteHistory,
  exportHistory: api.exportHistory,
  getDictionary: api.getDictionary,
  addWord: api.addWord,
  removeWord: api.removeWord,
  importWords: api.importWords,
  getStats: api.getStats,
  getTemplates: api.getTemplates,

  onRecordingStart: api.onRecordingStart,
  onRecordingStop: api.onRecordingStop,
  onRecordingCancel: api.onRecordingCancel,
  removeRecordingListeners: api.removeRecordingListeners
}
