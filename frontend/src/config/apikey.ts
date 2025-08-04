// src/config/apikey.ts

export const getApiKey = (keyName: string): string => {
  const keys: Record<string, string> = {
    'GROQ_API_KEY': '',
    'GEMINI_API_KEY': ''
  };
  
  return keys[keyName] || '';
};

// Alternative: Use environment variables (recommended for production)
// export const getApiKey = (keyName: string): string => {
//   return process.env[`REACT_APP_${keyName}`] || '';
// };