import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Lock, Mail, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate({ to: '/admin' });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                navigate({ to: '/admin' });
            } else {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
            <Card className="w-full max-w-md border-border shadow-classic-lg">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary shadow-classic">
                        <Package className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold text-primary">Admin Login</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Sign in to access the admin dashboard
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="border-destructive">
                                <AlertCircle className="h-5 w-5" />
                                <AlertDescription className="ml-2">{error}</AlertDescription>
                            </Alert>
                        )}

                        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="ml-2 text-blue-800 dark:text-blue-200">
                                After entering credentials, you'll be prompted to authenticate with Internet Identity for secure access.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base font-semibold">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 h-12 text-base border-border"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-base font-semibold">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 h-12 text-base border-border"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold shadow-classic-md"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
                            <p>Test Account:</p>
                            <p className="font-mono mt-1">testaccount@gmail.com / 456789</p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
