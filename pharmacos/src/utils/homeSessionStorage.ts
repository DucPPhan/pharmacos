// src/utils/sessionStorage.ts
export interface FilterState {
    category?: string;
    subcategory?: string;
    searchQuery?: string;
    sortBy?: string;
    priceRange?: [number, number];
    brands?: string[];
    tags?: string[];
    inStockOnly?: boolean;
}

const FILTER_STATE_KEY = 'pharmacos_filter_state';

export const saveFilterState = (state: FilterState): void => {
    try {
        sessionStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving filter state to session storage:', error);
    }
};

export const getFilterState = (): FilterState | null => {
    try {
        const state = sessionStorage.getItem(FILTER_STATE_KEY);
        return state ? JSON.parse(state) : null;
    } catch (error) {
        console.error('Error retrieving filter state from session storage:', error);
        return null;
    }
};

export const clearFilterState = (): void => {
    try {
        sessionStorage.removeItem(FILTER_STATE_KEY);
    } catch (error) {
        console.error('Error clearing filter state from session storage:', error);
    }
};