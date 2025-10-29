import { Package } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import CartDropdown from './CartDropdown';

export default function CustomerHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-md">
            <div className="mx-auto w-[85%] flex h-20 items-center justify-between">
                <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary shadow-md">
                        <Package className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-primary">
                            ProductHub
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Your Shopping Destination
                        </p>
                    </div>
                </Link>
                <CartDropdown />
            </div>
        </header>
    );
}
