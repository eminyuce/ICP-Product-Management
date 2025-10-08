import { useEffect, useState, useRef } from 'react';
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
    const firstInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
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

    useEffect(() => {
        if (product) {
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
        // Reset file selection when dialog opens/closes or product changes
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileError(null);
    }, [product, reset, open]);

    // Focus first input when dialog opens
    useEffect(() => {
        if (open && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFileError(null);

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setFileError('Only JPEG and PNG images are allowed');
            setSelectedFile(null);
            setPreviewUrl(null);
            event.target.value = '';
            return;
        }

        setSelectedFile(file);

        // Create preview URL
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
                className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    setTimeout(() => firstInputRef.current?.focus(), 100);
                }}
            >
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the product information below.'
                            : 'Fill in the details to create a new product.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="Enter product name"
                                ref={firstInputRef}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Enter product description..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image">Product Image (Optional)</Label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleFileChange}
                                        disabled={isLoading}
                                        className="cursor-pointer"
                                    />
                                    {selectedFile && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={clearFile}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
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
                                    <div className="relative w-full max-w-xs rounded-lg border bg-muted/30 p-2">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-auto rounded object-contain max-h-48"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                onClick={clearFile}
                                                disabled={isLoading}
                                                className="h-7 w-7"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {!previewUrl && !selectedFile && (
                                    <div className="flex items-center justify-center w-full max-w-xs h-32 border-2 border-dashed rounded-lg bg-muted/20">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-xs text-muted-foreground">No image selected</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">
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
                                />
                                {errors.price && (
                                    <p className="text-sm text-destructive">{errors.price.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">
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
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-destructive">{errors.quantity.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    {...register('category')}
                                    placeholder="Enter category"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={statusValue}
                                    onValueChange={(value) => setValue('status', value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                            <SelectItem key={status} value={status}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sku">
                                    SKU <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="sku"
                                    {...register('sku', { required: 'SKU is required' })}
                                    placeholder="Enter SKU"
                                />
                                {errors.sku && (
                                    <p className="text-sm text-destructive">{errors.sku.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ordering">Ordering</Label>
                                <Input
                                    id="ordering"
                                    type="number"
                                    {...register('ordering', {
                                        min: { value: 0, message: 'Ordering cannot be negative' },
                                    })}
                                    placeholder="0"
                                />
                                {errors.ordering && (
                                    <p className="text-sm text-destructive">{errors.ordering.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update Product' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
