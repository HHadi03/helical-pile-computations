// Simpler version - works great for database records like Supabase data
export function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }

  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = snakeToCamel(value as Record<string, unknown>)
    } else {
      result[camelKey] = value
    }
  }
  
  return result
}

export function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }

  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`)
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[snakeKey] = camelToSnake(value as Record<string, unknown>)
    } else {
      result[snakeKey] = value
    }
  }
  
  return result
}