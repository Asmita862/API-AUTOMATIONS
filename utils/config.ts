export const config = {
  baseURL: process.env.BASE_URL || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminInvalidPassword: process.env.ADMIN_INVALID_PASSWORD || '',
};

export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue;
};
