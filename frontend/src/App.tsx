import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CustomerProductDetailPage from './pages/CustomerProductDetailPage';
import AdminProductDetailPage from './pages/AdminProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import LoginPage from './pages/LoginPage';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-background">
            <Outlet />
            <Toaster />
        </div>
    ),
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomePage,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: ProductsPage,
});

const customerProductDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/product/$productId',
    component: CustomerProductDetailPage,
});

const adminProductDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/product/$productId',
    component: AdminProductDetailPage,
});

const checkoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/checkout',
    component: CheckoutPage,
});

const paymentSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-success',
    component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-failure',
    component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    adminRoute,
    customerProductDetailRoute,
    adminProductDetailRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
