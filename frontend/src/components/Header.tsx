import { Package } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-classic">
            <div className="mx-auto w-[85%] flex h-20 items-center">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary shadow-classic">
                        <Package className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-primary">
                            ProductHub
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Classic Inventory System
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
