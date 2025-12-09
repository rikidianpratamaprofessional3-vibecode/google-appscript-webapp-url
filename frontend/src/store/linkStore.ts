import { create } from 'zustand';
import type { Link } from '../types';

interface LinkState {
  links: Link[];
  isLoading: boolean;
  setLinks: (links: Link[]) => void;
  addLink: (link: Link) => void;
  updateLink: (id: string, updatedLink: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useLinkStore = create<LinkState>((set) => ({
  links: [],
  isLoading: false,
  setLinks: (links) => set({ links }),
  addLink: (link) => set((state) => ({ links: [link, ...state.links] })),
  updateLink: (id, updatedLink) =>
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id ? { ...link, ...updatedLink } : link
      ),
    })),
  deleteLink: (id) =>
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
