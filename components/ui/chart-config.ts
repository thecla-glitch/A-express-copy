export type Color = string

export type ShadcnChartConfig = {
  [key: string]: {
    label: string
    color: Color
    icon?: React.ComponentType
  }
}

export type LegendConfig = {
  label: string
  color: Color
  icon?: React.ComponentType
}

export function resolveConfig(config: ShadcnChartConfig): ShadcnChartConfig {
  return Object.entries(config).reduce((acc, [key, value]) => {
    acc[key] = {
      ...value,
      label: value.label || key,
    }
    return acc
  }, {} as ShadcnChartConfig)
}
