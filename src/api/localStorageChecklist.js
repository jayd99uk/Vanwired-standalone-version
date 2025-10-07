// Local Storage replacement for Base44 Checklist API
// This provides the same interface but stores data locally in the browser

const STORAGE_KEY = 'vanwired_checklists';
const CATEGORIES_KEY = 'vanwired_custom_categories';

// Helper to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper to get all checklists from localStorage
const getChecklists = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save checklists to localStorage
const saveChecklists = (checklists) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
};

// Mock Checklist API that mimics Base44's interface
export const Checklist = {
  // List all checklists
  list: async () => {
    return getChecklists();
  },

  // Create a new checklist item
  create: async (data) => {
    const checklists = getChecklists();
    const newItem = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    checklists.push(newItem);
    saveChecklists(checklists);
    return newItem;
  },

  // Update an existing checklist item
  update: async (id, updates) => {
    const checklists = getChecklists();
    const index = checklists.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Checklist item with id ${id} not found`);
    }

    checklists[index] = {
      ...checklists[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    saveChecklists(checklists);
    return checklists[index];
  },

  // Delete a checklist item
  delete: async (id) => {
    const checklists = getChecklists();
    const filtered = checklists.filter(item => item.id !== id);

    if (filtered.length === checklists.length) {
      throw new Error(`Checklist item with id ${id} not found`);
    }

    saveChecklists(filtered);
    return { success: true };
  },

  // Get a single checklist item by ID
  get: async (id) => {
    const checklists = getChecklists();
    const item = checklists.find(item => item.id === id);

    if (!item) {
      throw new Error(`Checklist item with id ${id} not found`);
    }

    return item;
  },

  // Get custom categories
  getCustomCategories: async () => {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Add a custom category
  addCustomCategory: async (categoryName) => {
    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '_');
    const categories = await Checklist.getCustomCategories();

    if (!categories.includes(categoryKey)) {
      categories.push(categoryKey);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }

    return categoryKey;
  }
};
