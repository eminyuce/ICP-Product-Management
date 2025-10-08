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
The frontend must render and function correctly with the following features and professional, modern CSS styling:

- Main content container uses standard page width and is centered on the page with professional styling
- All major pages (product listing, product detail) use consistent layout for uniform appearance across the application
- Properly functioning paginated product listing page showing products in a sortable table format with professional, modern styling
- Product table displays all product fields except description (description is only shown on individual product detail pages)
- Dynamic column visibility based on user preferences with smooth transitions when columns are shown/hidden
- Selected product rows must have a light background color that visually distinguishes them from unselected rows, making it easy to identify which products are selected
- The background color for selected rows must be professional and fit the app's overall design aesthetic
- Unselected rows maintain their normal background color without any highlighting
- All modal dialogs (ProductDialog, DeleteProductDialog, BatchDeleteDialog, ManageColumnsDialog, ExportOptionsDialog) must be properly positioned and centered on the screen
- Modal dialogs must have appropriate backgrounds and overlays with good visual contrast
- Modal dialogs must have a backdrop that blocks interaction with the page behind it
- Modal dialogs must implement proper accessibility features: keyboard focus trapping within the modal, ESC key to close the modal, and visible focus styles on all interactive elements
- Modal dialogs must have subtle shadows and rounded corners for visual depth and professional appearance
- Modal content must be scrollable when it exceeds viewport height to ensure all form fields and action buttons remain accessible
- The ProductDialog component must be implemented with a standard modal layout for add/edit operations, providing a comfortable interface for data entry
- The ProductDialog modal form layout must organize fields in two horizontal rows: the first row containing "price", "quantity", and "category" fields side by side, and the second row containing "status", "sku", and "ordering" fields side by side
- The "Create Product" and "Update Product" buttons in the ProductDialog modal must have standard button sizing for consistent appearance
- Functional ManageColumnsDialog modal with checkboxes for each available column (ID, Name, Price, Quantity, Category, SKU, Status, Ordering, Created At, Updated At) allowing users to show/hide columns
- ManageColumnsDialog must have professional modal styling with proper spacing, clear labels, and organized checkbox layout
- Column visibility changes must be applied immediately when the ManageColumnsDialog is closed
- Functional ExportOptionsDialog modal with three radio button options: "Export all columns", "Export only the visible columns", and "Cancel"
- ExportOptionsDialog must have professional modal styling with clear option labels and standard button styling
- Export functionality must respect the selected option and trigger the appropriate backend export endpoint
- Product names in the table must be clickable links that correctly navigate to individual product detail pages with standard link styling
- Action column with Detail button that navigates to individual product detail pages with consistent button styling matching the overall design theme
- Functional product detail page displaying all product information with plain text description content, uploaded product image (if available), modern typography, generous spacing, and clean layout
- Working checkbox column for selecting individual products or all products with proper alignment and standard checkbox styling
- Functional sortable column headers for all columns (click to sort ascending/descending) with clear visual indicators for sort state using standard styling
- Operational global search feature with text input and search button for searching across all product fields with clean form styling
- Properly functioning toggleable filter panel with "Filter" button to show/hide filtering controls with smooth transitions and consistent styling
- Active filter tags displayed above or within the filter panel showing each active filter as a removable tag-like element
- Filter tags formatted as [Filter Type: Value] ✕ (e.g., [Category: Electronics] ✕, [Status: In Stock] ✕, [Name: laptop] ✕)
- Clicking the ✕ (remove) button on any filter tag clears only that specific filter and automatically re-filters the product table
- Filter tags are visually distinct with professional styling, proper spacing, and accessible design that matches the app's overall theme
- Filter tags display for all active filters including name, category, SKU, status, ordering, created date range, updated date range, and global search
- Working filter controls for searching products by name, category dropdown, SKU, status dropdown, ordering, created date range, and updated date range (hidden by default) with standard form field styling and clean layout
- Category filter dropdown populated with all unique categories from the backend, allowing users to select from existing categories only
- Category filter dropdown must only render SelectItem components with valid, non-empty string values, ensuring no empty string values are passed to prevent rendering errors
- Status filter dropdown displaying user-friendly status labels (e.g., "In Stock", "Out of Stock", etc.) while sending the correct numeric status value to the backend for filtering
- Status filter dropdown must only render SelectItem components with valid, non-empty string values, ensuring no empty string values are passed to prevent rendering errors
- Functional date range filtering controls with separate start and end date inputs for both created date and updated date that properly format and send ISO date strings to the backend with consistent date picker styling
- Working pagination controls for navigating between pages with standard button styling and clear disabled states
- Page size selector dropdown with options for 10, 20 (default), 50, 100, and 250 items per page that updates the grid display and maintains consistent styling
- Functional inline editing for price, quantity, status, and ordering columns with immediate backend updates and clean input field styling
- Status column inline editing must display user-friendly text labels (e.g., "In Stock", "Out of Stock") in the dropdown instead of raw numeric values, while sending the correct numeric status value to the backend when changed
- Properly functioning streamlined toolbar with consistent button styling and improved spacing between controls:
    - Select All button to select all visible products
    - Deselect All button to clear all selections
    - Delete Selected Records button for batch deletion of selected products
    - ProductStateSelection dropdown for status enum (0-10) displaying correct text values (None, In Stock, Out of Stock, Pre-order Available, Discontinued, Backorder Available, Coming Soon, Limited Stock Available, Reserved for Customers, Restock Expected, Not for Sale) with ProductStateChanged action to update status for selected items
    - Manage Columns button to open the ManageColumnsDialog for customizing table column visibility
    - Excel Export button to open the ExportOptionsDialog for selecting export options
    - Add 100 Sample Products button to bulk create sample data for testing and demonstration purposes
