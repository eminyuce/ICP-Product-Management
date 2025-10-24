import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteProduct } from '@/hooks/useQueries';
import type { Product } from '@/backend';
import { toast } from 'sonner';

interface DeleteProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product;
    onDeleteSuccess?: () => void;
}

export default function DeleteProductDialog({ 
    open, 
    onOpenChange, 
    product,
    onDeleteSuccess 
}: DeleteProductDialogProps) {
    const deleteMutation = useDeleteProduct();
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    const handleDelete = async () => {
        if (!product) return;

        try {
            await deleteMutation.mutateAsync(product.id);
            toast.success('Product deleted successfully');
            onOpenChange(false);
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete product');
        }
    };

    useEffect(() => {
        if (open && cancelButtonRef.current) {
            setTimeout(() => {
                cancelButtonRef.current?.focus();
            }, 100);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="modal-solid-bg border border-destructive shadow-classic-xl rounded-lg">
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle className="text-2xl font-semibold">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                        This will permanently delete the product <strong className="text-foreground">"{product?.name}"</strong>. This action cannot be
                        undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel 
                        disabled={deleteMutation.isPending}
                        ref={cancelButtonRef}
                        className="h-11 px-6 rounded-lg"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="h-11 px-6 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-classic-md"
                    >
                        {deleteMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
