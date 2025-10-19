# Best Practices and Patterns

This document outlines the best practices, patterns, and conventions to follow when developing the Client Management System.

## 🏗️ Architecture Patterns

### Backend Architecture (MVC Pattern)

#### Model Layer
```javascript
// clientModel.js - Data access layer
class ClientModel {
  static async findAll(options = {}) {
    // Handle data retrieval with proper error handling
    try {
      const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'DESC' } = options;
      // Implementation with prepared statements
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}
```

**Best Practices:**
- Use prepared statements for SQL queries
- Implement proper error handling
- Keep business logic separate from data access
- Use transactions for multiple related operations
- Validate data before database operations

#### Controller Layer
```javascript
// clientController.js - Request handling layer
const getAllClients = async (req, res) => {
  try {
    // Extract and validate query parameters
    const options = extractQueryOptions(req.query);
    
    // Call model method
    const result = await ClientModel.findAll(options);
    
    // Return standardized response
    res.json({
      success: true,
      data: result.clients,
      meta: result.meta
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

**Best Practices:**
- Keep controllers thin - delegate to models
- Use consistent response format
- Validate input parameters
- Handle errors gracefully
- Use proper HTTP status codes

#### Route Layer
```javascript
// clientRoutes.js - Route definitions
const router = express.Router();

router.get('/clients', validateQuery, getAllClients);
router.post('/clients', validateClient, createClient);
router.put('/clients/:id', validateParams, validateClient, updateClient);
```

**Best Practices:**
- Use middleware for validation
- Keep routes simple and focused
- Use descriptive route names
- Group related routes
- Apply middleware in logical order

### Frontend Architecture (Component-Based)

#### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Navigation
│   └── Footer
├── Pages
│   ├── ClientList
│   │   ├── ClientTable
│   │   ├── ClientCard
│   │   ├── SearchBar
│   │   └── Pagination
│   ├── ClientForm
│   │   ├── PersonalInfo
│   │   ├── ContactInfo
│   │   └── AddressInfo
│   └── ClientDetail
└── UI Components
    ├── Button
    ├── Input
    ├── Modal
    └── Card
```

#### Component Design Patterns

**1. Container/Presentational Pattern**
```typescript
// Container Component (handles logic)
const ClientListContainer: React.FC = () => {
  const { clients, loading, error } = useClients();
  const [search, setSearch] = useState('');
  
  return (
    <ClientListPresentation
      clients={clients}
      loading={loading}
      error={error}
      search={search}
      onSearchChange={setSearch}
    />
  );
};

// Presentational Component (handles UI)
interface ClientListProps {
  clients: Client[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (search: string) => void;
}

const ClientListPresentation: React.FC<ClientListProps> = ({
  clients, loading, error, search, onSearchChange
}) => {
  // Pure UI rendering
};
```

**2. Custom Hooks Pattern**
```typescript
// Custom hook for client management
const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (options?: FetchOptions) => {
    setLoading(true);
    try {
      const response = await api.getClients(options);
      setClients(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
};
```

## 📝 Coding Standards

### TypeScript Best Practices

#### Type Definitions
```typescript
// Define interfaces for all data structures
interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
}

// Use union types for specific values
type ClientSortField = 'first_name' | 'last_name' | 'email' | 'created_at';
type SortOrder = 'ASC' | 'DESC';

// Define API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Use generic types for reusability
interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
}
```

#### Function Typing
```typescript
// Use proper function signatures
const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  // Implementation
};

// Use proper event handlers
const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
  event.preventDefault();
  // Handle form submission
};

// Use proper component props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### JavaScript/Node.js Best Practices

#### Error Handling
```javascript
// Use proper error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class DatabaseError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        field: err.field
      }
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Internal server error'
      }
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
};
```

#### Async/Await Patterns
```javascript
// Always use try-catch with async/await
const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await ClientModel.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// Use Promise.all for concurrent operations
const getClientWithStats = async (id) => {
  try {
    const [client, stats] = await Promise.all([
      ClientModel.findById(id),
      ClientModel.getStats(id)
    ]);
    
    return { client, stats };
  } catch (error) {
    throw new Error(`Failed to fetch client data: ${error.message}`);
  }
};
```

## 🎨 UI/UX Best Practices

### Tailwind CSS Patterns

#### Component Composition
```typescript
// Use Tailwind utility classes effectively
const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
```

#### Responsive Design
```typescript
// Mobile-first responsive design
const ClientCard: React.FC<{ client: Client }> = ({ client }) => {
  return (
    <div className="
      bg-white rounded-lg shadow-md p-4
      sm:p-6
      md:flex md:items-center md:justify-between
      lg:p-8
    ">
      <div className="
        space-y-2
        md:space-y-0 md:space-x-4 md:flex md:items-center
      ">
        <h3 className="text-lg font-semibold text-gray-900">
          {client.first_name} {client.last_name}
        </h3>
        <p className="text-gray-600 text-sm md:text-base">
          {client.email}
        </p>
      </div>
      
      <div className="
        mt-4 flex space-x-2
        md:mt-0 md:ml-4
      ">
        <Button size="sm" variant="secondary">Edit</Button>
        <Button size="sm" variant="danger">Delete</Button>
      </div>
    </div>
  );
};
```

### Accessibility Best Practices

#### Form Accessibility
```typescript
const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  required = false,
  ...props 
}) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={id}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={clsx(
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2',
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        )}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

