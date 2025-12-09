import { api } from './client';
import { API_ENDPOINTS } from '../config';
import type { Link, CreateLinkInput, UpdateLinkInput } from '../types';

interface LinksResponse {
  links: Link[];
  total: number;
}

interface LinkResponse {
  link: Link;
}

export const linksApi = {
  getAll: async () => {
    return api.get<LinksResponse>(API_ENDPOINTS.LINKS.LIST);
  },

  getOne: async (id: string) => {
    return api.get<LinkResponse>(API_ENDPOINTS.LINKS.GET(id));
  },

  create: async (data: CreateLinkInput) => {
    return api.post<LinkResponse>(API_ENDPOINTS.LINKS.CREATE, data);
  },

  update: async (id: string, data: UpdateLinkInput) => {
    return api.put<LinkResponse>(API_ENDPOINTS.LINKS.UPDATE(id), data);
  },

  delete: async (id: string) => {
    return api.delete(API_ENDPOINTS.LINKS.DELETE(id));
  },
};
