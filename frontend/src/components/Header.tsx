import { useNavigate } from '@tanstack/react-router';
import { Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const navigate = useNavigate();
    const { userEmail, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate({ to: '/login' });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-classic">
            <div className="mx-auto w-[85%] flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-classic">
                        <Package className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary">ProductHub Admin</h1>
                        <p className="text-xs text-muted-foreground">Management Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{userEmail}</p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="gap-2 h-9 px-4 border-border shadow-classic"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}
