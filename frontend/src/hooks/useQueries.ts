import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useFileUpload } from '../blob-storage/FileStorage';
import type { Product, ProductInput, ProductPage, ProductUpdateFields, ShoppingItem, UserProfile } from '@/backend';
import type { Principal } from '@icp-sdk/core/principal';

export interface ProductFilters {
    name: string;
    category: string;
    sku: string;
    status: string;
    ordering: string;
    search: string;
    createdFrom: string;
    createdTo: string;
    updatedFrom: string;
    updatedTo: string;
}

export interface ProductQueryParams {
    page: number;
    limit: number;
    filters: ProductFilters;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

// Helper function to convert date string to nanosecond timestamp
function dateToNanoseconds(dateString: string, endOfDay: boolean = false): bigint {
    const date = new Date(dateString);
    
    if (endOfDay) {
        // Set to end of day: 23:59:59.999
        date.setHours(23, 59, 59, 999);
    } else {
        // Set to start of day: 00:00:00.000
        date.setHours(0, 0, 0, 0);
    }
    
    // Convert milliseconds to nanoseconds (multiply by 1,000,000)
    return BigInt(date.getTime()) * BigInt(1_000_000);
}

export function useGetAllProducts(params: ProductQueryParams) {
    const { actor, isFetching } = useActor();

    return useQuery<ProductPage>({
        queryKey: ['products', params.page, params.limit, params.filters, params.sortBy, params.sortOrder],
        queryFn: async () => {
            if (!actor) {
                return {
                    products: [],
                    totalCount: BigInt(0),
                    currentPage: BigInt(1),
                    totalPages: BigInt(1),
                    hasNextPage: false,
                    hasPreviousPage: false,
                };
            }

            // Convert date strings to nanosecond timestamps for the backend
            // For "from" dates, use start of day (00:00:00)
            // For "to" dates, use end of day (23:59:59.999)
            const createdFrom = params.filters.createdFrom 
                ? dateToNanoseconds(params.filters.createdFrom, false)
                : null;
            const createdTo = params.filters.createdTo 
                ? dateToNanoseconds(params.filters.createdTo, true)
                : null;
            const updatedFrom = params.filters.updatedFrom 
                ? dateToNanoseconds(params.filters.updatedFrom, false)
                : null;
            const updatedTo = params.filters.updatedTo 
                ? dateToNanoseconds(params.filters.updatedTo, true)
                : null;

            return actor.getAllProducts(
                BigInt(params.page),
                BigInt(params.limit),
                params.filters.name,
                params.filters.category,
                params.filters.sku,
                BigInt(params.filters.status || '0'),
                BigInt(params.filters.ordering || '0'),
                params.sortBy,
                params.sortOrder,
                params.filters.search,
                createdFrom,
                createdTo,
                updatedFrom,
                updatedTo
            );
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetProduct(id: bigint) {
    const { actor, isFetching } = useActor();

    return useQuery<Product | null>({
        queryKey: ['product', id.toString()],
        queryFn: async () => {
            if (!actor) return null;
            return actor.getProduct(id);
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetUserProfile(principal: Principal | undefined) {
    const { actor, isFetching } = useActor();

    return useQuery<UserProfile | null>({
        queryKey: ['userProfile', principal?.toString()],
        queryFn: async () => {
            if (!actor || !principal) return null;
            return actor.getUserProfile(principal);
        },
        enabled: !!actor && !isFetching && !!principal,
    });
}

export function useGetAllCategories() {
    const { actor, isFetching } = useActor();

    return useQuery<string[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllCategories();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useCreateProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    const { uploadFile } = useFileUpload();

    return useMutation({
        mutationFn: async ({ input, imageFile }: { input: ProductInput; imageFile?: File }) => {
            if (!actor) throw new Error('Actor not initialized');

            let imagePath: string | undefined;

            // Upload image if provided
            if (imageFile) {
                const fileExtension = imageFile.name.split('.').pop() || 'jpg';
                const timestamp = Date.now();
                const path = `products/${timestamp}-${input.sku}.${fileExtension}`;
                
                const result = await uploadFile(path, imageFile);
                imagePath = result.path;
            }

            // Create product with image path
            const productInput: ProductInput = {
                ...input,
                imagePath,
            };

            return actor.createProduct(productInput);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useUpdateProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    const { uploadFile } = useFileUpload();

    return useMutation({
        mutationFn: async ({ id, input, imageFile }: { id: bigint; input: ProductInput; imageFile?: File }) => {
            if (!actor) throw new Error('Actor not initialized');

            // Get existing product to preserve imagePath if no new image
            const existingProduct = await actor.getProduct(id);
            let imagePath = existingProduct?.imagePath;

            // Upload new image if provided
            if (imageFile) {
                const fileExtension = imageFile.name.split('.').pop() || 'jpg';
                const timestamp = Date.now();
                const path = `products/${timestamp}-${input.sku}.${fileExtension}`;
                
                const result = await uploadFile(path, imageFile);
                imagePath = result.path;
            }

            // Update product with image path
            const productInput: ProductInput = {
                ...input,
                imagePath,
            };

            return actor.updateProduct(id, productInput);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useUpdateProductFields() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, fields }: { id: bigint; fields: ProductUpdateFields }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.updateProductFields(id, fields);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProductsBatch() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids, fields }: { ids: bigint[]; fields: ProductUpdateFields }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.updateProductsBatch(ids, fields);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDeleteProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: bigint) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.deleteProduct(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useDeleteProductsBatch() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: bigint[]) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.deleteProductsBatch(ids);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useBulkCreateSampleProducts() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not initialized');
            
            // Generate 100 sample products on the client side
            const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Food', 'Beauty'];
            const adjectives = ['Premium', 'Deluxe', 'Professional', 'Classic', 'Modern', 'Vintage', 'Eco-Friendly', 'Smart'];
            const nouns = ['Widget', 'Gadget', 'Tool', 'Device', 'Item', 'Product', 'Accessory', 'Kit'];
            
            const products: ProductInput[] = [];
            
            for (let i = 1; i <= 100; i++) {
                const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                const noun = nouns[Math.floor(Math.random() * nouns.length)];
                const category = categories[Math.floor(Math.random() * categories.length)];
                const status = BigInt(Math.floor(Math.random() * 11)); // 0-10
                const price = Math.round((Math.random() * 999 + 1) * 100) / 100; // $1.00 - $1000.00
                const quantity = BigInt(Math.floor(Math.random() * 500)); // 0-499
                const ordering = BigInt(i);
                
                products.push({
                    name: `${adjective} ${noun} ${i}`,
                    description: `This is a sample ${adjective.toLowerCase()} ${noun.toLowerCase()} for demonstration purposes. Product number ${i}.`,
                    price,
                    quantity,
                    category,
                    sku: `SAMPLE-${String(i).padStart(4, '0')}`,
                    status,
                    ordering,
                    imagePath: undefined,
                });
            }
            
            // Create all products
            const results = await Promise.all(
                products.map(product => actor.createProduct(product))
            );
            
            return results.length;
        },
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            return count;
        },
    });
}

export function useCreateCheckoutSession() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.createCheckoutSession(items, successUrl, cancelUrl);
        },
    });
}

export function useIsStripeConfigured() {
    const { actor, isFetching } = useActor();

    return useQuery<boolean>({
        queryKey: ['stripeConfigured'],
        queryFn: async () => {
            if (!actor) return false;
            return actor.isStripeConfigured();
        },
        enabled: !!actor && !isFetching,
    });
}
