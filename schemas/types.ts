export type DynamicParamsType =
  | {
      design_method: "method_bs"
      tension: number
      compression: number
      applied_load: number
      global_safety_factor: number
    }
  | ({
      design_method: "method_en" | "method_test"
      tension: number
      compression: number
      permanent_load: number
      variable_load: number
    } & (
      | {
          country: "uk"
          uk_safety_factor_compression_yG1: number
          uk_safety_factor_compression_yQ1: number
          uk_safety_factor_compression_yT1: number
          uk_safety_factor_compression_yG2: number
          uk_safety_factor_compression_yQ2: number
          uk_safety_factor_compression_yT2: number
          uk_safety_factor_tension_yG1: number
          uk_safety_factor_tension_yQ1: number
          uk_safety_factor_tension_yT1: number
          uk_safety_factor_tension_yG2: number
          uk_safety_factor_tension_yQ2: number
          uk_safety_factor_tension_yT2: number
        }
      | {
          country: "nl"
          nl_safety_factor_compression_yG: number
          nl_safety_factor_compression_yQ: number
          nl_safety_factor_compression_yT: number
          nl_safety_factor_tension_yG: number
          nl_safety_factor_tension_yQ: number
          nl_safety_factor_tension_yT: number
        }
      | {
          country: "pl"
          pl_safety_factor_compression_yG: number
          pl_safety_factor_compression_yQ: number
          pl_safety_factor_compression_yT: number
          pl_safety_factor_tension_yG: number
          pl_safety_factor_tension_yQ: number
          pl_safety_factor_tension_yT: number
        }
    ))
