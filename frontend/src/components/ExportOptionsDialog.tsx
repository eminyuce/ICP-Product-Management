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
                        <div className="space-y-5">
                            <div className="flex items-start space-x-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                <RadioGroupItem value="all" id="export-all" className="enhanced-radio mt-1" />
                                <Label htmlFor="export-all" className="cursor-pointer font-normal flex-1">
                                    <div className="font-semibold text-base">Export all columns</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Include all available columns in the export
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-start space-x-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                <RadioGroupItem value="visible" id="export-visible" className="enhanced-radio mt-1" />
                                <Label htmlFor="export-visible" className="cursor-pointer font-normal flex-1">
                                    <div className="font-semibold text-base">Export only visible columns</div>
                                    <div className="text-sm text-muted-foreground mt-1">
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
