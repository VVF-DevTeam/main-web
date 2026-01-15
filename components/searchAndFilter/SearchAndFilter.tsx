'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, Search } from 'lucide-react'
import useDebounce from '@/hooks/useDebounce'

// Types
export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  id: string
  label: string
  placeholder: string
  urlParam: string
  options: FilterOption[]
  width?: string // e.g., "w-48", defaults to "w-full md:w-48"
  searchable?: boolean
  searchPlaceholder?: string
  onSearchAsync?: (searchTerm: string) => Promise<FilterOption[]>
  mutuallyExclusiveWith?: string[] // IDs of other filters that should be cleared when this is selected
}

export interface SearchAndFilterProps {
  // Search configuration
  searchLabel: string
  searchPlaceholder: string
  searchUrlParam: string // e.g., "title", "reviewSearch"
  initialSearchTerm?: string
  
  // Filter configurations
  filters: FilterConfig[]
  initialFilterValues?: Record<string, string> // Initial filter values from server
  
  // Clear button
  clearButtonLabel: string
  
  // Callbacks
  onFiltersChange?: (filters: Record<string, string>) => void
}

export default function SearchAndFilter({
  searchLabel,
  searchPlaceholder,
  searchUrlParam,
  initialSearchTerm = '',
  filters,
  initialFilterValues,
  clearButtonLabel,
  onFiltersChange,
}: SearchAndFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Search state
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  // Filter states - initialize from props (server-provided values)
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    if (initialFilterValues) {
      return initialFilterValues
    }
    // Fallback: initialize all filters to 'all'
    const initial: Record<string, string> = {}
    filters.forEach(filter => {
      initial[filter.id] = 'all'
    })
    return initial
  })
  
  // Searchable filter states
  const [filterSearchTerms, setFilterSearchTerms] = useState<Record<string, string>>({})
  const [filteredOptions, setFilteredOptions] = useState<Record<string, FilterOption[]>>(() => {
    const initial: Record<string, FilterOption[]> = {}
    filters.forEach(filter => {
      initial[filter.id] = filter.options
    })
    return initial
  })

  // Auto-update URL when debounced search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    if (debouncedSearchTerm) {
      params.set(searchUrlParam, debouncedSearchTerm)
    } else {
      params.delete(searchUrlParam)
    }
    
    router.push(`?${params.toString()}`, { scroll: false })
  }, [debouncedSearchTerm, searchParams, router, searchUrlParam])

  // Handle filter change
  const handleFilterChange = useCallback(
    (filterId: string, value: string) => {
      const filter = filters.find(f => f.id === filterId)
      if (!filter) return

      const newFilterValues = { ...filterValues, [filterId]: value }
      
      // Handle mutually exclusive filters
      if (value !== 'all' && filter.mutuallyExclusiveWith) {
        filter.mutuallyExclusiveWith.forEach(exclusiveId => {
          newFilterValues[exclusiveId] = 'all'
        })
      }
      
      setFilterValues(newFilterValues)
      
      // Update URL
      const params = new URLSearchParams(searchParams)
      
      Object.entries(newFilterValues).forEach(([id, val]) => {
        const f = filters.find(filter => filter.id === id)
        if (!f) return
        
        if (val && val !== 'all') {
          params.set(f.urlParam, val)
        } else {
          params.delete(f.urlParam)
        }
      })
      
      router.push(`?${params.toString()}`, { scroll: false })
      
      // Callback
      if (onFiltersChange) {
        onFiltersChange(newFilterValues)
      }
    },
    [filterValues, filters, searchParams, router, onFiltersChange]
  )

  // Handle filter search
  const handleFilterSearch = useCallback(
    async (filterId: string, searchTerm: string) => {
      const filter = filters.find(f => f.id === filterId)
      if (!filter) return

      if (searchTerm === '') {
        setFilteredOptions(prev => ({
          ...prev,
          [filterId]: filter.options,
        }))
      } else {
        if (filter.onSearchAsync) {
          // Async search
          const results = await filter.onSearchAsync(searchTerm)
          setFilteredOptions(prev => ({
            ...prev,
            [filterId]: results,
          }))
        } else {
          // Local filter
          const filtered = filter.options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
          setFilteredOptions(prev => ({
            ...prev,
            [filterId]: filtered,
          }))
        }
      }
    },
    [filters]
  )

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    const clearedFilters: Record<string, string> = {}
    filters.forEach(filter => {
      clearedFilters[filter.id] = 'all'
    })
    setFilterValues(clearedFilters)
    
    const params = new URLSearchParams(searchParams)
    params.delete(searchUrlParam)
    filters.forEach(filter => {
      params.delete(filter.urlParam)
    })
    
    router.push(`?${params.toString()}`, { scroll: false })
    
    if (onFiltersChange) {
      onFiltersChange(clearedFilters)
    }
  }, [filters, searchParams, router, searchUrlParam, onFiltersChange])

  // Check if there are active filters
  const hasActiveFilters = 
    searchTerm !== '' || 
    Object.values(filterValues).some(value => value !== 'all')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Search Input */}
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {searchLabel}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <div 
            key={filter.id} 
            className={filter.width || 'w-full md:w-48'}
          >
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <Select
              value={filterValues[filter.id]}
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger className="border border-input shadow-sm">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.searchable && (
                  <div className="pb-2">
                    <Input
                      type="search"
                      autoComplete="off"
                      placeholder={filter.searchPlaceholder || 'Search...'}
                      value={filterSearchTerms[filter.id] || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setFilterSearchTerms(prev => ({
                          ...prev,
                          [filter.id]: value,
                        }))
                        handleFilterSearch(filter.id, value)
                      }}
                    />
                  </div>
                )}
                <SelectItem value="all">{filter.placeholder}</SelectItem>
                {filteredOptions[filter.id]?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {clearButtonLabel}
          </Button>
        )}
      </div>
    </div>
  )
}



