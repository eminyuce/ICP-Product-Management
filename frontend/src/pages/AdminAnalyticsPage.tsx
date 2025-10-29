import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, TrendingDown, DollarSign, XCircle, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useGetAnalyticsData } from '@/hooks/useQueries';

const STATUS_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#ef4444', // red
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
];

export default function AdminAnalyticsPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { data: analyticsData, isLoading: dataLoading } = useGetAnalyticsData();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate({ to: '/login' });
        }
    }, [isAuthenticated, authLoading, navigate]);

    if (authLoading || !isAuthenticated) {
        return null;
    }

    const isLoading = dataLoading || !analyticsData;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-8">
                <div className="mx-auto w-[85%]">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                        </div>
                        <p className="text-muted-foreground">Comprehensive insights into your product inventory and performance</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        {isLoading ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <Card key={i} className="shadow-classic">
                                        <CardHeader className="pb-3">
                                            <Skeleton className="h-4 w-24 mb-2" />
                                            <Skeleton className="h-8 w-16" />
                                        </CardHeader>
                                    </Card>
                                ))}
                            </>
                        ) : (
                            <>
                                <Card className="shadow-classic border-border">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardDescription className="text-xs font-medium">Total Products</CardDescription>
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold text-primary">
                                            {Number(analyticsData.summary.totalProducts).toLocaleString()}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card className="shadow-classic border-border">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardDescription className="text-xs font-medium">Low Stock</CardDescription>
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold text-amber-600">
                                            {Number(analyticsData.summary.lowStockCount).toLocaleString()}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card className="shadow-classic border-border">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardDescription className="text-xs font-medium">Avg Discount</CardDescription>
                                            <TrendingDown className="h-4 w-4 text-green-500" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold text-green-600">
                                            {analyticsData.summary.averageDiscountPercentage.toFixed(1)}%
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card className="shadow-classic border-border">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardDescription className="text-xs font-medium">Total Revenue Potential</CardDescription>
                                            <DollarSign className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold text-blue-600">
                                            ${analyticsData.summary.totalRevenuePotential.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card className="shadow-classic border-border">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardDescription className="text-xs font-medium">Out of Stock</CardDescription>
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold text-red-600">
                                            {Number(analyticsData.summary.outOfStockCount).toLocaleString()}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Bar Chart - Product Count per Category */}
                        <Card className="shadow-classic border-border">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Product Count by Category</CardTitle>
                                <CardDescription>Distribution of products across categories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-[300px] w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analyticsData.categoryAnalytics.map(cat => ({
                                            category: cat.category,
                                            count: Number(cat.productCount),
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'white', 
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="count" fill="#3b82f6" name="Product Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pie Chart - Product Status Distribution */}
                        <Card className="shadow-classic border-border">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Product Status Distribution</CardTitle>
                                <CardDescription>Breakdown of products by status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-[300px] w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.statusAnalytics.map(stat => ({
                                                    name: stat.statusText,
                                                    value: Number(stat.productCount),
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {analyticsData.statusAnalytics.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: 'white', 
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Analytics Table */}
                    <Card className="shadow-classic border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
                            <CardDescription>Average price and revenue potential by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-md border border-border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="font-semibold">Category</TableHead>
                                                <TableHead className="font-semibold text-right">Product Count</TableHead>
                                                <TableHead className="font-semibold text-right">Average Price</TableHead>
                                                <TableHead className="font-semibold text-right">Total Revenue Potential</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {analyticsData.categoryAnalytics.map((cat, index) => (
                                                <TableRow key={index} className="hover:bg-muted/30">
                                                    <TableCell className="font-medium">{cat.category}</TableCell>
                                                    <TableCell className="text-right">{Number(cat.productCount).toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${cat.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-blue-600">
                                                        ${cat.totalRevenuePotential.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
