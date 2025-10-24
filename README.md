# Product Management App with Online Shop

A web application for managing product inventory with full CRUD operations and REST API endpoints, featuring both an admin interface, a modern public home page, and a full-featured online shop with shopping cart and Stripe payment integration. The application includes authentication for admin users and separate product detail views for customers and administrators.

here it is, take a look at it

https://product-admin-page-rh2.caffeine.xyz/

https://product-admin-page-rh2.caffeine.xyz/admin

## Core Features

### Authentication System
- Login system for admin users with email and password authentication
- Test admin account: testaccount@gmail.com / password: 456789
- Admin authentication required to access admin pages (Admin Data Grid, Admin Product Detail page)
- Session management to maintain admin login state with proper backend principal mapping
- Logout functionality for admin users
- Public pages (home page, customer product detail, shop) accessible without authentication
- Admin-only pages redirect to login if user is not authenticated
- **Proper admin session mapping to backend principal with admin rights for all CRUD operations**
- **File reference registration and all admin operations work seamlessly after login without authorization errors**

### Public Home Page
- Modern, responsive public home page displaying products in a 4x4 grid layout (16 products per page)
- Pagination controls with Next, Previous, and page number navigation at bottom center
- Sticky header with logo/site title, search input for filtering by name/description/SKU, category filter dropdown or horizontal chips, and cart icon showing item count
- Sorting options: "Newest", "Price: Low → High", "Price: High → Low"
- Modern product cards with rounded-2xl corners, shadow-md/hover:shadow-xl effects, and fixed image height
- Each product card displays: product image (or placeholder if imagePath is null), name, formatted price with currency (showing discounted price prominently and original price struck through or visually de-emphasized when discount is present), quantity (only if >0, else "Out of Stock"), category badge, discount information (if present), and created_at/updated_at timestamps
- **Clickable product images and product names that navigate to the customer-friendly Product Detail page at `/product/$productId`**
- For discounted products: display both original price (struck through or visually de-emphasized) and discounted price (prominently formatted with correct currency symbol), with proper calculation for both percentage and currency-based discounts
- Visual discount indicator (badge or label) to highlight products with active discounts
- Hover effects reveal quick actions: "View Details" and "Add to Cart"
- Responsive grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile
- Clean, modern design with light theme and accent colors for buttons
- Product info with proper padding and text truncation for long names
- Tooltip showing full description on hover
- Skeleton loader displayed while fetching data
- All filtering, sorting, and search functionality works client-side
- Products displayed in grid are ordered by the "ordering" field in ascending order by default
- Accessible from main navigation without requiring admin access

### Customer Product Detail Page
- Clean, customer-friendly product detail page accessible from public product listings at `/product/$productId`
- Displays essential product information: name, description, price (with discount if applicable), stock status, category, and product image
- Shows discount information prominently if product has active discount
- "Add to Cart" functionality for available products
- Modern, responsive design optimized for customer experience
- **Does not display technical or audit information** (no created/updated dates, no audit fields, no admin-specific data)
- Accessible without authentication
- Clean URL structure for customer-facing product pages
- Breadcrumb navigation back to product listings

### Admin Product Detail Page
- Administrative product detail page with complete product information at `/admin/product/$productId`
- Displays all product fields including technical and audit information
- Shows "Created by" and "Last edited by" audit information with user details
- Displays creation and last updated timestamps
- Full administrative controls for editing product details
- Access restricted to authenticated admin users only
- Comprehensive view of all product data for management purposes

### Online Shop
- Full-featured online shop accessible from the homepage with modern, responsive design
- Shop page displays products in a grid layout with product cards showing images, names, prices (with discounts if available), stock status, and category badges
- "Add to Cart" and "View Details" quick actions on each product card
- Shopping cart system allowing users to add products, view their cart, update quantities, and remove items
- Cart icon in sticky header showing the number of items in the cart with dropdown or modal to review and edit cart contents
- Cart functionality persists during the user session
- Checkout page where users can review their order, enter payment details, and complete purchase
- Order confirmation page displayed after successful payment
- Cart is cleared after successful order completion
- All shop features are mobile-friendly, visually appealing, and accessible
- Stock validation prevents adding out-of-stock items to cart
- Price calculations include discount handling for cart totals

