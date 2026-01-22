export type BlockInstance<T = any> = {
  id: string
  type: string
  data: T
}

export type BlockProperty =
  | { type: "hidden"; label?: string }
  | { type: "string"; label?: string }
  | { type: "text"; label?: string }
  | { type: "select"; label?: string; options?: string[] }
  | { type: "image"; label?: string }
  | { type: "boolean"; label?: string }
  | { type: "container"; label?: string }
  | { type: "episodes"; label?: string }

export type BlockSchema<T> = {
  type: string
  defaults: T
  properties: Record<keyof T, BlockProperty>
}
