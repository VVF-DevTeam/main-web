function formatKeyName(title: string) {
  return title
    // Remove emojis and icons (Unicode emoji ranges)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    // Remove special characters (keep only alphanumeric and spaces)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Convert to lowercase
    .toLowerCase()
}

export default formatKeyName
