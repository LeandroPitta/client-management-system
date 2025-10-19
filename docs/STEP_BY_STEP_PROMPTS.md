# Step-by-Step Building Prompts

This document contains detailed prompts for building the Client Management System step by step. Each prompt is designed to be used individually to guide your development process.

## 🏗️ Backend Development Prompts

### Prompt 1: Project Setup and Basic Server

```
Create a Node.js backend project for a client management system with these specifications:

TASK: Set up the basic project structure and create a simple Express server

REQUIREMENTS:
1. Create a 'backend' folder
2. Initialize npm project with package.json
3. Install dependencies: express, cors, sqlite3, dotenv
4. Install dev dependency: nodemon
5. Create basic folder structure:
   - src/
   - src/models/
   - src/controllers/
   - src/routes/
   - database/
6. Create server.js as the main entry point
7. Set up Express server with basic middleware
8. Configure CORS to allow frontend connections
9. Add npm scripts for development

DELIVERABLES:
- Working Express server on port 3001
- Basic project structure
- Development script that auto-restarts server
- Test endpoint that returns "Backend is running"

ACCEPTANCE CRITERIA:
- Server starts without errors
- Can access http://localhost:3001 and get response
- Nodemon restarts server when files change
- Console shows "Server running on port 3001"

CODE STRUCTURE EXAMPLE:
server.js should include:
- Express setup
- CORS configuration  
- Basic error handling
- Port configuration
- Test route

Use environment variables for configuration and include .env file setup.
```

### Prompt 2: Database Setup and Schema

```
Create SQLite database setup for the client management system with proper schema design.

TASK: Design and implement the database layer with SQLite

REQUIREMENTS:
1. Create database connection module (src/database/connection.js)
2. Design clients table with these exact fields:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - name: VARCHAR(100) NOT NULL
   - email: VARCHAR(100) NOT NULL UNIQUE
   - phone: VARCHAR(20)
   - created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
   - updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP

3. Create database initialization script (src/database/init.js)
4. Create seed data script (src/database/seed.js) with 5 sample clients
5. Add database file to .gitignore
6. Create npm scripts for database operations

DELIVERABLES:
- Database connection module with proper error handling
- Table creation script
- Seed data with realistic sample clients
- Database initialization that runs automatically
- Proper database file location (database/clients.db)

ACCEPTANCE CRITERIA:
- Database file is created when server starts
- Sample data is inserted successfully
- Connection module handles errors gracefully
- Can query database and retrieve sample data
- Database operations use prepared statements

SAMPLE DATA REQUIREMENTS:
Include diverse sample clients with:
- Different name formats
- Various email domains
- Different phone number formats
- Mix of complete and partial data

Error handling should cover:
- Database file creation issues
- Connection failures
- Query execution errors
- Constraint violations
```

### Prompt 3: Client Model Implementation

```
Create a comprehensive Client model with all CRUD operations using SQLite.

TASK: Implement the data access layer for client management

REQUIREMENTS:
1. Create Client model class (src/models/Client.js)
2. Implement these methods with exact specifications:

   findAll(options = {})
   - Support pagination: page, limit (default: page=1, limit=10)
   - Support search: search term for name or email
   - Support sorting: sortBy field, order (ASC/DESC)
   - Return: { clients: [], total: number, page: number, limit: number }

   findById(id)
   - Return single client object or null
   - Handle invalid ID gracefully

   create(clientData)
   - Validate required fields (name, email)
   - Check email uniqueness
   - Auto-generate created_at and updated_at
   - Return created client with new ID

   update(id, clientData) 
   - Check if client exists
   - Validate email uniqueness (exclude current client)
   - Update updated_at timestamp
   - Return updated client object

   delete(id)
   - Check if client exists before deletion
   - Return boolean success status

3. Use prepared statements for all queries
4. Implement proper error handling
5. Add input validation and sanitization
6. Include comprehensive JSDoc comments

DELIVERABLES:
- Complete Client model with all CRUD methods
- Proper error handling for each operation
- Input validation and data sanitization
- Prepared statements for SQL security
- Documentation with usage examples

ACCEPTANCE CRITERIA:
- All methods work correctly with test data
- Pagination returns correct subset of results
- Search works for partial matches in name and email
- Email uniqueness is enforced
- Error messages are user-friendly
- No SQL injection vulnerabilities

VALIDATION RULES:
- name: required, 1-100 characters, no special characters except spaces, hyphens, apostrophes
- email: required, valid email format, unique in database
- phone: optional, valid phone format (XXX) XXX-XXXX or XXX-XXX-XXXX

ERROR HANDLING:
- Database connection errors
- Constraint violations (unique email)
- Invalid input data
- Record not found scenarios
```

