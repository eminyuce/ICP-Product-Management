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
                    <AlertDialogTitle className="text-2xl font-semibold">Delete Multiple Products</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                        Are you sure you want to delete <strong className="text-foreground">{productCount}</strong> selected product{productCount !== 1 ? 's' : ''}? 
                        This action cannot be undone.
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
                        {deleteMutation.isPending && (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        Delete {productCount} Product{productCount !== 1 ? 's' : ''}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
