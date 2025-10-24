import { useState } from 'react';
import { Edit, Trash2, Package, Search, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, Download, CheckSquare, Square, Eye, Plus, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from '@tanstack/react-router';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import { useGetAllProducts, useGetAllCategories, useUpdateProductFields, useUpdateProductsBatch, useBulkCreateSampleProducts, type ProductFilters } from '@/hooks/useQueries';
import ProductDialog from './ProductDialog';
import DeleteProductDialog from './DeleteProductDialog';
import BatchDeleteDialog from './BatchDeleteDialog';
import ManageColumnsDialog, { type ColumnVisibility } from './ManageColumnsDialog';
import ExportOptionsDialog from './ExportOptionsDialog';
import type { Product } from '@/backend';
import React from 'react';
import { toast } from 'sonner';
import { STATUS_LABELS, getStatusLabel } from '@/lib/statusLabels';
import { getStatusColor } from '@/lib/statusColors';

type SortField = 'id' | 'name' | 'sku' | 'category' | 'price' | 'quantity' | 'status' | 'ordering' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 250];

const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
    id: true,
    name: true,
    price: true,
    quantity: true,
    category: true,
    sku: true,
    status: true,
    ordering: true,
    discount: true,
    created_at: true,
    updated_at: true,
};

export default function ProductTable() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState<ProductFilters>({
        name: '',
        category: '',
        sku: '',
        status: '',
        ordering: '',
        search: '',
        createdFrom: '',
        createdTo: '',
        updatedFrom: '',
        updatedTo: '',
    });
    const [tempFilters, setTempFilters] = useState<ProductFilters>(filters);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortField>('ordering');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<bigint>>(new Set());
    const [showBatchDelete, setShowBatchDelete] = useState(false);
    const [editingCell, setEditingCell] = useState<{ id: bigint; field: 'price' | 'quantity' | 'status' | 'ordering' } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
    const [showManageColumns, setShowManageColumns] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);

    const { data: productPage, isLoading } = useGetAllProducts({
        page: currentPage,
        limit: pageSize,
        filters,
        sortBy,
        sortOrder,
    });

    const { data: categories = [] } = useGetAllCategories();

    const updateFieldsMutation = useUpdateProductFields();
    const updateBatchMutation = useUpdateProductsBatch();
    const bulkCreateSampleMutation = useBulkCreateSampleProducts();

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        const emptyFilters: ProductFilters = { 
            name: '', 
            category: '', 
            sku: '', 
            status: '', 
            ordering: '', 
            search: '',
            createdFrom: '',
            createdTo: '',
            updatedFrom: '',
            updatedTo: '',
        };
        setTempFilters(emptyFilters);
        setFilters(emptyFilters);
        setCurrentPage(1);
    };

    const handleRemoveFilter = (filterKey: keyof ProductFilters) => {
        const newFilters = { ...filters, [filterKey]: '' };
        setFilters(newFilters);
        setTempFilters(newFilters);
        setCurrentPage(1);
    };

    const handleGlobalSearch = () => {
        setFilters({ ...filters, search: globalSearch });
        setCurrentPage(1);
    };

    const handleClearGlobalSearch = () => {
        setGlobalSearch('');
        setFilters({ ...filters, search: '' });
        setCurrentPage(1);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: string) => {
        setPageSize(parseInt(newSize));
        setCurrentPage(1);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(products.map(p => p.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: bigint, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleStartEdit = (product: Product, field: 'price' | 'quantity' | 'status' | 'ordering') => {
        setEditingCell({ id: product.id, field });
        if (field === 'price') {
            setEditValue(product.price.toString());
        } else if (field === 'quantity') {
            setEditValue(product.quantity.toString());
        } else if (field === 'status') {
            setEditValue(product.status.toString());
        } else {
            setEditValue(product.ordering.toString());
        }
    };

    const handleSaveEdit = async () => {
        if (!editingCell) return;

        const numValue = parseFloat(editValue);
        if (isNaN(numValue)) {
            toast.error('Please enter a valid number');
            setEditingCell(null);
            return;
        }

        try {
            const fields: any = {};
            if (editingCell.field === 'price') {
                fields.price = numValue;
            } else if (editingCell.field === 'quantity') {
                fields.quantity = BigInt(Math.floor(numValue));
            } else if (editingCell.field === 'status') {
                const statusVal = Math.floor(numValue);
                if (statusVal < 0 || statusVal > 10) {
                    toast.error('Status must be between 0 and 10');
                    return;
                }
                fields.status = BigInt(statusVal);
            } else if (editingCell.field === 'ordering') {
                fields.ordering = BigInt(Math.floor(numValue));
            }

            await updateFieldsMutation.mutateAsync({ id: editingCell.id, fields });
            toast.success(`${editingCell.field.charAt(0).toUpperCase() + editingCell.field.slice(1)} updated successfully`);
            setEditingCell(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update');
        }
    };

    const handleStatusChange = async (productId: bigint, newStatus: string) => {
        try {
            const statusValue = BigInt(parseInt(newStatus));
            await updateFieldsMutation.mutateAsync({ 
                id: productId, 
                fields: { status: statusValue } 
            });
            toast.success('Status updated successfully');
            setEditingCell(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update status');
        }
    };

    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleBatchUpdateStatus = async (status: bigint) => {
        if (selectedIds.size === 0) {
            toast.error('No products selected');
            return;
        }

        try {
            await updateBatchMutation.mutateAsync({
                ids: Array.from(selectedIds),
                fields: { status },
            });
            toast.success(`Updated status for ${selectedIds.size} product(s)`);
            setSelectedIds(new Set());
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update status');
        }
    };

    const handleBulkCreateSamples = async () => {
        try {
            const count = await bulkCreateSampleMutation.mutateAsync();
            toast.success(`Successfully created ${count} sample products!`);
            setCurrentPage(1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create sample products');
        }
    };

    const formatDiscountDisplay = (product: Product): string => {
        if (!product.discount) return '—';
        
        if (product.discount.discountType === 'percentage') {
            return `${product.discount.value}% off`;
        } else {
            return `$${product.discount.value.toFixed(2)} off`;
        }
    };

    const handleExport = (exportType: 'all' | 'visible') => {
        if (products.length === 0) {
            toast.error('No data to export');
            return;
        }

        const allColumns = [
            { key: 'id', label: 'ID', visible: columnVisibility.id },
            { key: 'name', label: 'Name', visible: columnVisibility.name },
            { key: 'sku', label: 'SKU', visible: columnVisibility.sku },
            { key: 'category', label: 'Category', visible: columnVisibility.category },
            { key: 'price', label: 'Price', visible: columnVisibility.price },
            { key: 'quantity', label: 'Quantity', visible: columnVisibility.quantity },
            { key: 'status', label: 'Status', visible: columnVisibility.status },
            { key: 'ordering', label: 'Ordering', visible: columnVisibility.ordering },
            { key: 'discount', label: 'Discount', visible: columnVisibility.discount },
            { key: 'created_at', label: 'Created', visible: columnVisibility.created_at },
            { key: 'updated_at', label: 'Updated', visible: columnVisibility.updated_at },
        ];

        const columnsToExport = exportType === 'all' 
            ? allColumns 
            : allColumns.filter(col => col.visible);

        if (columnsToExport.length === 0) {
            toast.error('No columns selected for export');
            return;
        }

        const headers = columnsToExport.map(col => col.label);
        const rows = products.map(p => {
            return columnsToExport.map(col => {
                switch (col.key) {
                    case 'id':
                        return Number(p.id);
                    case 'name':
                        return p.name;
                    case 'sku':
                        return p.sku;
                    case 'category':
                        return p.category;
                    case 'price':
                        return p.price;
                    case 'quantity':
                        return Number(p.quantity);
                    case 'status':
                        return getStatusLabel(Number(p.status));
                    case 'ordering':
                        return Number(p.ordering);
                    case 'discount':
                        return formatDiscountDisplay(p);
                    case 'created_at':
                        return formatTimestamp(p.created_at);
                    case 'updated_at':
                        return formatTimestamp(p.updated_at);
                    default:
                        return '';
                }
            });
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Products exported successfully');
    };

    const getActiveFilters = () => {
        const activeFilters: Array<{ key: keyof ProductFilters; label: string; value: string }> = [];

        if (filters.search) {
            activeFilters.push({ key: 'search', label: 'Search', value: filters.search });
        }
        if (filters.name) {
            activeFilters.push({ key: 'name', label: 'Name', value: filters.name });
        }
        if (filters.category) {
            activeFilters.push({ key: 'category', label: 'Category', value: filters.category });
        }
        if (filters.sku) {
            activeFilters.push({ key: 'sku', label: 'SKU', value: filters.sku });
        }
        if (filters.status) {
            const statusLabel = getStatusLabel(parseInt(filters.status));
            activeFilters.push({ key: 'status', label: 'Status', value: statusLabel });
        }
        if (filters.ordering) {
            activeFilters.push({ key: 'ordering', label: 'Ordering', value: filters.ordering });
        }
        if (filters.createdFrom || filters.createdTo) {
            const fromDate = filters.createdFrom ? format(new Date(filters.createdFrom), 'MMM d, yyyy') : '...';
            const toDate = filters.createdTo ? format(new Date(filters.createdTo), 'MMM d, yyyy') : '...';
            activeFilters.push({ 
                key: 'createdFrom', 
                label: 'Created Date', 
                value: `${fromDate} - ${toDate}` 
            });
        }
        if (filters.updatedFrom || filters.updatedTo) {
            const fromDate = filters.updatedFrom ? format(new Date(filters.updatedFrom), 'MMM d, yyyy') : '...';
            const toDate = filters.updatedTo ? format(new Date(filters.updatedTo), 'MMM d, yyyy') : '...';
            activeFilters.push({ 
                key: 'updatedFrom', 
                label: 'Updated Date', 
                value: `${fromDate} - ${toDate}` 
            });
        }

        return activeFilters;
    };

    const handleRemoveDateRangeFilter = (filterType: 'created' | 'updated') => {
        if (filterType === 'created') {
            const newFilters = { ...filters, createdFrom: '', createdTo: '' };
            setFilters(newFilters);
            setTempFilters(newFilters);
        } else {
            const newFilters = { ...filters, updatedFrom: '', updatedTo: '' };
            setFilters(newFilters);
            setTempFilters(newFilters);
        }
        setCurrentPage(1);
    };

    const activeFilters = getActiveFilters();
    const hasActiveFilters = activeFilters.length > 0;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-lg" />
                    <Skeleton className="h-12 w-32 rounded-lg" />
                </div>
                {showFilters && (
                    <Card className="bg-card border border-border shadow-classic-md rounded-lg">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card className="bg-card border border-border shadow-classic-md rounded-lg">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-lg" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const products = productPage?.products || [];
    const totalCount = Number(productPage?.totalCount || 0);
    const totalPages = Number(productPage?.totalPages || 1);
    const hasNextPage = productPage?.hasNextPage || false;
    const hasPreviousPage = productPage?.hasPreviousPage || false;

    const allSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));
    const someSelected = products.some(p => selectedIds.has(p.id)) && !allSelected;

    const formatTimestamp = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1_000_000);
        return format(date, 'MMM d, yyyy HH:mm');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const renderSortIcon = (field: SortField) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    const renderPaginationItems = () => {
        const items: React.ReactElement[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                            className="rounded-md"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={() => setCurrentPage(1)}
                        isActive={currentPage === 1}
                        className="rounded-md"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (currentPage > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                            className="rounded-md"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (currentPage < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={currentPage === totalPages}
                        className="rounded-md"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <>
            <div className="mb-6 space-y-5 animate-slide-up">
                <div className="flex gap-3">
                    <Input
                        placeholder="Search across all fields..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                        className="flex-1 h-12 bg-input border border-border rounded-lg shadow-classic"
                    />
                    <Button onClick={handleGlobalSearch} className="gap-2 h-12 px-6 rounded-lg shadow-classic">
                        <Search className="h-5 w-5" />
                        Search
                    </Button>
                    {filters.search && (
                        <Button variant="outline" onClick={handleClearGlobalSearch} className="gap-2 h-12 px-6 rounded-lg shadow-classic">
                            <X className="h-5 w-5" />
                            Clear
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2 h-11 px-5 rounded-lg shadow-classic"
                    >
                        <Filter className="h-5 w-5" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>

                    {selectedIds.size > 0 && (
                        <>
                            {!allSelected && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleSelectAll(true)}
                                    className="gap-2 h-11 px-5 rounded-lg shadow-classic"
                                >
                                    <CheckSquare className="h-5 w-5" />
                                    Select All
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setSelectedIds(new Set())}
                                className="gap-2 h-11 px-5 rounded-lg shadow-classic"
                            >
                                <Square className="h-5 w-5" />
                                Deselect All
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowBatchDelete(true)}
                                className="gap-2 h-11 px-5 rounded-lg shadow-classic-md"
                            >
                                <Trash2 className="h-5 w-5" />
                                Delete Selected ({selectedIds.size})
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-11 px-5 rounded-lg shadow-classic">
                                        Product State Selection
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-popover border border-border shadow-classic-lg rounded-lg">
                                    <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                        <DropdownMenuItem
                                            key={status}
                                            onClick={() => handleBatchUpdateStatus(BigInt(status))}
                                            className="rounded-md"
                                        >
                                            {label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => setShowManageColumns(true)}
                        className="gap-2 h-11 px-5 rounded-lg shadow-classic ml-auto"
                    >
                        <Settings className="h-5 w-5" />
                        Manage Columns
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setShowExportOptions(true)}
                        className="gap-2 h-11 px-5 rounded-lg shadow-classic"
                    >
                        <Download className="h-5 w-5" />
                        Excel Export
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleBulkCreateSamples}
                        disabled={bulkCreateSampleMutation.isPending}
                        className="gap-2 h-11 px-5 rounded-lg shadow-classic"
                    >
                        <Plus className="h-5 w-5" />
                        {bulkCreateSampleMutation.isPending ? 'Creating...' : 'Add 100 Sample Products'}
                    </Button>
                </div>

                {hasActiveFilters && (
                    <Card className="bg-secondary border border-border shadow-classic-md rounded-lg animate-scale-in">
                        <CardContent className="p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-semibold text-foreground mr-1">Active Filters:</span>
                                {activeFilters.map((filter) => (
                                    <div
                                        key={filter.key}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-card border border-border hover:bg-muted transition-all group shadow-classic"
                                    >
                                        <span className="text-sm">
                                            <span className="font-semibold text-foreground">{filter.label}:</span>
                                            <span className="ml-2 text-muted-foreground">{filter.value}</span>
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (filter.key === 'createdFrom') {
                                                    handleRemoveDateRangeFilter('created');
                                                } else if (filter.key === 'updatedFrom') {
                                                    handleRemoveDateRangeFilter('updated');
                                                } else {
                                                    handleRemoveFilter(filter.key);
                                                }
                                            }}
                                            className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-destructive/20 hover:text-destructive transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            aria-label={`Remove ${filter.label} filter`}
                                            title={`Remove ${filter.label} filter`}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-9 px-4 text-sm rounded-md hover:bg-destructive/20 hover:text-destructive"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {showFilters && (
                <Card className="mb-6 bg-card border border-border shadow-classic-md rounded-lg animate-slide-in">
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">Filter Products</h3>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="gap-2 rounded-md"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Product Name</label>
                                    <Input
                                        placeholder="Search by name..."
                                        value={tempFilters.name}
                                        onChange={(e) =>
                                            setTempFilters({ ...tempFilters, name: e.target.value })
                                        }
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                        className="bg-input border border-border rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Category</label>
                                    <Select
                                        value={tempFilters.category || undefined}
                                        onValueChange={(value) =>
                                            setTempFilters({ ...tempFilters, category: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-input border border-border rounded-lg">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border border-border shadow-classic-lg rounded-lg">
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category} className="rounded-md">
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {tempFilters.category && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTempFilters({ ...tempFilters, category: '' })}
                                            className="h-7 px-3 text-xs rounded-md"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">SKU</label>
                                    <Input
                                        placeholder="Search by SKU..."
                                        value={tempFilters.sku}
                                        onChange={(e) =>
                                            setTempFilters({ ...tempFilters, sku: e.target.value })
                                        }
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                        className="bg-input border border-border rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Status</label>
                                    <Select
                                        value={tempFilters.status || undefined}
                                        onValueChange={(value) =>
                                            setTempFilters({ ...tempFilters, status: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-input border border-border rounded-lg">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border border-border shadow-classic-lg rounded-lg">
                                            {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                                <SelectItem key={status} value={status} className="rounded-md">
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {tempFilters.status && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTempFilters({ ...tempFilters, status: '' })}
                                            className="h-7 px-3 text-xs rounded-md"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Ordering</label>
                                    <Input
                                        placeholder="Filter by ordering..."
                                        value={tempFilters.ordering}
                                        onChange={(e) =>
                                            setTempFilters({ ...tempFilters, ordering: e.target.value })
                                        }
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                        className="bg-input border border-border rounded-lg"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-3">
                                <h4 className="text-base font-semibold">Date Range Filters</h4>
                                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Created From</label>
                                        <Input
                                            type="date"
                                            value={tempFilters.createdFrom}
                                            onChange={(e) =>
                                                setTempFilters({ ...tempFilters, createdFrom: e.target.value })
                                            }
                                            className="bg-input border border-border rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Created To</label>
                                        <Input
                                            type="date"
                                            value={tempFilters.createdTo}
                                            onChange={(e) =>
                                                setTempFilters({ ...tempFilters, createdTo: e.target.value })
                                            }
                                            className="bg-input border border-border rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Updated From</label>
                                        <Input
                                            type="date"
                                            value={tempFilters.updatedFrom}
                                            onChange={(e) =>
                                                setTempFilters({ ...tempFilters, updatedFrom: e.target.value })
                                            }
                                            className="bg-input border border-border rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Updated To</label>
                                        <Input
                                            type="date"
                                            value={tempFilters.updatedTo}
                                            onChange={(e) =>
                                                setTempFilters({ ...tempFilters, updatedTo: e.target.value })
                                            }
                                            className="bg-input border border-border rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleApplyFilters} className="gap-2 h-11 px-6 rounded-lg shadow-classic">
                                    <Search className="h-5 w-5" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {products.length === 0 ? (
                <Card className="bg-card border border-border shadow-classic-md rounded-lg animate-scale-in">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-secondary shadow-classic">
                            <Package className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold">
                            {hasActiveFilters ? 'No products found' : 'No products yet'}
                        </h3>
                        <p className="mt-3 text-base text-muted-foreground">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search'
                                : 'Get started by adding your first product'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="bg-card border border-border shadow-classic-md rounded-lg overflow-hidden animate-scale-in">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border bg-secondary">
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={allSelected || (someSelected ? 'indeterminate' : false)}
                                                    onCheckedChange={handleSelectAll}
                                                    aria-label="Select all"
                                                />
                                            </TableHead>
                                            {columnVisibility.id && (
                                                <TableHead className="w-16">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('id')}
                                                    >
                                                        ID
                                                        {renderSortIcon('id')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.name && (
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        Name
                                                        {renderSortIcon('name')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.sku && (
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('sku')}
                                                    >
                                                        SKU
                                                        {renderSortIcon('sku')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.category && (
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('category')}
                                                    >
                                                        Category
                                                        {renderSortIcon('category')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.price && (
                                                <TableHead className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('price')}
                                                    >
                                                        Price
                                                        {renderSortIcon('price')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.quantity && (
                                                <TableHead className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('quantity')}
                                                    >
                                                        Quantity
                                                        {renderSortIcon('quantity')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.status && (
                                                <TableHead className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('status')}
                                                    >
                                                        Status
                                                        {renderSortIcon('status')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.ordering && (
                                                <TableHead className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('ordering')}
                                                    >
                                                        Ordering
                                                        {renderSortIcon('ordering')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.discount && (
                                                <TableHead className="text-center">
                                                    <span className="font-semibold">Discount</span>
                                                </TableHead>
                                            )}
                                            {columnVisibility.created_at && (
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('created_at')}
                                                    >
                                                        Created
                                                        {renderSortIcon('created_at')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            {columnVisibility.updated_at && (
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 font-semibold rounded-md"
                                                        onClick={() => handleSort('updated_at')}
                                                    >
                                                        Updated
                                                        {renderSortIcon('updated_at')}
                                                    </Button>
                                                </TableHead>
                                            )}
                                            <TableHead className="w-32 text-right font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => {
                                            const isSelected = selectedIds.has(product.id);
                                            return (
                                                <TableRow 
                                                    key={Number(product.id)}
                                                    className={`border-b border-border transition-colors ${isSelected ? 'bg-secondary' : 'hover:bg-muted'}`}
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) =>
                                                                handleSelectRow(product.id, checked as boolean)
                                                            }
                                                            aria-label={`Select product ${product.name}`}
                                                        />
                                                    </TableCell>
                                                    {columnVisibility.id && (
                                                        <TableCell className="font-semibold">
                                                            {Number(product.id)}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.name && (
                                                        <TableCell>
                                                            <Link
                                                                to="/admin/product/$productId"
                                                                params={{ productId: product.id.toString() }}
                                                                className="font-semibold text-primary hover:text-accent transition-colors underline"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.sku && (
                                                        <TableCell>
                                                            <Badge variant="outline" className="rounded-md">
                                                                {product.sku}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.category && (
                                                        <TableCell>
                                                            {product.category || (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.price && (
                                                        <TableCell className="text-right font-semibold">
                                                            {editingCell?.id === product.id && editingCell.field === 'price' ? (
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleSaveEdit();
                                                                            if (e.key === 'Escape') handleCancelEdit();
                                                                        }}
                                                                        onBlur={handleSaveEdit}
                                                                        className="h-9 w-28 text-right bg-input border border-border rounded-md"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleStartEdit(product, 'price')}
                                                                    className="hover:text-accent transition-colors cursor-pointer"
                                                                >
                                                                    {formatPrice(product.price)}
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.quantity && (
                                                        <TableCell className="text-right">
                                                            {editingCell?.id === product.id && editingCell.field === 'quantity' ? (
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleSaveEdit();
                                                                            if (e.key === 'Escape') handleCancelEdit();
                                                                        }}
                                                                        onBlur={handleSaveEdit}
                                                                        className="h-9 w-24 text-right bg-input border border-border rounded-md"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleStartEdit(product, 'quantity')}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Badge
                                                                        variant={
                                                                            Number(product.quantity) > 0 ? 'default' : 'destructive'
                                                                        }
                                                                        className="rounded-md"
                                                                    >
                                                                        {Number(product.quantity)}
                                                                    </Badge>
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.status && (
                                                        <TableCell className="text-center">
                                                            {editingCell?.id === product.id && editingCell.field === 'status' ? (
                                                                <div className="flex items-center justify-center">
                                                                    <Select
                                                                        value={editValue}
                                                                        onValueChange={(value) => {
                                                                            handleStatusChange(product.id, value);
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-9 w-[200px] bg-input border border-border rounded-md">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-popover border border-border shadow-classic-lg rounded-lg">
                                                                            {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                                                                <SelectItem key={status} value={status} className="rounded-md">
                                                                                    {label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleStartEdit(product, 'status')}
                                                                    className="cursor-pointer inline-flex items-center justify-center"
                                                                >
                                                                    <div className={`px-4 py-2 rounded-md text-sm font-semibold border ${getStatusColor(Number(product.status))}`}>
                                                                        {getStatusLabel(Number(product.status))}
                                                                    </div>
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.ordering && (
                                                        <TableCell className="text-center">
                                                            {editingCell?.id === product.id && editingCell.field === 'ordering' ? (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleSaveEdit();
                                                                            if (e.key === 'Escape') handleCancelEdit();
                                                                        }}
                                                                        onBlur={handleSaveEdit}
                                                                        className="h-9 w-24 text-center bg-input border border-border rounded-md"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleStartEdit(product, 'ordering')}
                                                                    className="cursor-pointer hover:text-accent transition-colors font-semibold"
                                                                >
                                                                    {Number(product.ordering)}
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.discount && (
                                                        <TableCell className="text-center">
                                                            {product.discount ? (
                                                                <Badge variant="secondary" className="rounded-md font-semibold">
                                                                    {formatDiscountDisplay(product)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.created_at && (
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatTimestamp(product.created_at)}
                                                        </TableCell>
                                                    )}
                                                    {columnVisibility.updated_at && (
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatTimestamp(product.updated_at)}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate({ to: '/admin/product/$productId', params: { productId: product.id.toString() } })}
                                                                title="View Details"
                                                                className="rounded-md hover:bg-accent/20 transition-all"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setEditingProduct(product)}
                                                                title="Edit Product"
                                                                className="rounded-md hover:bg-primary/20 transition-all"
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeletingProduct(product)}
                                                                title="Delete Product"
                                                                className="rounded-md hover:bg-destructive/20 transition-all"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-5">
                                <p className="text-sm font-semibold text-muted-foreground">
                                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
                                </p>
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-semibold text-muted-foreground">Items per page:</label>
                                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                        <SelectTrigger className="h-10 w-[90px] bg-card border border-border rounded-lg shadow-classic">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border border-border shadow-classic-lg rounded-lg">
                                            {PAGE_SIZE_OPTIONS.map((size) => (
                                                <SelectItem key={size} value={size.toString()} className="rounded-md">
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => hasPreviousPage && setCurrentPage(currentPage - 1)}
                                            className={`rounded-md ${
                                                !hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-secondary'
                                            }`}
                                        />
                                    </PaginationItem>
                                    {renderPaginationItems()}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => hasNextPage && setCurrentPage(currentPage + 1)}
                                            className={`rounded-md ${
                                                !hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-secondary'
                                            }`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            <ProductDialog
                open={!!editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                product={editingProduct || undefined}
            />

            <DeleteProductDialog
                open={!!deletingProduct}
                onOpenChange={(open) => !open && setDeletingProduct(null)}
                product={deletingProduct || undefined}
            />

            <BatchDeleteDialog
                open={showBatchDelete}
                onOpenChange={(open) => {
                    setShowBatchDelete(open);
                    if (!open) setSelectedIds(new Set());
                }}
                productIds={Array.from(selectedIds)}
                productCount={selectedIds.size}
            />

            <ManageColumnsDialog
                open={showManageColumns}
                onOpenChange={setShowManageColumns}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
            />

            <ExportOptionsDialog
                open={showExportOptions}
                onOpenChange={setShowExportOptions}
                onExport={handleExport}
            />
        </>
    );
}
