export function getStatusColor(status: number): string {
    switch (status) {
        case 1: // In Stock
            return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100';
        case 2: // Out of Stock
            return 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100';
        case 3: // Pre-order Available
            return 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100';
        case 4: // Discontinued
            return 'bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-gray-100';
        case 5: // Backorder Available
            return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100';
        case 6: // Coming Soon
            return 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100';
        case 7: // Limited Stock Available
            return 'bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100';
        case 8: // Reserved for Customers
            return 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100';
        case 9: // Restock Expected
            return 'bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100';
        case 10: // Not for Sale
            return 'bg-pink-100 text-pink-900 dark:bg-pink-900 dark:text-pink-100';
        case 0: // None
        default:
            return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
    }
}
