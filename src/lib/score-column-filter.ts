export function visibleScoreColumns<T extends { key: string }>(columns: readonly T[], hiddenKeys: readonly string[]): T[] {
  return columns.filter((column) => !hiddenKeys.includes(column.key));
}