import dayjs from "dayjs";

export function formatDate(
  timestamp: number | undefined,
  format: string = "YYYY-MM-DD"
): string {
  if (!timestamp) return "";
  return dayjs.unix(timestamp).format(format);
}
