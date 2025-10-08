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
import { useDeleteProductsBatch } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface BatchDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productIds: bigint[];
    productCount: number;
}

export default function BatchDeleteDialog({
    open,
    onOpenChange,
    productIds,
    productCount,
}: BatchDeleteDialogProps) {
    const deleteMutation = useDeleteProductsBatch();
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    const handleDelete = async () => {
        if (productIds.length === 0) return;

        try {
            const result = await deleteMutation.mutateAsync(productIds);
            const deletedCount = Number(result.deletedCount);
            toast.success(`Successfully deleted ${deletedCount} product${deletedCount !== 1 ? 's' : ''}`);
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete products');
        }
    };

    // Focus cancel button when dialog opens
    useEffect(() => {
        if (open && cancelButtonRef.current) {
            setTimeout(() => {
                cancelButtonRef.current?.focus();
            }, 100);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Multiple Products</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>{productCount}</strong> selected product{productCount !== 1 ? 's' : ''}?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={deleteMutation.isPending}
                        ref={cancelButtonRef}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete {productCount} Product{productCount !== 1 ? 's' : ''}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
