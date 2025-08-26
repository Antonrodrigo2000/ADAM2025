"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { ProductsFilter } from "./products-filter"

interface MobileFilterModalProps {
  products: any[]
  onFilterChange: (filteredProducts: any[]) => void
  activeFiltersCount: number
}

export function MobileFilterModal({ products, onFilterChange, activeFiltersCount }: MobileFilterModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Filter Products</SheetTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ProductsFilter 
            products={products}
            onFilterChange={onFilterChange}
          />
        </div>
        
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t">
          <Button 
            onClick={() => setOpen(false)}
            className="w-full h-12"
            size="lg"
          >
            View Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}