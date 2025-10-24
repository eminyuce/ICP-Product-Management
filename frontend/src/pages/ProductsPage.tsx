import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/ProductTable';
import ProductDialog from '@/components/ProductDialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate({ to: '/login' });
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
            <Header />
            
            <main className="flex-1 w-full">
                <div className="mx-auto w-[85%] py-12">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                    Product Management
                                </h1>
                                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground">
                                Manage your product inventory with modern elegance
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsDialogOpen(true)} 
                            size="lg" 
                            className="gap-2 h-14 px-8 text-base font-bold shadow-modern-lg hover:shadow-modern-xl transition-all hover:scale-105"
                        >
                            <Plus className="h-6 w-6" />
                            Add Product
                        </Button>
                    </div>

                    <ProductTable />
                    
                    <ProductDialog 
                        open={isDialogOpen} 
                        onOpenChange={setIsDialogOpen}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
