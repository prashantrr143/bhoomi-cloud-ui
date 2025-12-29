/**
 * Generic hook for table list filtering and pagination
 */

import { useState, useMemo, useCallback } from 'react';
import { PAGE_SIZE, DEFAULT_PAGE } from '@/constants';

export interface UseTableListOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  pageSize?: number;
  initialPage?: number;
}

export interface UseTableListReturn<T> {
  // Data
  filteredItems: T[];
  paginatedItems: T[];
  totalItems: number;
  totalPages: number;

  // Filter state
  filterText: string;
  setFilterText: (text: string) => void;

  // Pagination state
  currentPage: number;
  setCurrentPage: (page: number) => void;

  // Selection state
  selectedItems: T[];
  setSelectedItems: (items: T[]) => void;

  // Utilities
  resetFilters: () => void;
  isFiltered: boolean;
}

export function useTableList<T extends Record<string, unknown>>({
  data,
  searchFields,
  pageSize = PAGE_SIZE,
  initialPage = DEFAULT_PAGE,
}: UseTableListOptions<T>): UseTableListReturn<T> {
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Filter items based on search text
  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return data;

    const lowerFilter = filterText.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerFilter);
      })
    );
  }, [data, filterText, searchFields]);

  // Calculate total pages
  const totalPages = useMemo(
    () => Math.ceil(filteredItems.length / pageSize),
    [filteredItems.length, pageSize]
  );

  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Reset current page when filter changes
  const handleSetFilterText = useCallback((text: string) => {
    setFilterText(text);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterText('');
    setCurrentPage(DEFAULT_PAGE);
    setSelectedItems([]);
  }, []);

  return {
    // Data
    filteredItems,
    paginatedItems,
    totalItems: filteredItems.length,
    totalPages,

    // Filter state
    filterText,
    setFilterText: handleSetFilterText,

    // Pagination state
    currentPage,
    setCurrentPage,

    // Selection state
    selectedItems,
    setSelectedItems,

    // Utilities
    resetFilters,
    isFiltered: filterText.trim().length > 0,
  };
}

export default useTableList;