### Prompt 4: API Controllers Implementation

```
Create Express.js controllers to handle HTTP requests for client management API.

TASK: Implement request handlers that connect HTTP endpoints to the Client model

REQUIREMENTS:
1. Create clientController.js (src/controllers/clientController.js)
2. Implement these controller functions:

   getAllClients(req, res, next)
   - Extract query parameters: page, limit, search, sortBy, order
   - Validate pagination parameters
   - Call Client.findAll() with options
   - Return standardized JSON response
   - Handle errors appropriately

   getClientById(req, res, next)  
   - Extract and validate ID parameter
   - Call Client.findById()
   - Return 404 if client not found
   - Return client data if found

   createClient(req, res, next)
   - Extract client data from request body
   - Validate required fields
   - Call Client.create()
   - Return 201 status with created client
   - Handle validation errors (400) and conflicts (409)

   updateClient(req, res, next)
   - Extract ID and client data
   - Validate inputs
   - Call Client.update()
   - Return updated client data
   - Handle not found (404) and validation errors (400)

   deleteClient(req, res, next)
   - Extract and validate ID
   - Call Client.delete()
   - Return 204 status on success
   - Handle not found errors (404)

3. Use consistent response format for all endpoints
4. Implement proper HTTP status codes
5. Add comprehensive error handling
6. Include request logging

DELIVERABLES:
- Complete controller module with all CRUD handlers
- Consistent JSON response format
- Proper HTTP status codes
- Error handling middleware integration
- Request validation and sanitization

ACCEPTANCE CRITERIA:
- All endpoints return proper HTTP status codes
- Response format is consistent across endpoints
- Validation errors return detailed error messages
- Database errors are handled gracefully
- Request logging shows useful information

RESPONSE FORMAT:
Success responses:
{
  "success": true,
  "data": object|array,
  "message": "optional success message",
  "meta": { pagination info when applicable }
}

Error responses:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User friendly message",
    "details": [] // validation details if applicable
  }
}

HTTP STATUS CODES:
- 200: Successful GET, PUT
- 201: Successful POST (created)
- 204: Successful DELETE
- 400: Bad request/validation error
- 404: Resource not found
- 409: Conflict (duplicate email)
- 500: Internal server error
```

### Prompt 5: API Routes and Testing Documentation

```
Create Express.js routes and comprehensive API documentation for the client management system.

TASK: Set up routing and create complete API documentation with testing examples

REQUIREMENTS:
1. Create routes file (src/routes/clientRoutes.js):
   - GET /clients - Get all clients with pagination/search
   - GET /clients/:id - Get single client
   - POST /clients - Create new client  
   - PUT /clients/:id - Update existing client
   - DELETE /clients/:id - Delete client

2. Create main app.js to wire everything together:
   - Configure Express middleware
   - Set up routes with /api prefix
   - Add error handling middleware
   - Configure CORS properly

3. Update server.js to use app.js

4. Create comprehensive API documentation (API_ENDPOINTS.md):
   - Complete endpoint descriptions
   - Request/response examples
   - Error scenarios
   - cURL testing commands
   - Postman collection examples

5. Add input validation middleware for routes

DELIVERABLES:
- Complete routing setup
- Working API endpoints
- Comprehensive API documentation
- Testing examples with cURL and Postman
- Input validation for all endpoints

ACCEPTANCE CRITERIA:
- All routes respond correctly
- API documentation is complete and accurate
- cURL examples work as provided
- Error handling covers all scenarios
- Validation prevents invalid data entry

API DOCUMENTATION REQUIREMENTS:
For each endpoint include:
- HTTP method and URL
- Request parameters/body schema
- Response format and examples
- Possible error codes and messages
- cURL example
- Postman example

TESTING EXAMPLES:
Provide working examples for:
- Creating a client with valid data
- Creating a client with invalid data (validation errors)
- Getting all clients with pagination
- Searching clients by name/email
- Updating existing client
- Deleting a client
- Handling non-existent client ID

ERROR SCENARIOS TO DOCUMENT:
- Invalid JSON in request body
- Missing required fields
- Invalid email format
- Duplicate email address
- Client not found
- Database connection issues
- Invalid pagination parameters

VALIDATION MIDDLEWARE:
- Validate request body structure
- Sanitize input data
- Check parameter types
- Validate ID parameters are numeric
- Rate limiting (optional)

The documentation should be detailed enough that a frontend developer can integrate with the API without additional explanation.
```

## 🎨 Frontend Development Prompts

### Prompt 6: React Project Setup

