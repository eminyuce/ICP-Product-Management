import { ArrowLeft, Edit, Trash2, Package, ImageIcon } from 'lucide-react';
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
import { useGetProduct } from '@/hooks/useQueries';
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
                                        <p className="text-3xl font-semibold text-primary">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>

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
                                    <CardTitle className="text-xl font-semibold">Timestamps</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                            Created
                                        </h3>
                                        <p className="text-sm">{formatTimestamp(product.created_at)}</p>
                                    </div>

                                    <Separator className="bg-border" />

                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                            Last Updated
                                        </h3>
                                        <p className="text-sm">{formatTimestamp(product.updated_at)}</p>
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