### Stripe Payment Integration
- Secure Stripe payment processing integration for checkout
- Payment form with secure card input fields
- Order total calculation including taxes and any applicable fees
- Payment confirmation and error handling
- Secure transmission of payment data to Stripe
- Order processing upon successful payment completion

### Product Management (Admin Only)
- Add new products with all required information including optional image upload and discount settings
- View all products in a paginated list/table format with filtering capabilities and customizable column visibility
- Edit existing product details including optional image upload and discount settings with proper form population
- Delete products from the system (single or batch deletion)
- Display all product fields including timestamps and discount information (excluding description in table view)
- Navigate through pages of products
- Filter products by name, category, SKU, status, ordering, created date range, and updated date range
- Sort products by any column
- Select multiple products for batch operations
- Inline editing of price, quantity, status, and ordering fields
- Batch update status for selected products
- Export product data to Excel format with column selection options
- Global search across all product fields
- **Navigate to individual admin product detail pages via clickable product names or Detail button in action column to `/admin/product/$productId`**
- Select page size from dropdown with options for 10, 20 (default), 50, 100, and 250 items per page
- Bulk creation of 100 sample products with randomized data for testing and demonstration purposes
- Manage column visibility with customizable table display options
- Products are always displayed ordered by the "ordering" field in ascending order by default, regardless of user interaction or other sorting actions
- When the page loads or data is refreshed, products are automatically sorted by their "ordering" value in ascending order
- **Access restricted to authenticated admin users only**
- **All admin operations work without authorization errors when properly logged in**

### Product Dialog Form Behavior
- When editing a product, the ProductDialog component must correctly populate ALL form fields with the current product's data, including the Product Name field and discount settings
- Form fields including product name, description, price, quantity, category, SKU, status, ordering, discount type, and discount value must display the existing values when the dialog opens for editing
- The Product Name field must be properly pre-filled with the existing product's name value when editing
- Discount fields must be properly populated with existing discount type and value when editing
- Form validation must not incorrectly trigger "Name is required" error when the Product Name field is already populated with the product's current name
- The useForm reset logic and defaultValues must be properly configured to ensure ALL form fields, especially the Product Name and discount fields, are always populated with current product data when editing
- Form validation logic must correctly recognize pre-filled values and only show validation errors for truly empty or invalid fields
- Form validation and submission behavior remains unchanged for both create and edit operations

### Discount Management
- Add discount type selection (percentage or currency) in product add/edit modal
- Add discount value input field in product add/edit modal
- Discount fields are optional and only displayed when discount is set
- Discount type dropdown with options: "Percentage" and "Currency"
- Discount value validation based on selected type (0-100 for percentage, positive number for currency)
- Display discounted price and original price in product listings when discount is present
- Show discount information on product detail pages
- Format discount display appropriately (e.g., "20% off" or "$5.00 off")

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
- Modal dialog with checkboxes for each available column (ID, Name, Price, Quantity, Category, SKU, Status, Ordering, Discount, Created At, Updated At)
- Column visibility preferences persist during the session
- All columns are visible by default
- Users can toggle individual columns on/off to customize their table view

### Excel Export Options
- Enhanced Excel export functionality with column selection modal
- Export modal dialog with three options: "Export all columns", "Export only the visible columns", and "Cancel"
- Export respects user's column visibility preferences when "Export only the visible columns" is selected
- Export includes all columns regardless of visibility when "Export all columns" is selected
- Radio buttons for export options are highly visible with increased size, bold high-contrast colors, clear focus and hover states, and enhanced accessibility for all users
- Radio buttons are easily distinguishable and provide clear visual feedback for selection states

### Bulk Sample Data Creation
- Generate 100 sample products with unique names, SKUs, and randomized values including discount settings
- Sample products include varied categories, prices, quantities, statuses, ordering values, and discount configurations
- Accessible via "Add 100 Sample Products" button in the admin interface
- Provides user feedback upon completion of bulk creation operation
- Sample products use realistic product names and data for demonstration purposes
- **Works without authorization errors when admin is properly authenticated**

### Shopping Cart Data Model
The frontend stores cart data with the following information:
- Cart items with product ID, quantity, and product details
- Cart total calculation including discounts
- Cart persistence during user session
- Cart item validation against current product stock