- Functional "Add 100 Sample Products" button that triggers bulk creation of sample products and provides user feedback upon completion
- Success notification or message display when bulk sample products are successfully created
- Functional add product form with all required fields including status dropdown showing user-friendly text labels, description field using a standard textarea for plain text input, and optional image upload field with file type validation (JPEG/PNG only) with standard modal dialog styling
- Working edit product form pre-populated with existing data including status dropdown showing user-friendly text labels, description field using a standard textarea for plain text input, and optional image upload field with file type validation (JPEG/PNG only) with standard modal dialog styling
- Image upload functionality with file selection, preview capability, and clear validation messages for unsupported file types
- Functional delete confirmation functionality for single and batch operations with standard modal styling
- Working form validation for required fields and image file types with clear, well-styled error messages
- Proper display of all product information including timestamps, status, and ordering with modern typography, generous spacing, and professional appearance
- Correct status display in grid/table showing descriptive text with colored background in the status cell only:
    - Status 1 (In Stock): "In Stock" text with light green background
    - Status 2 (Out of Stock): "Out of Stock" text with light red background
    - Other statuses: Descriptive text with visually distinct background colors for each status value
    - Status text is always visible and readable against the background color with excellent contrast
    - Only the status cell has the colored background, not the entire row
    - Numeric status values (0-10) are never displayed, only descriptive text
- Functional status dropdown in add and edit forms showing descriptive text options while storing numeric values in backend with standard dropdown styling
- All content displayed in English
- Consistent, professional visual design across all components with modern styling, improved spacing, clean typography, good color contrast, and responsive layout
- Clean CSS structure ensuring all elements display correctly with a cohesive, professional appearance
- Modal dialogs must have proper z-index layering and appropriate background colors that provide visual distinction
- Clickable product name links must have standard styling and maintain visual consistency with the design theme
- Plain text product descriptions on detail pages must have modern typography styling with excellent readability
- Product images on detail pages must be displayed with appropriate sizing, professional styling, and responsive behavior
- All buttons throughout the app must use consistent styling with proper padding and modern appearance
- All input fields, dropdowns, and form controls must have consistent, clean styling with standard borders, proper spacing, and appropriate background colors
- Image upload controls must have standard styling with clear visual feedback for file selection and validation states
- Spacing and alignment must be consistent, ensuring proper visual balance and professional appearance across all screen sizes

## Data Persistence
All product data including status, ordering fields, and uploaded images is stored in the backend and persists across sessions. Column visibility preferences are maintained during the user session.

## API Documentation
The REST endpoints follow standard HTTP conventions with JSON request/response format (and multipart form data for image uploads), enabling easy integration with external applications and services. The GET /products endpoint supports pagination, filtering, sorting, global search parameters, and date range filtering for efficient data retrieval. The date filtering functionality must correctly handle ISO date format inputs and perform accurate comparisons against stored timestamps. The PATCH endpoints enable efficient inline editing and batch updates for status and ordering fields, and the batch DELETE endpoint allows for efficient multi-product deletion. Image upload endpoints handle file validation and secure storage of product images. The POST /products/bulk-sample endpoint enables quick creation of sample data for testing and demonstration purposes. The GET /categories endpoint provides unique category data for dropdown filtering functionality. The GET /products/export endpoint supports customizable Excel export with column selection options for both all columns and visible columns only.
