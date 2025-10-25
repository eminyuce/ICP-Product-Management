import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, CreditCard } from 'lucide-react';
import { useGetStripeConfiguration, useSetStripeConfiguration } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function StripeConfigPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { data: existingConfig, isLoading: configLoading } = useGetStripeConfiguration();
    const setConfig = useSetStripeConfiguration();

    const [secretKey, setSecretKey] = useState('');
    const [allowedCountries, setAllowedCountries] = useState('');
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate({ to: '/login' });
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (existingConfig) {
            setSecretKey(existingConfig.secretKey);
            setAllowedCountries(existingConfig.allowedCountries.join(', '));
        }
    }, [existingConfig]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!secretKey.trim()) {
            toast.error('Secret key is required');
            return;
        }

        if (!allowedCountries.trim()) {
            toast.error('At least one country must be specified');
            return;
        }

        // Parse countries from comma-separated string
        const countriesArray = allowedCountries
            .split(',')
            .map(c => c.trim().toUpperCase())
            .filter(c => c.length > 0);

        if (countriesArray.length === 0) {
            toast.error('Please enter valid country codes');
            return;
        }

        try {
            await setConfig.mutateAsync({
                secretKey: secretKey.trim(),
                allowedCountries: countriesArray,
            });

            toast.success('Stripe configuration saved successfully');
            setHasChanges(false);
        } catch (error: any) {
            console.error('Error saving Stripe configuration:', error);
            toast.error(error.message || 'Failed to save Stripe configuration');
        }
    };

    const handleInputChange = () => {
        setHasChanges(true);
    };

    if (authLoading || configLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="mx-auto w-[85%] py-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="mx-auto w-[85%] py-8">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-classic">
                            <CreditCard className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Stripe Configuration</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage payment processing settings
                            </p>
                        </div>
                    </div>
                </div>

                <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        <strong>Important:</strong> Your Stripe secret key is sensitive information. Keep it secure and never share it publicly.
                        Changes to this configuration will affect all payment processing immediately.
                    </AlertDescription>
                </Alert>

                <Card className="shadow-classic border-border">
                    <CardHeader>
                        <CardTitle>Payment Configuration</CardTitle>
                        <CardDescription>
                            Configure your Stripe payment settings including API credentials and allowed countries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="secretKey" className="text-sm font-medium">
                                    Stripe Secret Key <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="secretKey"
                                        type={showSecretKey ? 'text' : 'password'}
                                        value={secretKey}
                                        onChange={(e) => {
                                            setSecretKey(e.target.value);
                                            handleInputChange();
                                        }}
                                        placeholder="sk_test_..."
                                        className="pr-10 font-mono text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecretKey(!showSecretKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showSecretKey ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Your Stripe secret key (starts with sk_test_ or sk_live_)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="allowedCountries" className="text-sm font-medium">
                                    Allowed Countries <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="allowedCountries"
                                    type="text"
                                    value={allowedCountries}
                                    onChange={(e) => {
                                        setAllowedCountries(e.target.value);
                                        handleInputChange();
                                    }}
                                    placeholder="US, CA, GB, DE, FR"
                                    className="font-mono text-sm"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Comma-separated list of ISO 3166-1 alpha-2 country codes (e.g., US, CA, GB)
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-border">
                                <Button
                                    type="submit"
                                    disabled={setConfig.isPending || !hasChanges}
                                    className="gap-2"
                                >
                                    {setConfig.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Save Configuration
                                        </>
                                    )}
                                </Button>
                                {!hasChanges && existingConfig && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Configuration saved
                                    </span>
                                )}
                            </div>
                        </form>

                        {existingConfig && (
                            <div className="mt-6 pt-6 border-t border-border">
                                <h3 className="text-sm font-medium mb-3">Current Configuration</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-muted-foreground min-w-[140px]">Secret Key:</span>
                                        <span className="font-mono text-xs">
                                            {existingConfig.secretKey.substring(0, 12)}...
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-muted-foreground min-w-[140px]">Allowed Countries:</span>
                                        <span className="font-mono text-xs">
                                            {existingConfig.allowedCountries.join(', ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-6 shadow-classic border-border">
                    <CardHeader>
                        <CardTitle className="text-base">Testing Your Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>
                            After saving your configuration, you can test payment processing by:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Adding products to the shopping cart on the public store</li>
                            <li>Proceeding to checkout</li>
                            <li>Using Stripe test card numbers (e.g., 4242 4242 4242 4242)</li>
                        </ol>
                        <p className="pt-2">
                            <strong>Note:</strong> Make sure you're using test mode credentials (sk_test_) for development and testing.
                        </p>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
