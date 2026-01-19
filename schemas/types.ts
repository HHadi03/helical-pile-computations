export type CalculationResult = 
| {
    testType: 'spt'
    soilType: 'fine'
    su: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }
| {
    testType: 'spt'
    soilType: 'coarse' | 'manmade'
    angle: number
    t: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }
| {
    testType: 'cpt'
    soilType: 'fine'
    su: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }
| {
    testType: 'cpt'
    soilType: 'coarse' | 'manmade'
    t: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }

export type DynamicParamsType =
  | {
      design_method: "method_bs"
      tension: number
      compression: number
      applied_tension_load: number
      applied_compression_load: number
      global_safety_factor: number
    }
  | ({
      design_method: "method_en" | "method_test"
      tension: number
      compression: number
      permanent_tension_load: number
      variable_tension_load: number
      permanent_compression_load: number
      variable_compression_load: number
    } & (
      | {
          country: "uk"
          uk_safety_factor_compression_yg1: number
          uk_safety_factor_compression_yq1: number
          uk_safety_factor_compression_yt1: number
          uk_safety_factor_compression_yg2: number
          uk_safety_factor_compression_yq2: number
          uk_safety_factor_compression_yt2: number
          uk_safety_factor_tension_yg1: number
          uk_safety_factor_tension_yq1: number
          uk_safety_factor_tension_yt1: number
          uk_safety_factor_tension_yg2: number
          uk_safety_factor_tension_yq2: number
          uk_safety_factor_tension_yt2: number
        }
      | {
          country: "nl"
          nl_safety_factor_compression_yg: number
          nl_safety_factor_compression_yq: number
          nl_safety_factor_compression_yt: number
          nl_safety_factor_tension_yg: number
          nl_safety_factor_tension_yq: number
          nl_safety_factor_tension_yt: number
        }
      | {
          country: "pl"
          pl_safety_factor_compression_yg: number
          pl_safety_factor_compression_yq: number
          pl_safety_factor_compression_yt: number
          pl_safety_factor_tension_yg: number
          pl_safety_factor_tension_yq: number
          pl_safety_factor_tension_yt: number
        }
    ))

export type BaseParamsType = {
  pile_diameter: string
  job_number?: string
  job_location?: string
  pile_number?: string
  checked_by?: string
  show_description: boolean
  show_spt: boolean
  show_moist: boolean
  show_sat: boolean
  show_shear_strength: boolean
  soil_notes?: string
  design_notes?: string
  pile_notes?: string
}

export type PileStructureType = {
  nominal_stress_area: number,
  ultimate_tensile_strength_a480: number,
  k2: number,
  ultimate_tensile_strength_lm25m: number,
  thread_engagement_length: number,
  pitch_diameter: number,
  pile_gross_area: number,
  proof_strength: number,
  l: number,
  e: number,
  k: number,
  i: number,
  partial_safety_factor_1: number,
  partial_safety_factor_2: number,
  horizontal_load: number,
  horizontal_load_safety_factor: number
}