```
Set up a React frontend project that will consume the client management API.

TASK: Create a React application with proper project structure and basic configuration

REQUIREMENTS:
1. Create React app in 'frontend' folder:
   - Use Create React App
   - Configure to work with the backend API
   - Set up environment variables

2. Install additional dependencies:
   - axios (for API calls)
   - Basic CSS framework or styled-components (optional)

3. Configure development environment:
   - Proxy API calls to backend (localhost:3001)
   - Set up environment variables for API URL
   - Configure CORS handling

4. Create basic project structure:
   - src/components/ (for reusable components)
   - src/pages/ (for main page components)
   - src/services/ (for API communication)
   - src/utils/ (for helper functions)
   - src/styles/ (for CSS files)

5. Create basic layout components:
   - App.js (main application component)
   - Header.js (navigation header)
   - Layout.js (page layout wrapper)

6. Set up basic routing (React Router):
   - Home page (/)
   - Clients list page (/clients)
   - Add client page (/clients/new)
   - Edit client page (/clients/:id/edit)

DELIVERABLES:
- Working React application
- Basic project structure
- Routing setup
- API configuration
- Basic layout components

ACCEPTANCE CRITERIA:
- React app starts without errors on http://localhost:3000
- Can navigate between different routes
- Console shows no errors
- Basic layout is responsive
- Development server hot-reloads changes

CONFIGURATION REQUIREMENTS:
- Environment variables for API URL
- Proxy configuration for API calls
- Basic error boundary setup
- Public folder with favicon and index.html
- Package.json with all necessary scripts

BASIC STYLING:
- Clean, modern design
- Mobile-responsive layout
- Consistent color scheme
- Clear navigation
- Professional appearance

The setup should be ready for building the client management features without additional configuration.
```

### Prompt 7: API Service Layer

```
Create a comprehensive API service layer for communicating with the backend client management API.

TASK: Build a centralized API client that handles all backend communication

REQUIREMENTS:
1. Create API service module (src/services/api.js):
   - Configure axios instance with base URL
   - Set up request/response interceptors
   - Handle authentication headers (future-ready)
   - Implement error handling

2. Create specific API functions for all endpoints:
   
   Client API functions:
   - getClients(params) - GET /api/clients with query params
   - getClient(id) - GET /api/clients/:id
   - createClient(clientData) - POST /api/clients
   - updateClient(id, clientData) - PUT /api/clients/:id
   - deleteClient(id) - DELETE /api/clients/:id

3. Implement request/response handling:
   - Transform request data as needed
   - Handle response data extraction
   - Implement retry logic for failed requests
   - Add request timeout handling

4. Create error handling utilities:
   - Parse API error responses
   - Transform errors to user-friendly messages
   - Handle network errors
   - Handle HTTP status codes

5. Add TypeScript interfaces (if using TypeScript) or JSDoc:
   - Client data interface
   - API response interfaces
   - Error response interfaces
   - Request parameter interfaces

DELIVERABLES:
- Complete API service with all client endpoints
- Error handling and retry logic
- Request/response transformation
- Comprehensive documentation
- Usage examples for each function

ACCEPTANCE CRITERIA:
- All API functions work correctly with backend
- Error handling covers all scenarios
- Functions return consistent data structures
- Network errors are handled gracefully
- API responses are properly transformed

API SERVICE STRUCTURE:
```javascript
// Example structure
const api = {
  clients: {
    getAll: (params) => { /* implementation */ },
    getById: (id) => { /* implementation */ },
    create: (data) => { /* implementation */ },
    update: (id, data) => { /* implementation */ },
    delete: (id) => { /* implementation */ }
  }
};
```

ERROR HANDLING REQUIREMENTS:
- Network connectivity issues
- HTTP error status codes (400, 404, 500, etc.)
- Timeout errors
- JSON parsing errors
- API rate limiting
- Server unavailable scenarios

RESPONSE TRANSFORMATION:
- Extract data from API response wrapper
- Handle pagination metadata
- Transform date strings to Date objects
- Normalize response format
- Handle empty responses

CONFIGURATION:
- Base URL from environment variables
- Request timeout settings
- Default headers
- CORS handling
- Request retry configuration

Include comprehensive JSDoc comments and usage examples for each function.
```

### Prompt 8: Client List Component

