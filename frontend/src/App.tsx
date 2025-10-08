import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { Toaster } from '@/components/ui/sonner';

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
    component: ProductsPage,
});

const productDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/product/$productId',
    component: ProductDetailPage,
});

const routeTree = rootRoute.addChildren([indexRoute, productDetailRoute]);

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
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
