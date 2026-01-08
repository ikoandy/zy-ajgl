// 文件类型映射表，用于统一管理文件类型

// 文件扩展名到MIME类型的映射
export const EXTENSION_TO_MIME: Record<string, string> = {
  // 文档类型
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  rtf: 'application/rtf',
  csv: 'text/csv',
  md: 'text/markdown',
  html: 'text/html',
  xml: 'application/xml',
  json: 'application/json',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  
  // 图片类型
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  
  // 音频类型
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  
  // 视频类型
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  webm: 'video/webm',
  
  // 压缩文件类型
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  bz2: 'application/x-bzip2',
};

// MIME类型到文件类型的映射
export const MIME_TO_TYPE: Record<string, string> = {
  // 文档类型
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPT',
  'text/plain': '文本',
  'application/rtf': 'RTF',
  'text/csv': 'CSV',
  'text/markdown': 'Markdown',
  'text/html': 'HTML',
  'application/xml': 'XML',
  'application/json': 'JSON',
  'text/yaml': 'YAML',
  
  // 图片类型
  'image/jpeg': '图片',
  'image/png': '图片',
  'image/gif': '图片',
  'image/bmp': '图片',
  'image/svg+xml': '图片',
  'image/webp': '图片',
  'image/tiff': '图片',
  
  // 音频类型
  'audio/mpeg': '音频',
  'audio/wav': '音频',
  'audio/ogg': '音频',
  'audio/mp4': '音频',
  
  // 视频类型
  'video/mp4': '视频',
  'video/x-msvideo': '视频',
  'video/quicktime': '视频',
  'video/x-ms-wmv': '视频',
  'video/x-flv': '视频',
  'video/webm': '视频',
  
  // 压缩文件类型
  'application/zip': '压缩文件',
  'application/x-rar-compressed': '压缩文件',
  'application/x-7z-compressed': '压缩文件',
  'application/x-tar': '压缩文件',
  'application/gzip': '压缩文件',
  'application/x-bzip2': '压缩文件',
};

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
};

// 根据文件名获取MIME类型
export const getMimeTypeFromFilename = (filename: string): string => {
  const ext = getFileExtension(filename);
  return EXTENSION_TO_MIME[ext] || 'application/octet-stream';
};

// 根据MIME类型获取文件类型名称
export const getFileTypeFromMime = (mime: string): string => {
  return MIME_TO_TYPE[mime] || '其他';
};

// 根据文件名获取文件类型名称
export const getFileTypeFromFilename = (filename: string): string => {
  const mime = getMimeTypeFromFilename(filename);
  return getFileTypeFromMime(mime);
};

// 验证文件类型是否允许
export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const ext = getFileExtension(filename);
  const mime = getMimeTypeFromFilename(filename);
  
  // 检查扩展名是否在允许列表中
  if (allowedTypes.includes(ext)) return true;
  
  // 检查MIME类型是否在允许列表中
  const fileType = getFileTypeFromMime(mime);
  if (allowedTypes.includes(fileType)) return true;
  
  return false;
};