```
Create a comprehensive client list component that displays all clients with search, pagination, and management features.

TASK: Build the main client listing interface with full functionality

REQUIREMENTS:
1. Create ClientList component (src/components/ClientList.js):
   - Display clients in a responsive table/card layout
   - Implement search functionality with real-time filtering
   - Add pagination controls
   - Include sorting capabilities
   - Add action buttons (edit, delete) for each client

2. Implement state management:
   - Client data state
   - Loading states
   - Error states
   - Search query state
   - Pagination state (current page, total pages)
   - Sorting state (field, direction)

3. Create supporting components:
   - ClientCard (for individual client display)
   - SearchBar (for client search)
   - Pagination (for page navigation)
   - LoadingSpinner (for loading states)
   - ErrorMessage (for error display)

4. Add user interactions:
   - Search with debounced input
   - Sort by clicking column headers
   - Navigate between pages
   - Edit client (navigate to edit form)
   - Delete client with confirmation

5. Implement responsive design:
   - Table view for desktop
   - Card view for mobile
   - Responsive pagination
   - Mobile-friendly search

DELIVERABLES:
- Complete ClientList component with all features
- Supporting components (ClientCard, SearchBar, etc.)
- Responsive design for all screen sizes
- Loading and error states
- User interaction handlers

ACCEPTANCE CRITERIA:
- Displays all clients from API
- Search works in real-time with debouncing
- Pagination works correctly
- Sorting changes data order
- Edit/delete buttons work
- Mobile layout is user-friendly
- Loading states provide good UX
- Error handling shows helpful messages

COMPONENT STRUCTURE:
```javascript
// ClientList.js structure
function ClientList() {
  // State management
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Effects and handlers
  // Component render
}
```

FEATURES TO IMPLEMENT:
- Real-time search (debounced)
- Client count display
- Empty state when no clients
- Keyboard navigation support
- Loading skeleton (optional)
- Infinite scroll (optional alternative to pagination)

STYLING REQUIREMENTS:
- Clean, modern design
- Clear visual hierarchy
- Hover effects on interactive elements
- Responsive breakpoints
- Accessible color contrast
- Professional appearance

USER EXPERIENCE:
- Fast search response
- Clear loading indicators
- Helpful error messages
- Intuitive navigation
- Mobile-friendly interactions
- Keyboard accessibility

Include proper error boundaries and fallback UI for network issues.
```

### Prompt 9: Client Form Component

```
Create a comprehensive client form component for adding and editing client information.

TASK: Build a reusable form component that handles both creating new clients and editing existing ones

REQUIREMENTS:
1. Create ClientForm component (src/components/ClientForm.js):
   - Support both "create" and "edit" modes
   - Form validation with real-time feedback
   - Handle form submission with loading states
   - Reset form after successful submission
   - Pre-populate form data in edit mode

2. Implement form fields:
   - Name (required, text input)
   - Email (required, email input with validation)
   - Phone (optional, formatted phone input)
   - Form validation for each field

3. Add form validation:
   - Required field validation
   - Email format validation
   - Phone format validation (if provided)
   - Real-time validation feedback
   - Submit button disabled until valid

4. Handle form states:
   - Initial/empty state
   - Loading state during submission
   - Success state after submission
   - Error state if submission fails
   - Validation error states

5. Create form UI components:
   - Input fields with labels
   - Error message display
   - Submit and cancel buttons
   - Success/error notifications
   - Loading indicators

DELIVERABLES:
- Complete ClientForm component
- Form validation logic
- Success/error handling
- Loading states and indicators
- Responsive form design

ACCEPTANCE CRITERIA:
- Form validates input in real-time
- Submits data correctly to API
- Shows appropriate feedback messages
- Pre-populates data in edit mode
- Handles API errors gracefully
- Form is accessible and responsive
- Validation prevents invalid submissions

FORM STRUCTURE:
```javascript
// ClientForm.js structure
function ClientForm({ mode = 'create', clientId = null, onSuccess }) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Validation and submission logic
  // Form render
}
```

VALIDATION RULES:
- Name: Required, 1-100 characters, letters/spaces/hyphens only
- Email: Required, valid email format, unique (checked by API)
- Phone: Optional, format (XXX) XXX-XXXX or XXX-XXX-XXXX

FORM FEATURES:
- Auto-focus on first field
- Tab navigation between fields
- Enter key submits form
- Escape key clears form
- Form reset after successful submission
- Confirm navigation away with unsaved changes

ERROR HANDLING:
- Field-level validation errors
- API validation errors
- Network/server errors
- Duplicate email errors
- User-friendly error messages

SUCCESS HANDLING:
- Success message display
- Form reset
- Redirect to client list (optional)
- Update parent component state

STYLING:
- Clean, professional form design
- Clear field labels and placeholders
- Visual validation feedback (red/green borders)
- Disabled state styling for submit button
- Mobile-responsive layout
- Consistent spacing and typography

ACCESSIBILITY:
- Proper label associations
- ARIA attributes for validation
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

The form should provide an excellent user experience for both creating and editing clients.
```

