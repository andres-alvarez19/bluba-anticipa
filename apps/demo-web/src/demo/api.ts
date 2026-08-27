import { createApiClient } from '@bluba/api-client';

const apiUrl = import.meta.env.VITE_API_URL || '/api';

export const demoApi = createApiClient({ baseUrl: apiUrl });

