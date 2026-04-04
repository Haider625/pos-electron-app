import { useState, useMemo } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useSubCategories } from '../../hooks/useSubCategories'
import { useBrands } from '../../hooks/useBrands'
import type { Product } from '../../../shared/types'
import TopBar from './TopBar'
import FilterSidebar from './FilterSidebar'
import ProductGrid from './ProductGrid'
import DetailsPanel from './DetailsPanel'
import ProductFormModal from './ProductFormModal'
import StockHistoryModal from './StockHistoryModal'
import type { StockMovement } from '../../../shared/types'

export default function ProductsPage() {
  const { products, createProduct, updateProduct, deleteProduct, loading: productsLoading } = useProducts()
  const { categories } = useCategories()
  const { subCategories } = useSubCategories()
  const { brands } = useBrands()

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    categoryId: null as number | null,
    subCategoryId: null as number | null,
    brandId: null as number | null,
    stockStatus: 'all' as 'all' | 'low' | 'out' | 'available',
    priceRange: [0, 1000000] as [number, number]
  })
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [showHistory, setShowHistory] = useState(false)
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchCategory = !filters.categoryId || p.categoryId === filters.categoryId
      const matchSubCategory = !filters.subCategoryId || p.subCategoryId === filters.subCategoryId
      const matchBrand = !filters.brandId || p.brandId === filters.brandId
      
      let matchStock = true
      if (filters.stockStatus === 'low') matchStock = p.stock > 0 && p.stock <= (p.reorderLevel || 5)
      else if (filters.stockStatus === 'out') matchStock = p.stock === 0
      else if (filters.stockStatus === 'available') matchStock = p.stock > (p.reorderLevel || 5)
      
      const matchPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      
      return matchSearch && matchCategory && matchSubCategory && matchBrand && matchStock && matchPrice
    })
  }, [products, searchTerm, filters])

  const handleAddClick = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleShowHistory = async (product: Product) => {
    try {
      const data = await window.api.products.getStockHistory(product.id)
      setMovements(data)
      setHistoryProduct(product)
      setShowHistory(true)
    } catch (err) {
      alert('خطأ في تحميل سجل المخزون')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: '#f8fafc',
      margin: '-20px' // Offset parent padding
    }} dir="rtl">
      
      <TopBar 
        onAdd={handleAddClick} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        totalCount={products.length}
        resultsCount={filteredProducts.length}
        activeFiltersCount={
          (filters.categoryId !== null ? 1 : 0) + 
          (filters.subCategoryId !== null ? 1 : 0) + 
          (filters.brandId !== null ? 1 : 0) + 
          (filters.stockStatus !== 'all' ? 1 : 0) + 
          (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 ? 1 : 0)
        }
        onResetFilters={() => setFilters({
          categoryId: null,
          subCategoryId: null,
          brandId: null,
          stockStatus: 'all',
          priceRange: [0, 1000000]
        })}
      />

      <FilterSidebar 
        categories={categories}
        subCategories={subCategories}
        brands={brands}
        filters={filters}
        onFilterChange={setFilters}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <ProductGrid 
            products={filteredProducts} 
            loading={productsLoading}
            selectedId={selectedProduct?.id}
            onSelect={setSelectedProduct}
            onEdit={handleEditClick}
            onDelete={deleteProduct}
            onShowHistory={handleShowHistory}
          />
        </div>

        {selectedProduct && (
          <DetailsPanel 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)}
            onEdit={() => handleEditClick(selectedProduct)}
          />
        )}
      </div>

      <StockHistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        product={historyProduct} 
        movements={movements} 
      />

      {isFormOpen && (
        <ProductFormModal 
          product={editingProduct} 
          onClose={() => setIsFormOpen(false)}
          onSubmit={editingProduct ? updateProduct : createProduct}
          categories={categories}
          subCategories={subCategories}
          brands={brands}
        />
      )}
    </div>
  )
}
