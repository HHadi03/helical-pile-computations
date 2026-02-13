import * as z from "zod"

export const exportFormSchema = z.object({
  job_number: z.string().max(20, { error: "Job Number must be less than 20 characters" }).optional(),
  job_location: z.string().max(30, { error: "Job Location must be less than 30 characters" }).optional(),
  pile_number: z.string().max(20, { error: "Pile Number must be less than 20 characters" }).optional(),
  checked_by: z.string().max(30, { error: "Checked By must be less than 30 characters" }).optional(),

  soil_profile_id: z.uuid({ error: "Soil Profile is required" }),
  pile_diameter: z.enum(["60", "100"], { error: "Pile Diameter is required" }),
  show_description: z.boolean(),
  show_spt: z.boolean(),
  show_moist: z.boolean(),
  show_sat: z.boolean(),
  show_shear_strength: z.boolean(),
  soil_notes: z.string().optional(),
  
  design_method: z.enum(["method_bs", "method_en", "method_test"], { error: "Please select a design method" }),
  country: z.enum(["uk", "pl", "nl"], { error: "Please select a country" }).optional(),
  applied_tension_load: z.coerce.number(),
  applied_compression_load: z.coerce.number(),
  permanent_tension_load: z.coerce.number(),
  variable_tension_load: z.coerce.number(),
  permanent_compression_load: z.coerce.number(),
  variable_compression_load: z.coerce.number(),
  horizontal_load: z.coerce.number().positive({ error: "Horizontal Load is required" }),
  horizontal_load_safety_factor: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1)),
  structure_rigid: z.boolean(),
  use_characteristic: z.boolean(),
  standard_tensile_resistance: z.coerce.number(),
  standard_compressive_resistance: z.coerce.number(),
  number_of_tests: z.coerce.number(),
  mean_tensile_resistance: z.coerce.number(),
  min_tensile_resistance: z.coerce.number(),
  mean_compressive_resistance: z.coerce.number(),
  min_compressive_resistance: z.coerce.number(),
  design_notes: z.string().optional(),

  global_safety_factor: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.5)),
  uk_safety_factor_tension_yg1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  uk_safety_factor_tension_yq1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(0)),
  uk_safety_factor_tension_yt1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.25)),
  uk_safety_factor_tension_yg2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  uk_safety_factor_tension_yq2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(0)),
  uk_safety_factor_tension_yt2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.7)),
  uk_safety_factor_compression_yg1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.35)),
  uk_safety_factor_compression_yq1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.5)),
  uk_safety_factor_compression_yt1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  uk_safety_factor_compression_yg2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  uk_safety_factor_compression_yq2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.3)),
  uk_safety_factor_compression_yt2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.5)),
  pl_safety_factor_tension_yg: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  pl_safety_factor_tension_yq: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(0)),
  pl_safety_factor_tension_yt: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.15)),
  pl_safety_factor_compression_yg: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.35)),
  pl_safety_factor_compression_yq: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.5)),
  pl_safety_factor_compression_yt: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.1)),
  nl_safety_factor_tension_yg: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  nl_safety_factor_tension_yq: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(0)),
  nl_safety_factor_tension_yt: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.25)),
  nl_safety_factor_compression_yg: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.0)),
  nl_safety_factor_compression_yq: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.3)),
  nl_safety_factor_compression_yt: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.15)),

  nominal_stress_area: z.coerce.number().positive({ error: "Nominal Tensile Stress Area is required" }),
  ultimate_tensile_strength_a480: z.coerce.number().positive({ error: "Ultimate Tensile Strength for A4-80 is required" }),
  k2: z.coerce.number().positive({ error: "Steel Bolt Coefficient is required." }),
  ultimate_tensile_strength_lm25m: z.coerce.number().positive({ error: "Ultimate Tensile Strength for LM25-M is required" }),
  thread_engagement_length: z.coerce.number().positive({ error: "Thread Engagement Length is required" }),
  pitch_diameter: z.coerce.number().positive({ error: "Pitch Diameter is required" }),
  pile_gross_area: z.coerce.number().positive({ error: "Gross Area of the Pile Cross Section is required" }),
  proof_strength: z.coerce.number().positive({ error: "0.2% Proof Strength is required" }),
  e: z.coerce.number().positive({ error: "Modulus of Elasticity is required" }),
  i: z.coerce.number().positive({ error: "Area Moment of Inertia is required" }),
  l: z.coerce.number().positive({ error: "Pile Length in Liquid Soil is required" }),
  k: z.coerce.number().positive({ error: "Effective Length Factor (K) is required" }),
  partial_safety_factor_1: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.1)),
  partial_safety_factor_2: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().default(1.25)),
  pile_notes: z.string().optional(),
})

.refine(
  (data) => data.design_method !== "method_bs" || data.applied_tension_load > 0,
  {
    path: ["applied_tension_load"],
    message: "Applied Tension Load is required",
  }
)

.refine(
  (data) => data.design_method !== "method_bs" || data.applied_compression_load > 0,
  {
    path: ["applied_compression_load"],
    message: "Applied Compression Load is required",
  }
)

.refine(
  (data) => !["method_en", "method_test"].includes(data.design_method) || data.permanent_tension_load > 0,
  {
    path: ["permanent_tension_load"],
    message: "Permanent Tension Load is required",
  }
)

.refine(
  (data) => !["method_en", "method_test"].includes(data.design_method) || data.variable_tension_load > 0,
  {
    path: ["variable_tension_load"],
    message: "Variable Tension Load is required",
  }
)

.refine(
  (data) => !["method_en", "method_test"].includes(data.design_method) || data.permanent_compression_load > 0,
  {
    path: ["permanent_compression_load"],
    message: "Permanent Compression Load is required",
  }
)

.refine(
  (data) => !["method_en", "method_test"].includes(data.design_method) || data.variable_compression_load > 0,
  {
    path: ["variable_compression_load"],
    message: "Variable Compression Load is required",
  }
)

.refine(
  (data) => !["method_en", "method_test"].includes(data.design_method) || data.country !== undefined,
  {
    path: ["country"],
    message: "Country is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || data.use_characteristic || data.standard_tensile_resistance > 0,
  {
    path: ["standard_tensile_resistance"],
    message: "Tensile Resistance is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || data.use_characteristic || data.standard_compressive_resistance > 0,
  {
    path: ["standard_compressive_resistance"],
    message: "Compressive Resistance is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || !data.use_characteristic || data.number_of_tests > 0,
  {
    path: ["number_of_tests"],
    message: "Number Of Tests is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || !data.use_characteristic || data.mean_tensile_resistance > 0,
  {
    path: ["mean_tensile_resistance"],
    message: "Mean Tensile Resistance is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || !data.use_characteristic || data.min_tensile_resistance > 0,
  {
    path: ["min_tensile_resistance"],
    message: "Minimum Tensile Resistance is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || !data.use_characteristic || data.mean_compressive_resistance > 0,
  {
    path: ["mean_compressive_resistance"],
    message: "Mean Compressive Resistance is required",
  }
)

.refine(
  (data) => data.design_method !== "method_test" || !data.use_characteristic || data.min_compressive_resistance > 0,
  {
    path: ["min_compressive_resistance"],
    message: "Minimum Compressive Resistance is required",
  }
)

export type TexportFormSchema = z.infer<typeof exportFormSchema>
