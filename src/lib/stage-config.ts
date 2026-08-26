export type StageKey = "PLACED" | "PREPARING" | "READY" | "SERVED";

export type StageItemConfig = {
  label: string;
  enabled: boolean;
};

export type StageConfig = {
  PLACED?: StageItemConfig | string;
  PREPARING?: StageItemConfig | string;
  READY?: StageItemConfig | string;
  SERVED?: StageItemConfig | string;
};

export const DEFAULT_STAGE_CONFIG: Record<StageKey, StageItemConfig> = {
  PLACED: { label: "Order Placed", enabled: true },
  PREPARING: { label: "Preparing", enabled: true },
  READY: { label: "Ready to Serve", enabled: true },
  SERVED: { label: "Served", enabled: true },
};

export function parseStageConfig(raw: unknown): Record<StageKey, StageItemConfig> {
  const result: Record<StageKey, StageItemConfig> = {
    PLACED: { ...DEFAULT_STAGE_CONFIG.PLACED },
    PREPARING: { ...DEFAULT_STAGE_CONFIG.PREPARING },
    READY: { ...DEFAULT_STAGE_CONFIG.READY },
    SERVED: { ...DEFAULT_STAGE_CONFIG.SERVED },
  };

  if (!raw || typeof raw !== "object") return result;

  const obj = raw as Record<string, unknown>;
  const keys: StageKey[] = ["PLACED", "PREPARING", "READY", "SERVED"];

  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string") {
      result[key] = { label: val.trim() || DEFAULT_STAGE_CONFIG[key].label, enabled: true };
    } else if (val && typeof val === "object") {
      const item = val as { label?: unknown; enabled?: unknown };
      const label = typeof item.label === "string" && item.label.trim() ? item.label.trim() : DEFAULT_STAGE_CONFIG[key].label;
      const enabled = key === "PLACED" || key === "SERVED" ? true : item.enabled !== false;
      result[key] = { label, enabled };
    }
  }

  return result;
}

export function getActiveStages(configRaw: unknown): Array<{ key: StageKey; label: string }> {
  const parsed = parseStageConfig(configRaw);
  const orderedKeys: StageKey[] = ["PLACED", "PREPARING", "READY", "SERVED"];
  return orderedKeys
    .filter((k) => parsed[k].enabled)
    .map((k) => ({ key: k, label: parsed[k].label }));
}

export function getNextStage(current: string, activeStages: Array<{ key: StageKey }>): StageKey | null {
  const upper = current.toUpperCase() as StageKey;
  const index = activeStages.findIndex((s) => s.key === upper);
  if (index === -1) {
    const canonicalOrder: StageKey[] = ["PLACED", "PREPARING", "READY", "SERVED"];
    const cIndex = canonicalOrder.indexOf(upper);
    for (let i = cIndex + 1; i < canonicalOrder.length; i++) {
      const target = canonicalOrder[i];
      if (activeStages.some((s) => s.key === target)) return target;
    }
    return null;
  }
  if (index + 1 < activeStages.length) {
    return activeStages[index + 1].key;
  }
  return null;
}
