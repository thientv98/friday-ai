/**
 * Lấy random API key từ danh sách keys trong environment variable
 * Keys được phân cách bằng dấu phẩy
 */
export function getRandomGeminiKey(): string {
  const keysString = process.env.GEMINI_API_KEY || '';
  
  if (!keysString.trim()) {
    throw new Error('GEMINI_API_KEY không được cấu hình trong environment variables');
  }

  // Split by comma and trim whitespace
  const keys = keysString
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);

  if (keys.length === 0) {
    throw new Error('Không tìm thấy API key hợp lệ trong GEMINI_API_KEY');
  }

  // Return random key from the list
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Lấy tất cả các keys (useful for debugging)
 */
export function getAllGeminiKeys(): string[] {
  const keysString = process.env.GEMINI_API_KEY || '';
  
  if (!keysString.trim()) {
    return [];
  }

  return keysString
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);
}

