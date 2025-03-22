export function snakeToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }
  
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      
      const value = obj[key];
      result[camelKey] = value && typeof value === 'object' && !Array.isArray(value)
        ? snakeToCamel(value)
        : value;
      
      return result;
    }, {} as Record<string, any>);
  }
  
  export function camelToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }
  
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
      
      const value = obj[key];
      result[snakeKey] = value && typeof value === 'object' && !Array.isArray(value)
        ? camelToSnake(value)
        : value;
      
      return result;
    }, {} as Record<string, any>);
  }
  