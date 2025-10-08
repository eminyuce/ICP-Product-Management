import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/ProductTable';
import ProductDialog from '@/components/ProductDialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 w-full">
                <div className="mx-auto w-[85%] py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Product Management</h1>
                            <p className="mt-2 text-muted-foreground">
                                Manage your product inventory with ease
                            </p>
                        </div>
                        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
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
