# Product Management App

A web application for managing product inventory with full CRUD operations and REST API endpoints.

## Core Features

### Product Management
- Add new products with all required information including optional image upload
- View all products in a paginated list/table format with filtering capabilities and customizable column visibility
- Edit existing product details including optional image upload
- Delete products from the system (single or batch deletion)
- Display all product fields including timestamps (excluding description in table view)
- Navigate through pages of products
- Filter products by name, category, SKU, status, ordering, created date range, and updated date range
- Sort products by any column
- Select multiple products for batch operations
- Inline editing of price, quantity, status, and ordering fields
- Batch update status for selected products
- Export product data to Excel format with column selection options
- Global search across all product fields
- Navigate to individual product detail pages via clickable product names or Detail button in action column
- Select page size from dropdown with options for 10, 20 (default), 50, 100, and 250 items per page
- Bulk creation of 100 sample products with randomized data for testing and demonstration purposes
- Manage column visibility with customizable table display options

### Active Filter Tags
- Display active filters as removable tag-like elements above or within the filter panel
- Each active filter shows as a tag with format [Filter Type: Value] ✕ (e.g., [Category: Electronics] ✕, [Status: In Stock] ✕)
- Clicking the ✕ (remove) button on any filter tag clears only that specific filter
- Automatically re-filter the product table when a filter tag is removed
- Filter tags are visually distinct, accessible, and styled to match the app's design
- Tags display for all active filters including name, category, SKU, status, ordering, created date range, updated date range, and global search
- Filter tags are prominently displayed and easily accessible for quick filter removal
- Each tag has a clear visual indicator (✕ button) for removing the specific filter
- Tag styling integrates seamlessly with the overall application design language

### Column Management
- Manage Columns feature allowing users to show/hide table columns
- Modal dialog with checkboxes for each available column (ID, Name, Price, Quantity, Category, SKU, Status, Ordering, Created At, Updated At)
- Column visibility preferences persist during the session
- All columns are visible by default
- Users can toggle individual columns on/off to customize their table view

### Excel Export Options
- Enhanced Excel export functionality with column selection modal
- Export modal dialog with three options: "Export all columns", "Export only the visible columns", and "Cancel"
- Export respects user's column visibility preferences when "Export only the visible columns" is selected
- Export includes all columns regardless of visibility when "Export all columns" is selected

### Bulk Sample Data Creation
- Generate 100 sample products with unique names, SKUs, and randomized values
- Sample products include varied categories, prices, quantities, statuses, and ordering values
- Accessible via "Add 100 Sample Products" button in the admin interface
- Provides user feedback upon completion of bulk creation operation
- Sample products use realistic product names and data for demonstration purposes

### Product Detail View
- Dedicated product detail page displaying all product information
- Product description displayed as plain text with proper formatting
- Display uploaded product image if available
- Accessible via clickable product name links from the main product table or Detail button in action column

### Product Data Model
The backend stores products with the following information:
- Unique auto-incremented ID
- Product name (required)
- Description (plain text content)
- Quantity in stock (required, defaults to 0)
- Category
- SKU (unique identifier)
- Status (enum: 0-10, defaults to 0)
- Ordering (numeric field for sorting order, defaults to 0)
- Image file (optional, JPEG or PNG format)
- Creation timestamp
- Last updated timestamp

### Image Upload
- Optional image upload functionality for product creation and editing
- Accepts only JPEG and PNG file formats
- Images are stored securely in the backend
- File type validation ensures only supported formats are accepted
- Images are displayed on product detail pages when available

### Status Mapping
The status field uses the following mapping:
- 0 - None
- 1 - In Stock
- 2 - Out of Stock
- 3 - Pre-order Available
- 4 - Discontinued
- 5 - Backorder Available
- 6 - Coming Soon
- 7 - Limited Stock Available
- 8 - Reserved for Customers
- 9 - Restock Expected
- 10 - Not for Sale