### Order Data Model
The backend stores orders with the following information:
- Unique order ID
- Order items with product details, quantities, and prices at time of purchase
- Customer information (name, email, shipping address)
- Order total amount
- Payment status and Stripe payment intent ID
- Order status (pending, paid, shipped, delivered, cancelled)
- Order creation timestamp
- Order completion timestamp

### User Data Model
The backend stores admin user information:
- User email (unique identifier)
- Encrypted password
- User session management with proper principal mapping
- Authentication tokens for secure access
- **Admin privileges properly mapped to backend principal for all operations**

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
- Discount type (optional, enum: "percentage" or "currency")
- Discount value (optional, numeric value based on discount type)
- Image file (optional, JPEG or PNG format)
- Creation timestamp
- Last updated timestamp
- Created by (user email or identifier who created the product)
- Updated by (user email or identifier who last updated the product)

### Image Upload
- Optional image upload functionality for product creation and editing
- Accepts only JPEG and PNG file formats
- Images are stored securely in the backend
- File type validation ensures only supported formats are accepted
- Images are displayed on product detail pages when available
- **File reference registration works properly for authenticated admin users**

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
- **Admin authentication with email/password validation, session management, and proper principal mapping for admin rights**
- **User login and logout functionality with secure session handling that maps admin sessions to backend principals with proper permissions**
- Create new products with validation, optional image upload, discount settings, and automatic setting of createdBy and updatedBy fields to the current authenticated user
- Retrieve all products with pagination, filtering, and sorting support including discount information and audit fields
- Retrieve individual products by ID including image data, discount information, and audit fields
- Retrieve unique categories from all products for dropdown filtering
- Update existing product information including optional image upload, discount settings, and automatic updating of updatedBy field to the current authenticated user
- Update specific product fields (price, quantity, status, and ordering) for inline editing with automatic updating of updatedBy field
- Batch update status and ordering for multiple products with automatic updating of updatedBy field for each product
- Delete products (single or multiple) including associated images
- Store and serve product images securely
- Validate image file types (JPEG/PNG only)
- Validate discount values based on discount type (0-100 for percentage, positive for currency)
- Ensure SKU uniqueness across all products
- Auto-generate timestamps for creation and updates
- Automatically set audit fields (createdBy, updatedBy) based on authenticated user context
- Support efficient pagination with page size and page number parameters
- Support filtering by product name, category, SKU, status, ordering fields, created date range, and updated date range with proper date parsing and comparison
- Support global search across all product fields (name, description, SKU, category, etc.)
- Support sorting by any product field in ascending or descending order
- Default sorting is always by the "ordering" field in ascending order when no explicit sort is specified
- Bulk create 100 sample products with unique names, SKUs, randomized data values, discount configurations, and audit fields set to current user
- Support Excel export with customizable column selection for both all columns and visible columns only including discount information and audit fields
- Create new orders with customer information, order items, and payment details
- Update order status and payment information
- Retrieve orders for order management and confirmation
- Process Stripe payment integration for secure payment handling
- Validate product stock availability for cart operations
- Update product quantities after successful order completion
- **Ensure all admin operations work seamlessly without authorization errors when admin is properly authenticated**
- **File reference registration and image upload operations work properly for authenticated admin users**

### REST API Endpoints
The backend provides HTTP endpoints for external applications to perform CRUD operations:

#### POST /auth/login
- Authenticates admin users with email and password
- Request format: JSON object with email and password
- Response format: Authentication token and user information
- Returns 401 for invalid credentials
- **Properly maps authenticated admin session to backend principal with admin rights**

#### POST /auth/logout
- Logs out the current admin user
- Request format: Empty POST request with authentication token
- Response format: Success confirmation
- Invalidates the current session token

#### GET /auth/me
- Returns current authenticated user information
- Request format: GET request with authentication token
- Response format: User object with email and authentication status
- Returns 401 if not authenticated

#### GET /products
- Returns paginated, filtered, and sorted products as JSON including discount information and audit fields
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
  - sortBy: Field to sort by (optional, defaults to "ordering")
  - sortOrder: Sort direction - "asc" or "desc" (optional, defaults to "asc")
- Response format: Object containing:
  - products: Array of product objects with all fields including image information, discount details, and audit fields
  - totalCount: Total number of products matching filters
  - currentPage: Current page number
  - totalPages: Total number of pages
  - hasNextPage: Boolean indicating if there are more pages
  - hasPreviousPage: Boolean indicating if there are previous pages
