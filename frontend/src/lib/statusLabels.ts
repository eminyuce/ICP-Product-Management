export const STATUS_LABELS: Record<number, string> = {
    0: 'None',
    1: 'In Stock',
    2: 'Out of Stock',
    3: 'Pre-order Available',
    4: 'Discontinued',
    5: 'Backorder Available',
    6: 'Coming Soon',
    7: 'Limited Stock Available',
    8: 'Reserved for Customers',
    9: 'Restock Expected',
    10: 'Not for Sale',
};

export function getStatusLabel(status: number): string {
    return STATUS_LABELS[status] || 'Unknown';
}
