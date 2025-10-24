import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCartStore } from '@/store/cartStore';
import { useCreateCheckoutSession } from '@/hooks/useQueries';
import { useFileUrl } from '@/blob-storage/FileStorage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShoppingBag, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, DiscountType } from '@/backend';

function CheckoutItem({ product, quantity }: { product: Product; quantity: number }) {
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
    const subtotal = price * quantity;

    return (
        <div className="flex gap-4 py-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
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
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground">{formatPrice(price)} each</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, getTotalPrice } = useCartStore();
    const createCheckoutSession = useCreateCheckoutSession();
    const [isProcessing, setIsProcessing] = useState(false);

    const totalPrice = getTotalPrice();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const handleCheckout = async () => {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsProcessing(true);

        try {
            // Convert cart items to Stripe shopping items
            const shoppingItems = items.map((item) => {
                const calculateDiscountedPrice = (price: number, discount?: { discountType: DiscountType; value: number }) => {
                    if (!discount) return price;

                    if (discount.discountType === 'percentage') {
                        return price - (price * discount.value / 100);
                    } else {
                        return price - discount.value;
                    }
                };

                const price = calculateDiscountedPrice(item.product.price, item.product.discount);
                const priceInCents = Math.round(price * 100);

                return {
                    productName: item.product.name,
                    productDescription: item.product.description,
                    priceInCents: BigInt(priceInCents),
                    quantity: BigInt(item.quantity),
                    currency: 'usd',
                };
            });

            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const successUrl = `${baseUrl}/payment-success`;
            const cancelUrl = `${baseUrl}/payment-failure`;

            const result = await createCheckoutSession.mutateAsync({
                items: shoppingItems,
                successUrl,
                cancelUrl,
            });

            // Parse the JSON result to get the session URL
            const session = JSON.parse(result);
            
            // Redirect to Stripe checkout
            window.location.href = session.url;
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to create checkout session. Please ensure Stripe is configured.');
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 bg-background">
                    <div className="mx-auto w-[85%] py-16">
                        <Card className="max-w-md mx-auto text-center">
                            <CardContent className="pt-12 pb-12">
                                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                                <p className="text-muted-foreground mb-6">
                                    Add some products to your cart to continue shopping
                                </p>
                                <Button onClick={() => navigate({ to: '/' })}>
                                    Continue Shopping
                                </Button>
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
            <main className="flex-1 bg-background">
                <div className="mx-auto w-[85%] py-8">
                    <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Summary */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[500px] pr-4">
                                        {items.map((item, index) => (
                                            <div key={item.product.id.toString()}>
                                                <CheckoutItem
                                                    product={item.product}
                                                    quantity={item.quantity}
                                                />
                                                {index < items.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Payment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>{formatPrice(totalPrice)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-5 w-5" />
                                                Proceed to Payment
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-muted-foreground text-center">
                                        Secure payment powered by Stripe
                                    </p>
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
