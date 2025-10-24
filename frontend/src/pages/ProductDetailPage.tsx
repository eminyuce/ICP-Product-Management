import { ArrowLeft, Edit, Trash2, Package, ImageIcon, Tag, User } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDialog from '@/components/ProductDialog';
import DeleteProductDialog from '@/components/DeleteProductDialog';
import { useGetProduct, useGetUserProfile } from '@/hooks/useQueries';
import { useFileUrl } from '../blob-storage/FileStorage';
import { getStatusLabel } from '@/lib/statusLabels';
import { getStatusColor } from '@/lib/statusColors';
import { useState } from 'react';

export default function ProductDetailPage() {
    const { productId } = useParams({ from: '/product/$productId' });
    const navigate = useNavigate();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: product, isLoading } = useGetProduct(BigInt(productId));
    const { data: imageUrl } = useFileUrl(product?.imagePath || '');
    
    // Fetch user profiles for audit information
    const { data: createdByProfile } = useGetUserProfile(product?.createdBy);
    const { data: updatedByProfile } = useGetUserProfile(product?.updatedBy);

    const formatTimestamp = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1_000_000);
        return format(date, 'MMMM d, yyyy \'at\' h:mm a');
    };

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

    const formatUserInfo = (principal: any, profile: any) => {
        if (profile?.name) {
            return profile.name;
        }
        // Fallback to showing a shortened principal if no profile name
        const principalStr = principal?.toString() || '';
        if (principalStr.length > 20) {
            return `${principalStr.substring(0, 10)}...${principalStr.substring(principalStr.length - 6)}`;
        }
        return principalStr || 'Unknown';
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Header />
                <main className="flex-1 w-full">
                    <div className="mx-auto w-[85%] py-12">
                        <div className="mb-8">
                            <Skeleton className="h-12 w-40 mb-6 rounded-lg" />
                            <Skeleton className="h-14 w-96 mb-3 rounded-lg" />
                            <Skeleton className="h-8 w-64 rounded-lg" />
                        </div>
                        <Card className="border border-border shadow-classic-md rounded-lg">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Header />
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
                        <Card className="border border-border shadow-classic-md rounded-lg">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-secondary shadow-classic">
                                    <Package className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold">Product not found</h3>
                                <p className="mt-3 text-base text-muted-foreground">
                                    The product you're looking for doesn't exist or has been deleted.
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

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            
            <main className="flex-1 w-full">
                <div className="mx-auto w-[85%] py-12 animate-fade-in">
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/' })}
                        className="mb-8 gap-2 h-12 px-6 rounded-lg hover:bg-secondary transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Products
                    </Button>

                    <div className="mb-8 flex items-start justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h1 className="text-5xl font-semibold text-primary">
                                    {product.name}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-base font-semibold border rounded-md px-4 py-1.5">
                                    ID: {Number(product.id)}
                                </Badge>
                                <Badge variant="outline" className="text-base font-semibold border rounded-md px-4 py-1.5">
                                    SKU: {product.sku}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(true)}
                                className="gap-2 h-12 px-6 rounded-lg shadow-classic"
                            >
                                <Edit className="h-5 w-5" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="gap-2 h-12 px-6 rounded-lg shadow-classic-md"
                            >
                                <Trash2 className="h-5 w-5" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {product.imagePath && imageUrl && (
                                <Card className="border border-border shadow-classic-md rounded-lg overflow-hidden animate-scale-in">
                                    <CardHeader className="bg-secondary border-b border-border">
                                        <CardTitle className="text-xl font-semibold">Product Image</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="relative w-full rounded-lg overflow-hidden bg-secondary shadow-classic">
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-full h-auto object-contain max-h-96"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {!product.imagePath && (
                                <Card className="border border-border shadow-classic-md rounded-lg overflow-hidden animate-scale-in">
                                    <CardHeader className="bg-secondary border-b border-border">
                                        <CardTitle className="text-xl font-semibold">Product Image</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-center w-full h-64 border border-dashed border-border rounded-lg bg-secondary">
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground" />
                                                <p className="mt-3 text-base text-muted-foreground">No image available</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border border-border shadow-classic-md rounded-lg overflow-hidden animate-scale-in">
                                <CardHeader className="bg-secondary border-b border-border">
                                    <CardTitle className="text-xl font-semibold">Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                            Description
                                        </h3>
                                        {product.description && product.description.trim() !== '' ? (
                                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                                                {product.description}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground italic">No description provided</p>
                                        )}
                                    </div>

                                    <Separator className="bg-border" />

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                                Category
                                            </h3>
                                            <p className="text-base font-semibold">
                                                {product.category || (
                                                    <span className="text-muted-foreground italic">Not specified</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                                Status
                                            </h3>
                                            <div className={`inline-flex px-4 py-2 rounded-md text-base font-semibold border ${getStatusColor(Number(product.status))}`}>
                                                {getStatusLabel(Number(product.status))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border border-border shadow-classic-md rounded-lg overflow-hidden animate-scale-in">
                                <CardHeader className="bg-secondary border-b border-border">
                                    <CardTitle className="text-xl font-semibold">Pricing & Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                            Price
                                        </h3>
                                        {hasDiscount ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-3xl font-semibold text-primary">
                                                        {formatPrice(discountedPrice)}
                                                    </p>
                                                    <Badge variant="destructive" className="gap-1">
                                                        <Tag className="h-3 w-3" />
                                                        {product.discount?.discountType === 'percentage' 
                                                            ? `${product.discount.value}% off`
                                                            : `$${product.discount?.value.toFixed(2)} off`
                                                        }
                                                    </Badge>
                                                </div>
                                                <p className="text-lg text-muted-foreground line-through">
                                                    {formatPrice(product.price)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-3xl font-semibold text-primary">
                                                {formatPrice(product.price)}
                                            </p>
                                        )}
                                    </div>

                                    {hasDiscount && (
                                        <>
                                            <Separator className="bg-border" />
                                            <div>
                                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                                    Discount Details
                                                </h3>
                                                <div className="space-y-1">
                                                    <p className="text-base">
                                                        <span className="font-semibold">Type:</span>{' '}
                                                        {product.discount?.discountType === 'percentage' ? 'Percentage' : 'Currency'}
                                                    </p>
                                                    <p className="text-base">
                                                        <span className="font-semibold">Value:</span>{' '}
                                                        {product.discount?.discountType === 'percentage' 
                                                            ? `${product.discount.value}%`
                                                            : formatPrice(product.discount?.value || 0)
                                                        }
                                                    </p>
                                                    <p className="text-base">
                                                        <span className="font-semibold">You save:</span>{' '}
                                                        <span className="text-destructive font-semibold">
                                                            {formatPrice(product.price - discountedPrice)}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <Separator className="bg-border" />

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                            Quantity in Stock
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-2xl font-semibold">{Number(product.quantity)}</p>
                                            <Badge
                                                variant={Number(product.quantity) > 0 ? 'default' : 'destructive'}
                                                className="font-semibold border rounded-md px-3 py-1"
                                            >
                                                {Number(product.quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator className="bg-border" />

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                            Ordering
                                        </h3>
                                        <p className="text-lg font-semibold">{Number(product.ordering)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-border shadow-classic-md rounded-lg overflow-hidden animate-scale-in">
                                <CardHeader className="bg-secondary border-b border-border">
                                    <CardTitle className="text-xl font-semibold">Audit Information</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Created By
                                        </h3>
                                        <p className="text-base font-medium">
                                            {formatUserInfo(product.createdBy, createdByProfile)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {formatTimestamp(product.created_at)}
                                        </p>
                                    </div>

                                    <Separator className="bg-border" />

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Last Edited By
                                        </h3>
                                        <p className="text-base font-medium">
                                            {formatUserInfo(product.updatedBy, updatedByProfile)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {formatTimestamp(product.updated_at)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <ProductDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                product={product}
            />

            <DeleteProductDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open && !product) {
                        navigate({ to: '/' });
                    }
                }}
                product={product}
                onDeleteSuccess={() => navigate({ to: '/' })}
            />
        </div>
    );
}
