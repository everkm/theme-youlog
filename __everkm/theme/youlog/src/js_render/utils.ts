import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param timestamp 时间戳（秒）
 * @param format 格式化字符串，默认 'YYYY-MM-DD'
 */
export function formatDate(timestamp: number | undefined, format: string = 'YYYY-MM-DD'): string {
  if (!timestamp) return '';
  return dayjs.unix(timestamp).format(format);
}

/**
 * 获取配置值
 * @param config 配置对象
 * @param path 配置路径，使用点分隔
 * @param defaultValue 默认值
 */
export function getConfigValue(config: Record<string, any>, path: string, defaultValue: any = undefined) {
  const keys = path.split('.');
  let value = config as any;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return defaultValue;
  }
  return value;
}