### Backend Operations
- Create new products with validation and optional image upload
- Retrieve all products with pagination, filtering, and sorting support
- Retrieve individual products by ID including image data
- Retrieve unique categories from all products for dropdown filtering
- Update existing product information including optional image upload
- Update specific product fields (price, quantity, status, and ordering) for inline editing
- Batch update status and ordering for multiple products
- Delete products (single or multiple) including associated images
- Store and serve product images securely
- Validate image file types (JPEG/PNG only)
- Ensure SKU uniqueness across all products
- Auto-generate timestamps for creation and updates
- Support efficient pagination with page size and page number parameters
- Support filtering by product name, category, SKU, status, ordering fields, created date range, and updated date range with proper date parsing and comparison
- Support global search across all product fields (name, description, SKU, category, etc.)
- Support sorting by any product field in ascending or descending order
- Bulk create 100 sample products with unique names, SKUs, and randomized data values
- Support Excel export with customizable column selection for both all columns and visible columns only

### REST API Endpoints
The backend provides HTTP endpoints for external applications to perform CRUD operations:

#### GET /products
- Returns paginated, filtered, and sorted products as JSON
- Query parameters:
  - page: Page number (optional, defaults to 1)
  - limit: Number of products per page (optional, defaults to 20)
  - name: Filter by product name (optional, partial match)
  - category: Filter by category (optional, partial match)
  - sku: Filter by SKU (optional, partial match)
  - status: Filter by status (optional, exact match)
  - ordering: Filter by ordering (optional, exact match)
  - createdFrom: Filter by created date from (optional, ISO date format, inclusive)
  - createdTo: Filter by created date to (optional, ISO date format, inclusive)
  - updatedFrom: Filter by updated date from (optional, ISO date format)
  - updatedTo: Filter by updated date to (optional, ISO date format)
  - search: Global search across all product fields (optional, partial match)
  - sortBy: Field to sort by (optional, defaults to id)
  - sortOrder: Sort direction - "asc" or "desc" (optional, defaults to "asc")
- Response format: Object containing:
  - products: Array of product objects with all fields including image information
  - totalCount: Total number of products matching filters
  - currentPage: Current page number
  - totalPages: Total number of pages
  - hasNextPage: Boolean indicating if there are more pages
  - hasPreviousPage: Boolean indicating if there are previous pages
- Date filtering logic must properly parse ISO date strings and perform accurate date range comparisons against the created_at timestamp

#### GET /products/{id}
- Returns a single product by ID as JSON including image data
- Response format: Product object with all fields including image information
- Returns 404 if product not found

#### GET /products/{id}/image
- Returns the product image file
- Returns 404 if product or image not found
- Serves image with appropriate content type headers

#### GET /categories
- Returns all unique product categories as JSON array
- Response format: Array of category strings
- Used to populate category dropdown filter

#### GET /products/export
- Exports product data to Excel format with customizable column selection
- Query parameters:
  - columns: Comma-separated list of column names to include in export (optional, defaults to all columns)
  - All existing filter parameters from GET /products are supported
- Response format: Excel file download with specified columns
- Supports both "all columns" and "visible columns only" export modes

#### POST /products
- Creates a new product with optional image upload
- Request format: Multipart form data with product fields and optional image file
- Response format: Created product object with all fields including generated ID and timestamps
- Validates required fields, SKU uniqueness, and image file type (JPEG/PNG only)

#### POST /products/bulk-sample
- Creates 100 sample products with unique names, SKUs, and randomized data
- Request format: Empty POST request (no body required)
- Response format: Success confirmation with count of created products
- Generates unique SKUs and product names to avoid conflicts
- Randomizes price, quantity, category, status, and ordering values

#### PUT /products/{id}
- Updates an existing product with optional image upload
- Request format: Multipart form data with product fields and optional image file
- Response format: Updated product object with all fields
- Returns 404 if product not found
- Validates SKU uniqueness if SKU is being updated and image file type if image is provided