### Prompt 10: Main App Integration and Navigation

```
Integrate all components into a complete React application with navigation, routing, and state management.

TASK: Create the main application structure that brings together all components with proper navigation and user flow

REQUIREMENTS:
1. Update App.js to be the main application container:
   - Set up React Router for navigation
   - Implement main layout with header and navigation
   - Handle global application state
   - Add error boundaries for robust error handling

2. Create navigation structure:
   - Header with navigation menu
   - Active link highlighting
   - Mobile-responsive hamburger menu
   - Breadcrumb navigation (optional)

3. Implement main pages/routes:
   - Home/Dashboard page (/) - Overview with statistics
   - Client List page (/clients) - ClientList component
   - Add Client page (/clients/new) - ClientForm in create mode
   - Edit Client page (/clients/:id/edit) - ClientForm in edit mode
   - Client Detail page (/clients/:id) - Single client view (optional)

4. Add global state management:
   - Client data caching
   - Loading states
   - Error handling
   - Success notifications
   - User feedback system

5. Implement user experience features:
   - Loading indicators for page transitions
   - Success/error toast notifications
   - Confirmation dialogs for destructive actions
   - "Back" navigation breadcrumbs
   - Page titles and meta information

DELIVERABLES:
- Complete App.js with routing and layout
- Navigation component with responsive design
- All pages working with proper routing
- Global state management
- User notification system

ACCEPTANCE CRITERIA:
- All routes work correctly
- Navigation is intuitive and responsive
- Page transitions are smooth
- Error handling works globally
- Mobile navigation works well
- Browser back/forward buttons work
- URLs are bookmarkable

APP STRUCTURE:
```javascript
// App.js structure
function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientForm mode="create" />} />
            <Route path="/clients/:id/edit" element={<ClientForm mode="edit" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
```

NAVIGATION REQUIREMENTS:
- Logo/brand name
- Main navigation menu
- Active state highlighting
- Mobile hamburger menu
- User-friendly menu labels
- Quick access to common actions

DASHBOARD/HOME PAGE:
- Welcome message
- Client statistics (total count, recent additions)
- Quick action buttons
- Recent clients list
- Navigation to main sections

GLOBAL FEATURES:
- Loading overlay for API calls
- Toast notifications for success/error
- Confirmation modals for delete actions
- Error boundary fallback UI
- 404 page for invalid routes

RESPONSIVE DESIGN:
- Mobile-first approach
- Touch-friendly navigation
- Readable text sizes
- Accessible tap targets
- Consistent spacing

USER FLOW:
- Clear navigation between sections
- Logical progression through tasks
- Easy return to previous pages
- Intuitive action buttons
- Helpful feedback messages

PERFORMANCE:
- Lazy loading of components (optional)
- Efficient re-rendering
- Proper component memoization
- Optimized bundle size

The final application should feel like a professional client management system with smooth user experience and intuitive navigation.
```

## 🧪 Testing and Documentation Prompts

### Prompt 11: Complete Application Testing

```
Create a comprehensive testing strategy and implementation for both backend and frontend of the client management system.

TASK: Implement testing for all components and create testing documentation

REQUIREMENTS:
1. Backend Testing:
   - Unit tests for all model methods
   - Integration tests for all API endpoints
   - Database operation tests
   - Error handling tests
   - Use Jest and Supertest

2. Frontend Testing:
   - Component unit tests
   - Integration tests for user flows
   - API integration tests
   - Form validation tests
   - Use Jest and React Testing Library

3. End-to-End Testing:
   - Complete user workflows
   - Cross-browser compatibility
   - Mobile responsiveness
   - Performance testing
   - Use Playwright or Cypress

4. Create testing documentation:
   - Testing strategy explanation
   - How to run tests
   - Test coverage requirements
   - Continuous integration setup

DELIVERABLES:
- Complete test suites for backend and frontend
- Test documentation
- CI/CD configuration
- Performance benchmarks
- Coverage reports

This prompt should be used after the main application is complete to ensure quality and reliability.
```

---

## 📋 Usage Instructions

1. **Use prompts sequentially** - Each builds on the previous one
2. **Complete each prompt fully** before moving to the next
3. **Test thoroughly** after each step
4. **Refer to API documentation** when building frontend
5. **Ask for clarification** if any requirements are unclear

Each prompt is designed to be self-contained with clear requirements, deliverables, and acceptance criteria. Take your time with each step and ensure everything works before proceeding to the next prompt.