- Date filtering logic must properly parse ISO date strings and perform accurate date range comparisons against the created_at timestamp
- Products are always returned sorted by the "ordering" field in ascending order by default

#### GET /products/{id}
- Returns a single product by ID as JSON including image data, discount information, and audit fields
- Response format: Product object with all fields including image information, discount details, and audit fields
- Returns 404 if product not found
- **Available to both authenticated and unauthenticated users**

#### GET /products/{id}/image
- Returns the product image file
- Returns 404 if product or image not found
- Serves image with appropriate content type headers

#### GET /categories
- Returns all unique product categories as JSON array
- Response format: Array of category strings
- Used to populate category dropdown filter

#### GET /products/export
- Exports product data to Excel format with customizable column selection including discount information and audit fields
- **Requires admin authentication**
- Query parameters:
  - columns: Comma-separated list of column names to include in export (optional, defaults to all columns)
  - All existing filter parameters from GET /products are supported
- Response format: Excel file download with specified columns
- Supports both "all columns" and "visible columns only" export modes
- Exported data is ordered by the "ordering" field in ascending order by default

#### POST /products
- Creates a new product with optional image upload, discount settings, and automatic audit field population
- **Requires admin authentication**
- Request format: Multipart form data with product fields, optional image file, and discount information
- Response format: Created product object with all fields including generated ID, timestamps, discount details, and audit fields
- Validates required fields, SKU uniqueness, image file type (JPEG/PNG only), and discount values
- Automatically sets createdBy and updatedBy fields to the current authenticated user
- **Works without authorization errors when admin is properly authenticated**

#### POST /products/bulk-sample
- Creates 100 sample products with unique names, SKUs, randomized data, discount configurations, and audit fields
- **Requires admin authentication**
- Request format: Empty POST request (no body required)
- Response format: Success confirmation with count of created products
- Generates unique SKUs and product names to avoid conflicts
- Randomizes price, quantity, category, status, ordering values, and discount settings
- Sets createdBy and updatedBy fields to the current authenticated user for all sample products
- **Works without authorization errors when admin is properly authenticated**

#### PUT /products/{id}
- Updates an existing product with optional image upload, discount settings, and automatic audit field update
- **Requires admin authentication**
- Request format: Multipart form data with product fields, optional image file, and discount information
- Response format: Updated product object with all fields including discount details and audit fields
- Returns 404 if product not found
- Validates SKU uniqueness if SKU is being updated, image file type if image is provided, and discount values
- Automatically updates updatedBy field to the current authenticated user
- **Works without authorization errors when admin is properly authenticated**

#### PATCH /products/{id}
- Updates specific fields of an existing product (for inline editing) with automatic audit field update
- **Requires admin authentication**
- Request format: JSON object with only the fields to update (price, quantity, status, and/or ordering)
- Response format: Updated product object with all fields including audit fields
- Returns 404 if product not found
- Automatically updates updatedBy field to the current authenticated user

#### PATCH /products/batch
- Updates specific fields for multiple products (batch operations) with automatic audit field updates
- **Requires admin authentication**
- Request format: JSON object with array of product IDs and fields to update: {"ids": [1, 2, 3], "updates": {"status": 5, "ordering": 10}}
- Response format: Success confirmation with count of updated products
- Ignores non-existent IDs and continues with valid ones
- Automatically updates updatedBy field to the current authenticated user for all updated products

#### DELETE /products/{id}
- Deletes a product by ID including associated image
- **Requires admin authentication**
- Returns success confirmation
- Returns 404 if product not found

#### DELETE /products/batch
- Deletes multiple products by their IDs including associated images
- **Requires admin authentication**
- Request format: JSON object with array of product IDs: {"ids": [1, 2, 3]}
- Returns success confirmation with count of deleted products
- Ignores non-existent IDs and continues with valid ones

#### POST /orders
- Creates a new order with customer information and order items
- Request format: JSON object with customer details, order items, and payment information
- Response format: Created order object with order ID and payment details
- Validates product availability and stock quantities
- Integrates with Stripe for payment processing

#### GET /orders/{id}
- Returns a single order by ID as JSON
- Response format: Order object with all details including items and payment status
- Returns 404 if order not found

#### POST /orders/{id}/payment
- Processes payment for an order using Stripe
- Request format: JSON object with Stripe payment method and billing details
- Response format: Payment confirmation with order status update
- Updates order status upon successful payment
- Handles payment errors and failures

