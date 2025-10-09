import { useState } from 'react';
import { Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ExportOptionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExport: (exportType: 'all' | 'visible') => void;
}

export default function ExportOptionsDialog({
    open,
    onOpenChange,
    onExport,
}: ExportOptionsDialogProps) {
    const [exportType, setExportType] = useState<'all' | 'visible'>('visible');

    const handleExport = () => {
        onExport(exportType);
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] modal-solid-bg border border-border shadow-classic-xl rounded-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                        <Download className="h-5 w-5" />
                        Export Options
                    </DialogTitle>
                    <DialogDescription>
                        Choose which columns to include in the Excel export.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <RadioGroup value={exportType} onValueChange={(value) => setExportType(value as 'all' | 'visible')}>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="all" id="export-all" />
                                <Label htmlFor="export-all" className="cursor-pointer font-normal">
                                    <div className="font-medium">Export all columns</div>
                                    <div className="text-sm text-muted-foreground">
                                        Include all available columns in the export
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="visible" id="export-visible" />
                                <Label htmlFor="export-visible" className="cursor-pointer font-normal">
                                    <div className="font-medium">Export only visible columns</div>
                                    <div className="text-sm text-muted-foreground">
                                        Export only the columns currently shown in the table
                                    </div>
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel} className="rounded-lg">
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleExport} className="gap-2 rounded-lg shadow-classic">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