#### ARIA Labels and Roles
```typescript
const ClientList: React.FC<ClientListProps> = ({ clients, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8" role="status" aria-live="polite">
        <span className="sr-only">Loading clients...</span>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div role="main">
      <h1 className="text-2xl font-bold mb-6">Client List</h1>
      
      <table 
        className="w-full border-collapse"
        role="table"
        aria-label="Client information"
      >
        <thead>
          <tr role="row">
            <th scope="col" className="text-left p-2">Name</th>
            <th scope="col" className="text-left p-2">Email</th>
            <th scope="col" className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} role="row">
              <td className="p-2">{client.first_name} {client.last_name}</td>
              <td className="p-2">{client.email}</td>
              <td className="p-2">
                <button 
                  aria-label={`Edit ${client.first_name} ${client.last_name}`}
                  className="text-blue-600 hover:underline mr-2"
                >
                  Edit
                </button>
                <button 
                  aria-label={`Delete ${client.first_name} ${client.last_name}`}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 🔒 Security Best Practices

### Input Validation
```javascript
// Backend validation
const Joi = require('joi');

const clientSchema = Joi.object({
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\(\d{3}\) \d{3}-\d{4}$/).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zip_code: Joi.string().max(10).optional()
});

const validateClient = (req, res, next) => {
  const { error } = clientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      }
    });
  }
  next();
};
```

### SQL Injection Prevention
```javascript
// Always use prepared statements
const findByEmail = async (email) => {
  const query = 'SELECT * FROM clients WHERE email = ?';
  const [rows] = await db.prepare(query).all(email);
  return rows[0] || null;
};

// Never use string concatenation
// BAD: `SELECT * FROM clients WHERE email = '${email}'`
// GOOD: Use parameterized queries as shown above
```

### CORS Configuration
```javascript
// Specific CORS configuration
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

## 📊 Performance Best Practices

### Database Optimization
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Use LIMIT for pagination
SELECT * FROM clients 
ORDER BY created_at DESC 
LIMIT ? OFFSET ?;
```

### Frontend Optimization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return clients.reduce((sum, client) => sum + calculateValue(client), 0);
}, [clients]);

// Memoize event handlers
const handleSearch = useCallback((searchTerm: string) => {
  setSearch(searchTerm);
}, []);

// Memoize components
const ClientCard = React.memo<ClientCardProps>(({ client, onEdit, onDelete }) => {
  return (
    <div className="client-card">
      {/* Component content */}
    </div>
  );
});
```

### Code Splitting
```typescript
// Lazy load components
const ClientForm = lazy(() => import('../components/ClientForm'));
const ClientDetail = lazy(() => import('../components/ClientDetail'));

// Use Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  <ClientForm />
</Suspense>
```

## 🧪 Testing Best Practices

### Unit Testing
```typescript
// Test components with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Testing
```javascript
// Test API endpoints
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/clients', () => {
  test('should return list of clients', async () => {
    const response = await request(app)
      .get('/api/clients')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: expect.any(Array)
    });
  });

  test('should handle pagination', async () => {
    const response = await request(app)
      .get('/api/clients?page=1&limit=5')
      .expect(200);

    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 5,
      total: expect.any(Number)
    });
  });
});
```

## 📚 Documentation Standards

### Code Documentation
```typescript
/**
 * Fetches a list of clients with optional filtering and pagination
 * @param options - Filtering and pagination options
 * @param options.page - Page number (1-based)
 * @param options.limit - Number of items per page
 * @param options.search - Search term to filter by name or email
 * @param options.sort - Field to sort by
 * @param options.order - Sort order (ASC or DESC)
 * @returns Promise resolving to paginated client data
 * @throws {ValidationError} When options are invalid
 * @throws {DatabaseError} When database query fails
 */
const getClients = async (options: ClientFetchOptions): Promise<PaginatedResponse<Client>> => {
  // Implementation
};
```

### API Documentation
```markdown
## POST /api/clients

Creates a new client record.

### Request Body
```json
{
  "first_name": "string (required, 1-50 chars)",
  "last_name": "string (required, 1-50 chars)", 
  "email": "string (required, valid email)",
  "phone": "string (optional, phone format)",
  "address": "string (optional, max 200 chars)"
}
```

### Response
- **201 Created** - Client created successfully
- **400 Bad Request** - Validation error
- **409 Conflict** - Email already exists
```

These best practices will help you build a maintainable, scalable, and professional application while learning modern web development techniques.