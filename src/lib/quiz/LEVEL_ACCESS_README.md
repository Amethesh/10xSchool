# Level Access Management System

This system provides comprehensive level access control for the quiz application, allowing administrators to manage which levels students can access.

## Overview

The level access system consists of:
- **Level Access Control**: Check if students have permission to access specific levels
- **Access Requests**: Students can request access to locked levels
- **Admin Management**: Administrators can approve/deny access requests
- **Middleware Protection**: Automatic route protection based on level access
- **React Components**: UI components for managing level access

## Database Schema

### Tables Created

1. **level_access**: Tracks granted level access
   - `id`: UUID primary key
   - `student_id`: References students table
   - `level`: Level name (e.g., 'movers', 'ket')
   - `granted_at`: Timestamp when access was granted
   - `granted_by`: Admin who granted access

2. **access_requests**: Tracks access requests
   - `id`: UUID primary key
   - `student_id`: References students table
   - `level`: Requested level name
   - `status`: 'pending', 'approved', or 'denied'
   - `requested_at`: Request timestamp
   - `reviewed_at`: Review timestamp
   - `reviewed_by`: Admin who reviewed

## Core Functions

### Client-Side Functions (`src/lib/quiz/level-access.ts`)

```typescript
// Check if student has access to a level
await checkStudentLevelAccess(studentId: string, level: string): Promise<boolean>

// Get all accessible levels for a student
await getStudentAccessibleLevels(studentId: string): Promise<string[]>

// Create an access request
await createAccessRequest(studentId: string, level: string): Promise<string>

// Get student's access requests
await getStudentAccessRequests(studentId: string, status?: string): Promise<AccessRequest[]>

// Admin functions
await getPendingAccessRequests(): Promise<AccessRequest[]>
await approveAccessRequest(requestId: string, adminId: string): Promise<void>
await denyAccessRequest(requestId: string, adminId: string): Promise<void>
```

### Server-Side Functions (`src/lib/quiz/level-access-server.ts`)

```typescript
// Server-side level access check (for middleware)
await checkStudentLevelAccessServer(studentId: string, level: string): Promise<boolean>

// Validate level access for routes
await validateLevelAccessForRoute(userId: string, level: string): Promise<{hasAccess: boolean, error?: string}>

// Extract level from URL path
extractLevelFromPath(pathname: string): string | null

// Check if route requires level validation
requiresLevelAccessValidation(pathname: string): boolean
```

## React Hooks

### `useLevelAccess(level: string)`
Check if current user has access to a specific level.

```typescript
const { data: hasAccess, isLoading, error } = useLevelAccess('movers');
```

### `useAccessibleLevels()`
Get all levels the current user can access.

```typescript
const { data: levels, isLoading } = useAccessibleLevels();
```

### `useLevelAccessManager(level: string)`
Complete level access management with request functionality.

```typescript
const {
  hasAccess,
  hasPendingRequest,
  handleRequestAccess,
  canRequestAccess,
  buttonText,
  buttonState,
  isRequesting
} = useLevelAccessManager('movers');
```

## React Components

### `LevelAccessButton`
Button component for requesting level access.

```tsx
<LevelAccessButton 
  level="movers"
  onAccessGranted={() => console.log('Access granted!')}
/>
```

### `LevelAccessGuard`
Higher-order component to protect routes requiring level access.

```tsx
<LevelAccessGuard level="movers">
  <QuizComponent />
</LevelAccessGuard>
```

### `LevelAccessBadge`
Simple badge showing access status.

```tsx
<LevelAccessBadge level="movers" />
```

## API Routes

### Student Routes

**POST /api/student/access-request**
Create an access request for a level.

```typescript
fetch('/api/student/access-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ level: 'movers' })
});
```

### Admin Routes

**GET /api/admin/access-requests**
Get all pending access requests (admin only).

**POST /api/admin/access-requests**
Approve or deny access requests (admin only).

```typescript
// Single request
fetch('/api/admin/access-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'approve', 
    requestId: 'uuid' 
  })
});

// Bulk requests
fetch('/api/admin/access-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'approve', 
    requestIds: ['uuid1', 'uuid2'] 
  })
});
```

## Middleware Protection

The middleware automatically protects routes based on level access:

```typescript
// Protected routes:
// /student/quiz/[level]/...
// /student/levels/[level]

// If user lacks access, they're redirected to:
// /student/levels?error=access_denied&level=movers
```

## Level Hierarchy

The system supports these levels in order:
1. `beginner` (always accessible)
2. `movers`
3. `flyers`
4. `ket`
5. `pet`
6. `fce`
7. `cae`
8. `cpe`

## Usage Examples

### Basic Level Check
```typescript
import { useLevelAccess } from '@/hooks/use-level-access';

function QuizPage({ level }: { level: string }) {
  const { data: hasAccess, isLoading } = useLevelAccess(level);
  
  if (isLoading) return <div>Loading...</div>;
  if (!hasAccess) return <div>Access denied</div>;
  
  return <QuizComponent level={level} />;
}
```

### Request Access Flow
```typescript
import { useLevelAccessManager } from '@/hooks/use-level-access';

function LevelCard({ level }: { level: string }) {
  const {
    hasAccess,
    handleRequestAccess,
    canRequestAccess,
    buttonText,
    isRequesting
  } = useLevelAccessManager(level);

  return (
    <div>
      <h3>{level}</h3>
      {hasAccess ? (
        <button>Start Quiz</button>
      ) : (
        <button 
          onClick={handleRequestAccess}
          disabled={!canRequestAccess || isRequesting}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
```

### Admin Management
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function AdminPanel() {
  const { data: requests } = useQuery({
    queryKey: ['admin-access-requests'],
    queryFn: () => fetch('/api/admin/access-requests').then(r => r.json())
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => 
      fetch('/api/admin/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId })
      })
  });

  return (
    <div>
      {requests?.requests.map(request => (
        <div key={request.id}>
          <span>{request.studentName} - {request.level}</span>
          <button onClick={() => approveMutation.mutate(request.id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Security Considerations

1. **Server-Side Validation**: All access checks are validated server-side
2. **Middleware Protection**: Routes are automatically protected
3. **Admin Role Verification**: Admin functions require role verification
4. **Input Validation**: All inputs are validated and sanitized
5. **Rate Limiting**: Consider implementing rate limiting for access requests

## Testing

Run the level access utility tests:

```bash
npm test -- src/lib/quiz/__tests__/level-access.test.ts --run
```

The tests cover:
- Level hierarchy validation
- Access request validation
- Utility functions
- Level formatting and descriptions

## Error Handling

The system includes comprehensive error handling:
- Network errors with retry mechanisms
- Validation errors with user-friendly messages
- Authentication errors with redirects
- Database errors with fallback responses

## Performance Considerations

- **Caching**: React Query caches access data for 5 minutes
- **Optimistic Updates**: UI updates optimistically for better UX
- **Batch Operations**: Bulk approve/deny operations for efficiency
- **Database Indexing**: Indexes on frequently queried columns

## Future Enhancements

Potential improvements:
1. **Automatic Level Progression**: Auto-grant access based on performance
2. **Time-Based Access**: Temporary access grants
3. **Group Management**: Bulk student level management
4. **Analytics**: Track access request patterns
5. **Notifications**: Real-time notifications for access changes