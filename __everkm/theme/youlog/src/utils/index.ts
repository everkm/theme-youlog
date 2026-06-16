import dayjs from "dayjs";

/**
 * 格式化日期
 * @param timestamp 时间戳（秒）
 * @param format 格式化字符串，默认 'YYYY-MM-DD'
 */
export function formatDate(
  timestamp: number | undefined,
  format: string = "YYYY-MM-DD"
): string {
  if (!timestamp) return "";
  return dayjs.unix(timestamp).format(format);
}

/**
 * 获取配置值
 * @param config 配置对象
 * @param path 配置路径，使用点分隔
 * @param defaultValue 默认值
 */
export function getConfigValue(
  config: Record<string, any>,
  path: string,
  defaultValue: any = undefined
) {
  const keys = path.split(".");
  let value = config as any;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return defaultValue;
  }
  return value;
}

function coerceBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
  }
  return Boolean(value);
}

/**
 * 读取布局显示开关，front matter 优先于全局 config
 */
export function getDisplayFlag(
  config: Record<string, any>,
  docMeta: Record<string, any> | undefined,
  key: string,
  defaultValue = true
): boolean {
  if (docMeta && docMeta[key] !== undefined && docMeta[key] !== null) {
    return coerceBoolean(docMeta[key], defaultValue);
  }
  return coerceBoolean(
    getConfigValue(config, `layout.${key}`, defaultValue),
    defaultValue
  );
}
