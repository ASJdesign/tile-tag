interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  clickCount: number;
  size: '1x1' | '1x2' | '2x2';
  createdAt: Date;
}

const STORAGE_KEY = 'linkcloud_links';

// Check if we're in a browser extension environment
const isExtension = () => {
  return typeof globalThis !== 'undefined' && 
         globalThis.chrome && 
         globalThis.chrome.storage;
};

export const storageUtils = {
  async getLinks(): Promise<LinkItem[]> {
    try {
      if (isExtension()) {
        const result = await globalThis.chrome.storage.local.get([STORAGE_KEY]);
        return result[STORAGE_KEY] || [];
      } else {
        // Fallback to localStorage for development
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error loading links:', error);
      return [];
    }
  },

  async saveLinks(links: LinkItem[]): Promise<void> {
    try {
      if (isExtension()) {
        await globalThis.chrome.storage.local.set({ [STORAGE_KEY]: links });
      } else {
        // Fallback to localStorage for development
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      }
    } catch (error) {
      console.error('Error saving links:', error);
    }
  },

  async addLink(link: Omit<LinkItem, 'id' | 'clickCount' | 'createdAt'>): Promise<LinkItem> {
    const newLink: LinkItem = {
      ...link,
      id: Date.now().toString(),
      clickCount: 0,
      createdAt: new Date(),
    };

    const links = await this.getLinks();
    const updatedLinks = [newLink, ...links];
    await this.saveLinks(updatedLinks);
    return newLink;
  },

  async updateLink(id: string, updates: Partial<LinkItem>): Promise<void> {
    const links = await this.getLinks();
    const updatedLinks = links.map(link =>
      link.id === id ? { ...link, ...updates } : link
    );
    await this.saveLinks(updatedLinks);
  },

  async deleteLink(id: string): Promise<void> {
    const links = await this.getLinks();
    const updatedLinks = links.filter(link => link.id !== id);
    await this.saveLinks(updatedLinks);
  }
};