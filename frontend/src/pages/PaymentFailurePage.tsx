import { useNavigate } from '@tanstack/react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-background">
                <div className="mx-auto w-[85%] py-16">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardContent className="pt-12 pb-12">
                            <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
                            <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                We couldn't process your payment. Please try again or contact support if the problem persists.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => navigate({ to: '/checkout' })}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
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
