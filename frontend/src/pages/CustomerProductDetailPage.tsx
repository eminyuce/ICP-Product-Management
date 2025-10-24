import { ArrowLeft, ShoppingCart, Package as PackageIcon, Tag } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';
import { useGetProduct } from '@/hooks/useQueries';
import { useFileUrl } from '../blob-storage/FileStorage';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import CustomerHeader from '@/components/CustomerHeader';

export default function CustomerProductDetailPage() {
    const { productId } = useParams({ from: '/product/$productId' });
    const navigate = useNavigate();
    const { addItem } = useCartStore();

    const { data: product, isLoading } = useGetProduct(BigInt(productId));
    const { data: imageUrl } = useFileUrl(product?.imagePath || '');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const calculateDiscountedPrice = (price: number, discount?: { discountType: string; value: number }) => {
        if (!discount) return price;
        
        if (discount.discountType === 'percentage') {
            return price * (1 - discount.value / 100);
        } else {
            return Math.max(0, price - discount.value);
        }
    };

    const handleAddToCart = () => {
        if (product && Number(product.quantity) > 0) {
            addItem(product, 1);
            toast.success(`${product.name} added to cart`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <CustomerHeader />
                <main className="flex-1 w-full">
                    <div className="mx-auto w-[85%] py-12">
                        <Skeleton className="h-12 w-40 mb-8 rounded-lg" />
                        <div className="grid gap-8 lg:grid-cols-2">
                            <Skeleton className="aspect-square w-full rounded-2xl" />
                            <div className="space-y-6">
                                <Skeleton className="h-12 w-3/4 rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-16 w-1/2 rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <CustomerHeader />
                <main className="flex-1 w-full">
                    <div className="mx-auto w-[85%] py-12">
                        <Button
                            variant="ghost"
                            onClick={() => navigate({ to: '/' })}
                            className="mb-8 gap-2 h-12 px-6 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Products
                        </Button>
                        <Card className="border border-border shadow-md rounded-2xl">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <PackageIcon className="h-24 w-24 text-muted-foreground mb-6" />
                                <h3 className="text-2xl font-semibold mb-3">Product not found</h3>
                                <p className="text-base text-muted-foreground">
                                    The product you're looking for doesn't exist or has been removed.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
    const hasDiscount = !!product.discount;
    const isOutOfStock = Number(product.quantity) === 0;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <CustomerHeader />
            
            <main className="flex-1 w-full">
                <div className="mx-auto w-[85%] py-12">
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/' })}
                        className="mb-8 gap-2 h-12 px-6 rounded-lg hover:bg-secondary transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Products
                    </Button>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Product Image */}
                        <div className="relative">
                            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted shadow-md">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
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
                            </div>
                            {hasDiscount && (
                                <Badge 
                                    className="absolute top-4 right-4 bg-destructive text-destructive-foreground shadow-md flex items-center gap-1 font-bold text-base px-4 py-2"
                                >
                                    <Tag className="h-4 w-4" />
                                    {product.discount?.discountType === 'percentage' 
                                        ? `${product.discount.value}% OFF`
                                        : `$${product.discount?.value.toFixed(2)} OFF`
                                    }
                                </Badge>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col space-y-6">
                            <div>
                                <Badge variant="outline" className="mb-4 text-base px-4 py-1.5">
                                    {product.category}
                                </Badge>
                                <h1 className="text-4xl font-bold text-foreground mb-4">
                                    {product.name}
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {product.description || 'No description available.'}
                                </p>
                            </div>

                            <Separator />

                            {/* Price Section */}
                            <div className="space-y-3">
                                {hasDiscount ? (
                                    <>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-bold text-primary">
                                                {formatPrice(discountedPrice)}
                                            </span>
                                            <span className="text-2xl text-muted-foreground line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>
                                        <p className="text-lg text-destructive font-semibold">
                                            You save {formatPrice(product.price - discountedPrice)}!
                                        </p>
                                    </>
                                ) : (
                                    <span className="text-4xl font-bold text-primary">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>

                            <Separator />

                            {/* Stock Status */}
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-foreground">
                                    Availability:
                                </span>
                                {isOutOfStock ? (
                                    <Badge variant="destructive" className="text-base px-4 py-1.5">
                                        Out of Stock
                                    </Badge>
                                ) : (
                                    <Badge variant="default" className="text-base px-4 py-1.5">
                                        {Number(product.quantity)} in stock
                                    </Badge>
                                )}
                            </div>

                            {/* Add to Cart Button */}
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-semibold gap-2 shadow-md hover:shadow-xl transition-all"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </Button>

                            {/* Additional Info */}
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">SKU:</span>
                                        <span className="font-semibold">{product.sku}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="font-semibold">{product.category}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