#### PATCH /orders/{id}
- Updates order status and information
- Request format: JSON object with fields to update
- Response format: Updated order object
- Returns 404 if order not found

All endpoints accept and return JSON data (or multipart form data for image uploads) with proper HTTP status codes and error messages. **Admin-only endpoints require valid authentication tokens and return 401 for unauthenticated requests. All admin operations work seamlessly without authorization errors when the admin is properly authenticated with correct principal mapping.**

### Frontend Interface
The frontend features a modern design system with the following characteristics:

#### Design System
- Modern color palette with clean whites, subtle grays, and vibrant accent colors
- Contemporary typography with clean, readable fonts
- Generous spacing and padding for a clean, organized appearance
- Modern shadows and subtle animations for visual depth
- Clear focus states and accessibility features
- Modern UI conventions with contemporary styling elements

#### UI Components
- **Admin login page with modern form design, email/password inputs, and secure authentication that properly maps admin sessions**
- **Navigation system that differentiates between public and admin areas**
- **Customer product detail page with clean, user-friendly design focused on essential product information**
- **Admin product detail page with comprehensive product information including audit fields**
- Modern sticky header with logo/site title, search input, category filter, and cart icon showing item count
- Professional footer with modern styling
- Traditional product table with clear borders, gentle shadows, and enhanced readability for admin interface
- All modal dialogs are fully opaque (no transparency) with modern styling, clear borders, and visible focus states
- Modern filter panels with contemporary styling and intuitive controls
- Modern buttons with vibrant accent colors, proper hover states, and consistent styling
- Contemporary form controls with clear borders, modern shadows, and clear validation feedback
- Modern active filter tags with contemporary styling and clear visual indicators
- Professional column management interface with modern modal design
- Contemporary Excel export options with clean, accessible modal styling and highly visible radio buttons
- Product table is always sorted by the "ordering" field in ascending order by default when the page loads or data is refreshed
- Modern public home page with 4x4 product grid using contemporary card design with rounded-2xl corners and shadow-md/hover:shadow-xl effects
- **Clickable product images and product names on public listing that navigate to customer product detail page at `/product/$productId`**
- Modern category dropdown filter or horizontal chips and search input with contemporary styling
- Grid pagination controls with modern button styling and clear navigation indicators
- Discount form fields with modern styling and clear validation feedback
- Discount display components with appropriate formatting and visual hierarchy
- Visual discount indicators (badges or labels) with modern styling to highlight discounted products
- Shopping cart interface with modern styling and intuitive controls
- Checkout page with clean, professional design and secure payment form
- Order confirmation page with modern styling and clear order details
- **Admin product detail page displays audit information (Created by, Last edited by) in a read-only format with modern styling**
- **Customer product detail page excludes all technical and audit information for clean user experience**
- **Proper error handling and user feedback for authentication and authorization issues**

#### Enhanced Checkbox Styling
- Product table checkboxes are significantly more visible and prominent with larger size
- Checkboxes feature bold borders and high-contrast color scheme that stands out against the table background
- Checkbox styling ensures easy visibility and interaction for all users
- Selected states are clearly indicated with distinct visual feedback
- Checkbox design maintains accessibility standards while being highly visible

#### Enhanced Radio Button Styling
- Export options dialog radio buttons are significantly more visible with increased size
- Radio buttons feature bold, high-contrast colors that stand out clearly
- Clear focus states with visible outlines when navigating with keyboard
- Distinct hover states that provide immediate visual feedback
- Enhanced accessibility with proper contrast ratios and clear visual indicators
- Radio button styling ensures easy visibility and interaction for all users
- Selected states are clearly indicated with bold visual feedback

