import { Package } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto w-[85%] flex h-16 items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <Package className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">ProductHub</h2>
                        <p className="text-xs text-muted-foreground">Inventory System</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
