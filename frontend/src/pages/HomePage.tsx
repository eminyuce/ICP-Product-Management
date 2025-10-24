import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts, useGetAllCategories } from '@/hooks/useQueries';
import { useFileUrl } from '@/blob-storage/FileStorage';
import { useCartStore } from '@/store/cartStore';
import CartDropdown from '@/components/CartDropdown';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Search, ShoppingCart, Eye, Package, Tag } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, DiscountType } from '@/backend';

function ProductCard({ product }: { product: Product }) {
    const navigate = useNavigate();
    const { data: imageUrl } = useFileUrl(product.imagePath || '');
    const [isHovered, setIsHovered] = useState(false);
    const { addItem } = useCartStore();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const calculateDiscountedPrice = (price: number, discount?: { discountType: DiscountType; value: number }) => {
        if (!discount) return price;

        if (discount.discountType === 'percentage') {
            return price - (price * discount.value / 100);
        } else {
            return price - discount.value;
        }
    };

    const formatDiscountLabel = (discount?: { discountType: DiscountType; value: number }) => {
        if (!discount) return '';

        if (discount.discountType === 'percentage') {
            return `${discount.value}% OFF`;
        } else {
            return `$${discount.value.toFixed(2)} OFF`;
        }
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1_000_000);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const isOutOfStock = Number(product.quantity) === 0;
    const hasDiscount = !!product.discount;
    const discountedPrice = hasDiscount ? calculateDiscountedPrice(product.price, product.discount) : product.price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOutOfStock) {
            addItem(product, 1);
            toast.success(`${product.name} added to cart`);
        }
    };

    const handleImageClick = () => {
        navigate({ to: '/product/$productId', params: { productId: product.id.toString() } });
    };

    return (
        <Card 
            className="group relative h-full flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-border bg-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section - Clickable */}
            <div 
                className="relative aspect-square w-full overflow-hidden bg-muted cursor-pointer"
                onClick={handleImageClick}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <img
                            src="/assets/generated/product-placeholder.dim_400x300.png"
                            alt="Product placeholder"
                            className="h-full w-full object-cover opacity-50"
                        />
                    </div>
                )}
                
                {/* Category Badge */}
                <Badge 
                    className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-md"
                >
                    {product.category}
                </Badge>

                {/* Discount Badge */}
                {hasDiscount && (
                    <Badge 
                        className="absolute top-3 right-3 bg-destructive text-destructive-foreground shadow-md flex items-center gap-1 font-bold"
                    >
                        <Tag className="h-3 w-3" />
                        {formatDiscountLabel(product.discount)}
                    </Badge>
                )}

                {/* Quick Actions Overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 animate-fade-in">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate({ to: '/product/$productId', params: { productId: product.id.toString() } });
                                        }}
                                    >
                                        <Eye className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <CardContent className="flex-1 p-4 flex flex-col">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <h3 
                                className="text-lg font-semibold text-foreground line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id.toString() } })}
                            >
                                {product.name}
                            </h3>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <p className="text-sm">{product.description || product.name}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                        {hasDiscount ? (
                            <>
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(discountedPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-primary">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                    {isOutOfStock ? (
                        <Badge variant="destructive" className="text-xs">
                            Out of Stock
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-xs">
                            {Number(product.quantity)} in stock
                        </Badge>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Added: {formatDate(product.created_at)}</span>
                        {product.updated_at !== product.created_at && (
                            <span>Updated: {formatDate(product.updated_at)}</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ProductCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden rounded-2xl">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="flex-1 p-4 flex flex-col gap-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
    const limit = 16; // 4x4 grid

    const { data: productsData, isLoading } = useGetAllProducts({
        page,
        limit: 1000, // Fetch all for client-side filtering
        filters: {
            name: '',
            category: '',
            sku: '',
            status: '',
            ordering: '',
            search: '',
            createdFrom: '',
            createdTo: '',
            updatedFrom: '',
            updatedTo: '',
        },
        sortBy: 'ordering',
        sortOrder: 'asc',
    });

    const { data: categories = [] } = useGetAllCategories();

    // Client-side filtering and sorting
    const filteredAndSortedProducts = useMemo(() => {
        let products = productsData?.products || [];

        // Filter by search query (name, description, SKU)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (categoryFilter) {
            products = products.filter(p => p.category === categoryFilter);
        }

        // Sort
        products = [...products].sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return Number(b.created_at - a.created_at);
                case 'price-asc': {
                    const priceA = a.discount 
                        ? (a.discount.discountType === 'percentage' 
                            ? a.price - (a.price * a.discount.value / 100)
                            : a.price - a.discount.value)
                        : a.price;
                    const priceB = b.discount 
                        ? (b.discount.discountType === 'percentage' 
                            ? b.price - (b.price * b.discount.value / 100)
                            : b.price - b.discount.value)
                        : b.price;
                    return priceA - priceB;
                }
                case 'price-desc': {
                    const priceA = a.discount 
                        ? (a.discount.discountType === 'percentage' 
                            ? a.price - (a.price * a.discount.value / 100)
                            : a.price - a.discount.value)
                        : a.price;
                    const priceB = b.discount 
                        ? (b.discount.discountType === 'percentage' 
                            ? b.price - (b.price * b.discount.value / 100)
                            : b.price - b.discount.value)
                        : b.price;
                    return priceB - priceA;
                }
                default:
                    return Number(a.ordering - b.ordering);
            }
        });

        return products;
    }, [productsData?.products, searchQuery, categoryFilter, sortOption]);

    // Pagination
    const totalProducts = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value === 'all' ? '' : value);
        setPage(1);
    };

    const handleSortChange = (value: string) => {
        setSortOption(value as 'newest' | 'price-asc' | 'price-desc');
        setPage(1);
    };

    const handlePrevPage = () => {
        setPage(p => Math.max(1, p - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNextPage = () => {
        setPage(p => Math.min(totalPages, p + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageClick = (pageNum: number) => {
        setPage(pageNum);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(page - 1);
                pages.push(page);
                pages.push(page + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex min-h-screen flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-md">
                <div className="mx-auto w-[85%] py-4">
                    <div className="flex items-center justify-between gap-6">
                        {/* Logo/Title */}
                        <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate({ to: '/' })}
                        >
                            <Package className="h-8 w-8 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">ProductHub</h1>
                                <p className="text-xs text-muted-foreground">Your Shopping Destination</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name, description, or SKU..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 h-11 border-border bg-card shadow-sm"
                            />
                        </div>

                        {/* Cart Icon */}
                        <CartDropdown />
                    </div>
                </div>
            </div>

            <main className="flex-1 bg-background">
                <div className="mx-auto w-[85%] py-8">
                    {/* Filters and Sorting */}
                    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Category Filter */}
                            <Select value={categoryFilter || 'all'} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full sm:w-64 h-11 border-border bg-card shadow-sm">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Sort Options */}
                            <Select value={sortOption} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-full sm:w-64 h-11 border-border bg-card shadow-sm">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="price-asc">Price: Low → High</SelectItem>
                                    <SelectItem value="price-desc">Price: High → Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-muted-foreground">
                            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : currentProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold text-foreground mb-2">No products found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                                {currentProducts.map((product) => (
                                    <ProductCard key={product.id.toString()} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={handlePrevPage}
                                            disabled={page === 1}
                                            className="shadow-sm"
                                        >
                                            <ChevronLeft className="h-5 w-5 mr-1" />
                                            Previous
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {getPageNumbers().map((pageNum, idx) => (
                                                pageNum === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-muted-foreground">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <Button
                                                        key={pageNum}
                                                        variant={page === pageNum ? 'default' : 'outline'}
                                                        size="icon"
                                                        onClick={() => handlePageClick(pageNum as number)}
                                                        className="h-10 w-10 shadow-sm"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={handleNextPage}
                                            disabled={page === totalPages}
                                            className="shadow-sm"
                                        >
                                            Next
                                            <ChevronRight className="h-5 w-5 ml-1" />
                                        </Button>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