#### PATCH /products/{id}
- Updates specific fields of an existing product (for inline editing)
- Request format: JSON object with only the fields to update (price, quantity, status, and/or ordering)
- Response format: Updated product object with all fields
- Returns 404 if product not found

#### PATCH /products/batch
- Updates specific fields for multiple products (batch operations)
- Request format: JSON object with array of product IDs and fields to update: {"ids": [1, 2, 3], "updates": {"status": 5, "ordering": 10}}
- Response format: Success confirmation with count of updated products
- Ignores non-existent IDs and continues with valid ones

#### DELETE /products/{id}
- Deletes a product by ID including associated image
- Returns success confirmation
- Returns 404 if product not found

#### DELETE /products/batch
- Deletes multiple products by their IDs including associated images
- Request format: JSON object with array of product IDs: {"ids": [1, 2, 3]}
- Returns success confirmation with count of deleted products
- Ignores non-existent IDs and continues with valid ones

All endpoints accept and return JSON data (or multipart form data for image uploads) with proper HTTP status codes and error messages.

### Frontend Interface
The frontend features a modern, visually striking design with the following characteristics:

#### Design System
- Bold, contemporary color palette with vibrant primary colors and sophisticated accent colors
- Clean sans-serif typography throughout the application for excellent readability
- Generous spacing and padding for a fresh, uncluttered appearance
- Consistent use of rounded corners on all UI elements
- Subtle shadows and depth effects for visual hierarchy
- High-contrast color combinations for accessibility

#### UI Components
- Modern header with bold branding and navigation elements
- Contemporary footer with clean styling
- Redesigned product table with modern styling, enhanced readability, and visual appeal
- All modal dialogs are fully solid (no transparency) with high-contrast headers and clear, accessible focus styles
- Modern filter panels with contemporary styling and intuitive controls
- Redesigned buttons with bold colors, proper hover states, and consistent styling
- Modern form controls with clean styling and clear validation feedback
- Enhanced active filter tags with modern styling and clear visual indicators
- Professional column management interface with contemporary modal design
- Modern Excel export options with clean, accessible modal styling

#### Visual Features
- All major UI components (header, footer, product table, dialogs, filter panels, buttons, and forms) follow the new modern design system
- Consistent application of the bold color palette across all interface elements
- Modern card-based layouts where appropriate
- Enhanced visual feedback for user interactions
- Clean, professional appearance suitable for business applications
- Responsive design that maintains visual appeal across different screen sizes

#### Functionality Preservation
- All existing features and functionality are maintained exactly as specified
- Complete filtering functionality including active filter tags
- Excel export functionality with column selection options
- Sample product creation feature
- Column management functionality
- Table features including sorting, pagination, and inline editing
- Product detail pages with proper information display
- Image upload and display functionality
- All form controls and validation
- Content displayed in English
- All UI elements and their interactions function exactly as before

## Data Persistence
All product data including status, ordering fields, and uploaded images is stored in the backend and persists across sessions. Column visibility preferences are maintained during the user session.

## API Documentation
The REST endpoints follow standard HTTP conventions with JSON request/response format (and multipart form data for image uploads), enabling easy integration with external applications and services. The GET /products endpoint supports pagination, filtering, sorting, global search parameters, and date range filtering for efficient data retrieval. The date filtering functionality must correctly handle ISO date format inputs and perform accurate comparisons against stored timestamps. The PATCH endpoints enable efficient inline editing and batch updates for status and ordering fields, and the batch DELETE endpoint allows for efficient multi-product deletion. Image upload endpoints handle file validation and secure storage of product images. The POST /products/bulk-sample endpoint enables quick creation of sample data for testing and demonstration purposes. The GET /categories endpoint provides unique category data for dropdown filtering functionality. The GET /products/export endpoint supports customizable Excel export with column selection options for both all columns and visible columns only.
