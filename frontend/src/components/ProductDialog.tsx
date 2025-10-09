import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useQueries';
import type { Product, ProductInput } from '@/backend';
import { toast } from 'sonner';
import { STATUS_LABELS } from '@/lib/statusLabels';

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product;
}

interface FormData {
    name: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    sku: string;
    status: string;
    ordering: string;
}

export default function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
    const isEditing = !!product;
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setFocus,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: '',
            description: '',
            price: '',
            quantity: '0',
            category: '',
            sku: '',
            status: '0',
            ordering: '0',
        },
    });

    const statusValue = watch('status');

    // Reset form when dialog opens or product changes
    useEffect(() => {
        if (open) {
            if (product) {
                // Editing mode - populate with product data
                reset({
                    name: product.name,
                    description: product.description,
                    price: product.price.toString(),
                    quantity: Number(product.quantity).toString(),
                    category: product.category,
                    sku: product.sku,
                    status: Number(product.status).toString(),
                    ordering: Number(product.ordering).toString(),
                });
            } else {
                // Creation mode - reset to empty values
                reset({
                    name: '',
                    description: '',
                    price: '',
                    quantity: '0',
                    category: '',
                    sku: '',
                    status: '0',
                    ordering: '0',
                });
            }
            // Clear file selection when dialog opens
            setSelectedFile(null);
            setPreviewUrl(null);
            setFileError(null);

            // Focus the name field after a short delay
            setTimeout(() => {
                setFocus('name');
            }, 100);
        }
    }, [open, product, reset, setFocus]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFileError(null);

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setFileError('Only JPEG and PNG images are allowed');
            setSelectedFile(null);
            setPreviewUrl(null);
            event.target.value = '';
            return;
        }

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileError(null);
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const onSubmit = async (data: FormData) => {
        const input: ProductInput = {
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            quantity: BigInt(parseInt(data.quantity)),
            category: data.category,
            sku: data.sku,
            status: BigInt(parseInt(data.status)),
            ordering: BigInt(parseInt(data.ordering)),
        };

        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id: product.id, input, imageFile: selectedFile || undefined });
                toast.success('Product updated successfully');
            } else {
                await createMutation.mutateAsync({ input, imageFile: selectedFile || undefined });
                toast.success('Product created successfully');
            }
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto modal-solid-bg border border-border shadow-classic-xl rounded-lg"
            >
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-semibold text-primary">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {isEditing
                            ? 'Update the product information below.'
                            : 'Fill in the details to create a new product.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-semibold">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="Enter product name"
                                className="h-11 border border-border rounded-lg"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Enter product description..."
                                rows={4}
                                className="resize-none border border-border rounded-lg"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image" className="text-sm font-semibold">Product Image (Optional)</Label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleFileChange}
                                        disabled={isLoading}
                                        className="cursor-pointer border border-border rounded-lg"
                                    />
                                    {selectedFile && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={clearFile}
                                            disabled={isLoading}
                                            className="rounded-lg"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Accepted formats: JPEG, PNG
                                </p>
                                {fileError && (
                                    <p className="text-sm text-destructive">{fileError}</p>
                                )}
                                {previewUrl && (
                                    <div className="relative w-full max-w-xs rounded-lg border border-border bg-secondary p-3 shadow-classic">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-auto rounded-md object-contain max-h-48"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                onClick={clearFile}
                                                disabled={isLoading}
                                                className="h-8 w-8 rounded-md shadow-classic"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {!previewUrl && !selectedFile && (
                                    <div className="flex items-center justify-center w-full max-w-xs h-32 border border-dashed border-border rounded-lg bg-secondary">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                                            <p className="mt-2 text-xs text-muted-foreground">No image selected</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price" className="text-sm font-semibold">
                                    Price <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register('price', {
                                        required: 'Price is required',
                                        min: { value: 0.01, message: 'Price must be greater than 0' },
                                    })}
                                    placeholder="0.00"
                                    className="h-11 border border-border rounded-lg"
                                />
                                {errors.price && (
                                    <p className="text-sm text-destructive">{errors.price.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity" className="text-sm font-semibold">
                                    Quantity <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    {...register('quantity', {
                                        required: 'Quantity is required',
                                        min: { value: 0, message: 'Quantity cannot be negative' },
                                    })}
                                    placeholder="0"
                                    className="h-11 border border-border rounded-lg"
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-destructive">{errors.quantity.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                                <Input
                                    id="category"
                                    {...register('category')}
                                    placeholder="Enter category"
                                    className="h-11 border border-border rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
                                <Select
                                    value={statusValue}
                                    onValueChange={(value) => setValue('status', value)}
                                >
                                    <SelectTrigger id="status" className="h-11 border border-border rounded-lg">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="border border-border shadow-classic-lg rounded-lg">
                                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                            <SelectItem key={status} value={status} className="rounded-md">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sku" className="text-sm font-semibold">
                                    SKU <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="sku"
                                    {...register('sku', { required: 'SKU is required' })}
                                    placeholder="Enter SKU"
                                    className="h-11 border border-border rounded-lg"
                                />
                                {errors.sku && (
                                    <p className="text-sm text-destructive">{errors.sku.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ordering" className="text-sm font-semibold">Ordering</Label>
                                <Input
                                    id="ordering"
                                    type="number"
                                    {...register('ordering', {
                                        min: { value: 0, message: 'Ordering cannot be negative' },
                                    })}
                                    placeholder="0"
                                    className="h-11 border border-border rounded-lg"
                                />
                                {errors.ordering && (
                                    <p className="text-sm text-destructive">{errors.ordering.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="h-11 px-6 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-6 rounded-lg shadow-classic-md"
                        >
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isEditing ? 'Update Product' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
