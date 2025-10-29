import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCartStore } from '@/store/cartStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const { clearCart } = useCartStore();

    useEffect(() => {
        // Clear the cart after successful payment
        clearCart();
    }, [clearCart]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-background">
                <div className="mx-auto w-[85%] py-16">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardContent className="pt-12 pb-12">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Thank you for your purchase. Your order has been confirmed and will be processed shortly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => navigate({ to: '/' })}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
