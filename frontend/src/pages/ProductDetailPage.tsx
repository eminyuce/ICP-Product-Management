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
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 w-full">
                    <div className="mx-auto w-[85%] py-8">
                        <div className="mb-6">
                            <Skeleton className="h-10 w-32 mb-4" />
                            <Skeleton className="h-12 w-96 mb-2" />
                            <Skeleton className="h-6 w-64" />
                        </div>
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
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
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 w-full">
                    <div className="mx-auto w-[85%] py-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate({ to: '/' })}
                            className="mb-6 gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Products
                        </Button>
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <Package className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">Product not found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
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
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 w-full">
                <div className="mx-auto w-[85%] py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ to: '/' })}
                        className="mb-6 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Button>

                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-sm">
                                    ID: {Number(product.id)}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    SKU: {product.sku}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(true)}
                                className="gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {product.imagePath && imageUrl && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Image</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative w-full rounded-lg overflow-hidden bg-muted/30">
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Image</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-muted/20">
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                <p className="mt-2 text-sm text-muted-foreground">No image available</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
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

                                    <Separator />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                                Category
                                            </h3>
                                            <p className="text-base">
                                                {product.category || (
                                                    <span className="text-muted-foreground italic">Not specified</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                                Status
                                            </h3>
                                            <div className={`inline-flex px-3 py-1.5 rounded text-sm font-medium ${getStatusColor(Number(product.status))}`}>
                                                {getStatusLabel(Number(product.status))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing & Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Price
                                        </h3>
                                        <p className="text-2xl font-bold">{formatPrice(product.price)}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Quantity in Stock
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-semibold">{Number(product.quantity)}</p>
                                            <Badge
                                                variant={Number(product.quantity) > 0 ? 'default' : 'destructive'}
                                            >
                                                {Number(product.quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Ordering
                                        </h3>
                                        <p className="text-base">{Number(product.ordering)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Timestamps</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Created
                                        </h3>
                                        <p className="text-sm">{formatTimestamp(product.created_at)}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
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
