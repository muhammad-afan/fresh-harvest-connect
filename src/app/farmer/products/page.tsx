"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Search, Star, StarHalf, Plus, Trash2, Edit, Heart, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  _id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
  images: string[]
  quantityAvailable: number
  isAvailable: boolean
  // Added for Amazon-like features
  rating?: number
  reviewCount?: number
  isPrime?: boolean
}

export default function MarketplacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("featured")
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Mock categories for the filter
  const categories = ["All Categories", "Vegetables", "Fruits", "Dairy", "Meat", "Bakery", "Beverages"]

  useEffect(() => {
    // Check if user is a farmer/admin
    if (status === "authenticated" && session?.user.role === "FARMER") {
      setIsAdmin(true)
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/farmer/products")
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()

        // Add mock Amazon-like data to products
        const enhancedProducts = data.products.map((product: Product) => ({
          ...product,
          rating: Math.random() * 2 + 3, // Random rating between 3 and 5
          reviewCount: Math.floor(Math.random() * 1000), // Random number of reviews
          isPrime: Math.random() > 0.3, // 70% chance of being Prime eligible
        }))

        setProducts(enhancedProducts)
      } catch (error: any) {
        console.error("Error fetching products:", error)
        setError(error.message || "Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [status, session])

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/farmer/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      // Remove product from state
      setProducts(products.filter((product) => product._id !== id))
    } catch (error: any) {
      console.error("Error deleting product:", error)
      setError(error.message || "Failed to delete product")
    }
  }

  const addToCart = (productId: string) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === productId)
      if (existingItem) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prev, { id: productId, quantity: 1 }]
      }
    })
  }

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0 // Featured - no specific sort
    }
  })

  // Render star ratings
  const renderRating = (rating = 0, product: Product) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({product.reviewCount})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-5 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4">
      {/* Header with search and cart */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Categories</SheetTitle>
                <SheetDescription>Browse by category</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className="w-full justify-start text-left mb-1"
                    onClick={() => setSelectedCategory(category.toLowerCase())}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isAdmin && (
            <Button asChild variant="default">
              <Link href="/farmer/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {cartItems.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
                <SheetDescription>
                  {cartItems.length === 0
                    ? "Your cart is empty"
                    : `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in your cart`}
                </SheetDescription>
              </SheetHeader>

              {cartItems.length > 0 && (
                <div className="mt-8 space-y-4">
                  {cartItems.map((item) => {
                    const product = products.find((p) => p._id === item.id)
                    return product ? (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 relative rounded overflow-hidden">
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${product.price} × {item.quantity}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setCartItems((prev) => prev.filter((i) => i.id !== item.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null
                  })}

                  <Separator className="my-4" />

                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      $
                      {cartItems
                        .reduce((sum, item) => {
                          const product = products.find((p) => p._id === item.id)
                          return sum + (product ? product.price * item.quantity : 0)
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  <Button className="w-full mt-4">Checkout</Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm font-medium">Filter:</span>
          {categories.map((category, index) => (
            <Badge
              key={category}
              variant={selectedCategory === category.toLowerCase() ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.toLowerCase())}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Avg. Customer Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium">No products found</h2>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {isAdmin && (
            <Button asChild className="mt-4">
              <Link href="/farmer/products/new">Add Your First Product</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48 bg-muted/20">
                <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <CardContent className="p-4 flex-1">
                <Link href={`/product/${product._id}`} className="hover:underline">
                  <h3 className="font-medium line-clamp-2 mb-1">{product.name}</h3>
                </Link>

                {renderRating(product.rating, product)}

                <div className="mt-2">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground ml-1">/{product.unit}</span>
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>

                {product.isPrime && (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Prime
                    </Badge>
                  </div>
                )}

                <div className="mt-2 text-sm text-muted-foreground">
                  {product.isAvailable ? (
                    <span className="text-green-600">In Stock ({product.quantityAvailable} available)</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 mt-auto">
                <div className="w-full space-y-2">
                  <Button className="w-full" onClick={() => addToCart(product._id)} disabled={!product.isAvailable}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>

                  {isAdmin && (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" asChild className="flex-1">
                        <Link href={`/farmer/products/${product._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
