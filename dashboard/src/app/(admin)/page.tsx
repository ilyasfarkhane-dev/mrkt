"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, Store, Users, RefreshCw } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/button"

export default function StatisticsPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    sellers: 0,
    buyers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch products count
  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiClient.get("/products/active-products")
      return response.data.length
    } catch (err) {
      console.error('Failed to fetch products:', err)
      throw new Error('Failed to load products data')
    }
  }, [])

  // Fetch categories count
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get("/categories")
      return response.data.length
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      throw new Error('Failed to load categories data')
    }
  }, [])

  // Fetch sellers count
  const fetchSellers = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/sellers")
      return response.data.length
    } catch (err) {
      console.error('Failed to fetch sellers:', err)
      if (err instanceof Error) {
        router.push('/signin')
      }
      throw new Error('Failed to load sellers data')
    }
  }, [router])

  // Fetch buyers count
  const fetchBuyers = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/buyers")
      return response.data.length
    } catch (err) {
      console.error('Failed to fetch buyers:', err)
      if (err instanceof Error) {
        router.push('/signin')
      }
      throw new Error('Failed to load buyers data')
    }
  }, [router])

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
  
      const [products, categories] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ])
  
      const newStats = {
        products,
        categories,
        sellers: 0,
        buyers: 0
      }
  
      try {
        const [sellers, buyers] = await Promise.all([
          fetchSellers(),
          fetchBuyers()
        ])
        newStats.sellers = sellers
        newStats.buyers = buyers
      } catch (protectedError) {
        console.log('Proceeding with partial data due to:', protectedError)
      }
  
      setStats(newStats)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [fetchBuyers, fetchSellers, fetchProducts, fetchCategories])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    loadData(true)
  }

  if (loading && !refreshing) return <div className="p-6">Loading statistics...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Statistics</h1>
            <p className="text-muted-foreground">{`Overview of your platform's key metrics`}</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Items available in your inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Product categories in your system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sellers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active vendors on your platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.buyers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered customers on your platform</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}