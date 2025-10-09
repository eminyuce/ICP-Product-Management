import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface ColumnVisibility {
    id: boolean;
    name: boolean;
    price: boolean;
    quantity: boolean;
    category: boolean;
    sku: boolean;
    status: boolean;
    ordering: boolean;
    created_at: boolean;
    updated_at: boolean;
}

interface ManageColumnsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columnVisibility: ColumnVisibility;
    onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
}

const COLUMN_LABELS: Record<keyof ColumnVisibility, string> = {
    id: 'ID',
    name: 'Name',
    price: 'Price',
    quantity: 'Quantity',
    category: 'Category',
    sku: 'SKU',
    status: 'Status',
    ordering: 'Ordering',
    created_at: 'Created At',
    updated_at: 'Updated At',
};

export default function ManageColumnsDialog({
    open,
    onOpenChange,
    columnVisibility,
    onColumnVisibilityChange,
}: ManageColumnsDialogProps) {
    const [localVisibility, setLocalVisibility] = useState<ColumnVisibility>(columnVisibility);

    useEffect(() => {
        setLocalVisibility(columnVisibility);
    }, [columnVisibility]);

    const handleToggle = (column: keyof ColumnVisibility) => {
        setLocalVisibility((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const handleApply = () => {
        onColumnVisibilityChange(localVisibility);
        onOpenChange(false);
    };

    const handleCancel = () => {
        setLocalVisibility(columnVisibility);
        onOpenChange(false);
    };

    const handleSelectAll = () => {
        const allVisible = Object.keys(COLUMN_LABELS).reduce((acc, key) => {
            acc[key as keyof ColumnVisibility] = true;
            return acc;
        }, {} as ColumnVisibility);
        setLocalVisibility(allVisible);
    };

    const handleDeselectAll = () => {
        const allHidden = Object.keys(COLUMN_LABELS).reduce((acc, key) => {
            acc[key as keyof ColumnVisibility] = false;
            return acc;
        }, {} as ColumnVisibility);
        setLocalVisibility(allHidden);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] modal-solid-bg border border-border shadow-classic-xl rounded-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                        <Settings className="h-5 w-5" />
                        Manage Columns
                    </DialogTitle>
                    <DialogDescription>
                        Select which columns to display in the product table.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className="rounded-md"
                        >
                            Select All
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAll}
                            className="rounded-md"
                        >
                            Deselect All
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(COLUMN_LABELS) as Array<keyof ColumnVisibility>).map((column) => (
                            <div key={column} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`column-${column}`}
                                    checked={localVisibility[column]}
                                    onCheckedChange={() => handleToggle(column)}
                                />
                                <Label
                                    htmlFor={`column-${column}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {COLUMN_LABELS[column]}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel} className="rounded-lg">
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleApply} className="rounded-lg shadow-classic">
                        Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