#### Visual Features
- Modern public home page with responsive 4x4 grid layout (4 columns desktop, 2 tablet, 1 mobile)
- **Product cards with clickable images and product names that navigate to customer product detail page at `/product/$productId`**
- Product cards with fixed image height, rounded-2xl corners, and shadow-md/hover:shadow-xl effects
- Sticky header with modern styling and proper positioning
- Clean, light theme with vibrant accent colors for interactive elements
- Product cards display formatted price with locale currency (showing discounted price prominently and original price struck through or visually de-emphasized when discount is present), quantity status, category badges, discount information with visual indicators, and timestamps
- Proper discount calculation and formatting for both percentage and currency-based discounts on product cards
- Visual discount badges or labels to highlight products with active discounts
- Placeholder image handling for products without images
- Tooltip functionality for full description display on hover
- Skeleton loader for data fetching states
- Modern card-based layouts with contemporary shadows and borders
- Enhanced visual feedback for user interactions with modern styling
- Clean, professional appearance suitable for business applications with modern aesthetics
- Responsive design that maintains modern visual appeal across different screen sizes
- Layout remains at 85% width, centered on the page
- All backgrounds are fully opaque with no transparency or blur effects
- Export options dialog maintains modern styling with solid, opaque background and contemporary design
- Product grid cards use modern styling with rounded corners, contemporary shadows, and responsive layout
- Discount information displayed with clear visual hierarchy and appropriate formatting
- Shopping cart dropdown/modal with modern styling and clear item display
- Checkout interface with professional styling and secure payment form design
- Order confirmation page with clean, modern layout and clear order summary
- **Customer product detail page with clean, modern design focused on essential product information without technical details**
- **Admin product detail page displays audit information with clear labels and modern formatting**
- **Login page with professional styling and secure form design**

#### Functionality Preservation
- All existing admin features and functionality are maintained exactly as specified
- **Admin features now require authentication and are protected from unauthorized access with proper session mapping**
- Complete filtering functionality including active filter tags for admin interface
- Excel export functionality with column selection options including discount column and audit fields
- Sample product creation feature with discount configurations and audit field population
- Column management functionality including discount column and audit fields
- Table features including sorting, pagination, and inline editing
- **Separate product detail pages: customer-friendly and admin-comprehensive views**
- Image upload and display functionality
- All form controls and validation including discount fields
- Content displayed in English
- All UI elements and their interactions function exactly as before
- Products are always displayed in ascending order by the "ordering" field by default
- Modern public home page with client-side filtering, sorting, and search functionality
- Sorting options: "Newest", "Price: Low → High", "Price: High → Low"
- Quick actions on product card hover: "View Details" and "Add to Cart"
- **Clickable product images and product names that navigate to customer product detail page at `/product/$productId`**
- **Admin data grid with clickable product names and Detail buttons that navigate to admin product detail page at `/admin/product/$productId`**
- Shopping cart functionality with add, remove, and update operations
- Checkout process with Stripe payment integration
- Order confirmation and cart clearing after successful payment
- **All admin operations work without authorization errors when properly authenticated**

## Data Persistence
All product data including status, ordering fields, discount information, audit fields, and uploaded images is stored in the backend and persists across sessions. Column visibility preferences are maintained during the user session. Order data including customer information, order items, payment status, and order history is stored in the backend and persists across sessions. Shopping cart data is maintained in the frontend during the user session. **Admin user authentication data and session information is stored securely in the backend with proper principal mapping for admin operations.**

## API Documentation
The REST endpoints follow standard HTTP conventions with JSON request/response format (and multipart form data for image uploads), enabling easy integration with external applications and services. **Authentication endpoints provide secure login/logout functionality for admin users with proper backend principal mapping.** The GET /products endpoint supports pagination, filtering, sorting, global search parameters, and date range filtering for efficient data retrieval, with default sorting by the "ordering" field in ascending order. The date filtering functionality must correctly handle ISO date format inputs and perform accurate comparisons against stored timestamps. The PATCH endpoints enable efficient inline editing and batch updates for status and ordering fields, and the batch DELETE endpoint allows for efficient multi-product deletion. Image upload endpoints handle file validation and secure storage of product images. The POST /products/bulk-sample endpoint enables quick creation of sample data for testing and demonstration purposes including discount configurations and audit field population. The GET /categories endpoint provides unique category data for dropdown filtering functionality. The GET /products/export endpoint supports customizable Excel export with column selection options for both all columns and visible columns only including discount information and audit fields, with data ordered by the "ordering" field by default. All endpoints now include discount information and audit fields in their responses and accept discount data in their requests where applicable. Order management endpoints handle order creation, payment processing, and order status updates with Stripe integration for secure payment handling. All product creation and modification operations automatically populate audit fields based on the authenticated user context. **Admin-only endpoints require valid authentication and return appropriate error codes for unauthorized access. All admin operations work seamlessly without authorization errors when the admin session is properly mapped to backend principals with admin rights.**
