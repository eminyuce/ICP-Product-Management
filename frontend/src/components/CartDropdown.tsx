import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/store/cartStore';
import { useNavigate } from '@tanstack/react-router';
import { useFileUrl } from '@/blob-storage/FileStorage';
import type { Product, DiscountType } from '@/backend';

function CartItemRow({ product, quantity }: { product: Product; quantity: number }) {
    const { updateQuantity, removeItem } = useCartStore();
    const { data: imageUrl } = useFileUrl(product.imagePath || '');

    const calculateDiscountedPrice = (price: number, discount?: { discountType: DiscountType; value: number }) => {
        if (!discount) return price;

        if (discount.discountType === 'percentage') {
            return price - (price * discount.value / 100);
        } else {
            return price - discount.value;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const price = calculateDiscountedPrice(product.price, product.discount);
    const maxQuantity = Number(product.quantity);

    return (
        <div className="flex gap-3 py-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <img
                        src="/assets/generated/product-placeholder.dim_400x300.png"
                        alt="Product placeholder"
                        className="h-full w-full object-cover opacity-50"
                    />
                )}
            </div>
            <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                    <h4 className="text-sm font-medium line-clamp-1">{product.name}</h4>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mt-1"
                        onClick={() => removeItem(product.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">{formatPrice(price)}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= maxQuantity}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function CartDropdown() {
    const navigate = useNavigate();
    const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full shadow-sm relative"
                >
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <Badge
                            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground"
                        >
                            {totalItems}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 bg-card border-border">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Shopping Cart</h3>
                        {items.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearCart}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="h-[300px] pr-4">
                                {items.map((item) => (
                                    <div key={item.product.id.toString()}>
                                        <CartItemRow
                                            product={item.product}
                                            quantity={item.quantity}
                                        />
                                        <Separator />
                                    </div>
                                ))}
                            </ScrollArea>

                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total:</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => {
                                        navigate({ to: '/checkout' });
                                    }}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
