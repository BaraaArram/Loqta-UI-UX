n# Authentication System Documentation

This document describes the authentication system implementation for the Loqta e-commerce platform, which uses Django REST Framework with JWT authentication on the backend and Axios for API calls on the frontend.

## API Base URL

The API is hosted at: `http://localhost:8000`

## Authentication Endpoints

All authentication endpoints are prefixed with `/auth/`:

### 1. User Registration
- **URL**: `POST /auth/register/`
- **Description**: Register a new user account
- **Request Body**:
```json
{
  "username": "johndoe",
  "phone_number": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "re_password": "securepassword123"
}
```
- **Response**:
```json
{
  "user": {
    "id": "1",
    "email": "john@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "is_active": true,
    "date_joined": "2024-01-01T00:00:00Z",
    "last_login": null
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 2. Account Activation
- **URL**: `POST /auth/activate/`
- **Description**: Activate user account using email verification
- **Request Body**:
```json
{
  "uid": "MQ",
  "token": "abc123def456"
}
```
- **Response**:
```json
{
  "detail": "Account activated successfully"
}
```

### 3. User Login
- **URL**: `POST /auth/token/create/`
- **Description**: Authenticate user and receive JWT tokens
- **Request Body**:
```json
{
  "email": "baraaarram2001@gmail.com",
  "password": "123456789Baraa"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "message": "Token successfully obtained",
    "data": {
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1MTc5OTI5NiwiaWF0IjoxNzUxMTk0NDk2LCJqdGkiOiJjYTZlZjgyNjY1YjI0Mjk5YmEwNmZiZjAxMTIwNDUzZiIsInVzZXJfaWQiOjF9.JFx7mfwrbJtXfcZkSJlScK3CC0VRkeJkTDbTBLyOfvU",
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNDkwNDk2LCJpYXQiOjE3NTExOTQ0OTYsImp0aSI6Ijg4YWM0NmNmZjQ3NzQ2YzA5MmY1NDM5OGQ0MDA1N2Y3IiwidXNlcl9pZCI6MX0.SSt56tLR6Mz_CIcnY8lYLFdp6kgbxB9i5lzSbeNVja4"
    }
  }
}
```

### 4. Token Refresh
- **URL**: `POST /auth/token/refresh/`
- **Description**: Get new access token using refresh token
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1MTc5OTI5NiwiaWF0IjoxNzUxMTk0NDk2LCJqdGkiOiJjYTZlZjgyNjY1YjI0Mjk5YmEwNmZiZjAxMTIwNDUzZiIsInVzZXJfaWQiOjF9.JFx7mfwrbJtXfcZkSJlScK3CC0VRkeJkTDbTBLyOfvU"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "message": "Token successfully refreshed",
    "data": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNDkwNDk2LCJpYXQiOjE3NTExOTQ0OTYsImp0aSI6Ijg4YWM0NmNmZjQ3NzQ2YzA5MmY1NDM5OGQ0MDA1N2Y3IiwidXNlcl9pZCI6MX0.SSt56tLR6Mz_CIcnY8lYLFdp6kgbxB9i5lzSbeNVja4"
    }
  }
}
```

### 5. Token Verification
- **URL**: `POST /auth/token/verify/`
- **Description**: Verify if access token is valid
- **Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNDkwNDk2LCJpYXQiOjE3NTExOTQ0OTYsImp0aSI6Ijg4YWM0NmNmZjQ3NzQ2YzA5MmY1NDM5OGQ0MDA1N2Y3IiwidXNlcl9pZCI6MX0.SSt56tLR6Mz_CIcnY8lYLFdp6kgbxB9i5lzSbeNVja4"
}
```
- **Response**:
```json
{
  "detail": "Token is valid"
}
```

### 6. User Logout
- **URL**: `POST /auth/token/destroy/`
- **Description**: Invalidate refresh token
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1MTc5OTI5NiwiaWF0IjoxNzUxMTk0NDk2LCJqdGkiOiJjYTZlZjgyNjY1YjI0Mjk5YmEwNmZiZjAxMTIwNDUzZiIsInVzZXJfaWQiOjF9.JFx7mfwrbJtXfcZkSJlScK3CC0VRkeJkTDbTBLyOfvU"
}
```
- **Response**: `204 No Content`

### 7. Password Reset Request
- **URL**: `POST /auth/reset-password/`
- **Description**: Request password reset email
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response**:
```json
{
  "detail": "Password reset email sent"
}
```

### 8. Password Reset Confirmation
- **URL**: `POST /auth/reset-password-confirm/`
- **Description**: Reset password using token from email
- **Request Body**:
```json
{
  "uid": "MQ",
  "token": "abc123def456",
  "new_password": "newsecurepassword123"
}
```
- **Response**:
```json
{
  "detail": "Password reset successful"
}
```

### 9. Set Password
- **URL**: `POST /auth/set-password/`
- **Description**: Change password for authenticated user
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```
- **Response**:
```json
{
  "detail": "Password changed successfully"
}
```

### 10. Get User Profile
- **URL**: `GET /auth/profile/`
- **Description**: Get current user profile information
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**:
```json
{
  "id": "1",
  "email": "john@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "is_active": true,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T12:00:00Z"
}
```

## Django API Response Structure

The Django API uses a consistent response structure for authentication endpoints:

```typescript
interface DjangoApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TokenData {
  message: string;
  data: {
    refresh: string;
    access: string;
  };
}
```

### Token Extraction

The frontend automatically extracts tokens from the nested response structure:

```typescript
// Login response handling
const response = await api.post<DjangoApiResponse<TokenData>>('/auth/token/create/', credentials);
const { data } = response.data;
return {
  access: data.data.access,
  refresh: data.data.refresh,
};
```

## API Endpoints Structure

The Django API follows this URL structure:

```
http://localhost:8000/
├── auth/                    # Authentication endpoints
│   ├── register/
│   ├── activate/
│   ├── token/create/
│   ├── token/refresh/
│   ├── token/verify/
│   ├── token/destroy/
│   ├── reset-password/
│   ├── reset-password-confirm/
│   ├── set-password/
│   └── profile/
├── api/v1/                  # Main API endpoints
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   └── wishlist/
├── payment/                 # Payment endpoints
├── admin/                   # Django admin
└── api/schema/             # API documentation
```

## Frontend Implementation

### Configuration

The frontend is configured to use the correct API base URL:

```typescript
// src/config/env.ts
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
  },
  // ...
};
```

### API Service

All API calls are handled through the `src/services/api.ts` file, which provides:

- **authAPI**: Authentication-related API calls with proper token extraction
- **productsAPI**: Product-related API calls
- **categoriesAPI**: Category-related API calls
- **cartAPI**: Shopping cart API calls
- **ordersAPI**: Order management API calls
- **wishlistAPI**: Wishlist API calls
- **reviewsAPI**: Product reviews API calls

### Authentication Context

The `AuthContext` (`src/contexts/AuthContext.tsx`) provides:

- User authentication state management
- Token storage and refresh logic
- Login/logout functionality
- Automatic token refresh on 401 errors

### Axios Configuration

The axios instance (`src/lib/axios.ts`) is configured with:

- Automatic token injection in request headers
- Automatic token refresh on 401 responses
- Error handling and transformation
- Request/response interceptors

## Token Management

### Storage
- **Access Token**: Stored in localStorage as 'token'
- **Refresh Token**: Stored in localStorage as 'refreshToken'
- **User Data**: Stored in localStorage as 'user'

### Automatic Refresh
- Access tokens are automatically refreshed when they expire
- Refresh tokens are used to get new access tokens
- If refresh fails, user is automatically logged out

### Security Features
- Tokens are stored in localStorage
- Automatic token refresh prevents session expiration
- Logout invalidates refresh tokens on the server
- CSRF protection through Django's built-in mechanisms

## Error Handling

### Common Error Responses

```json
{
  "detail": "Error message"
}
```

### Validation Errors

```json
{
  "email": ["This field is required."],
  "password": ["This password is too short."]
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error

## Usage Examples

### Login Flow
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();

const handleLogin = async () => {
  try {
    await login({
      email: 'baraaarram2001@gmail.com',
      password: '123456789Baraa'
    });
    // User is now authenticated
  } catch (error) {
    // Handle login error
  }
};
```

### Protected API Call
```typescript
import { authAPI } from '@/services/api';

const getProfile = async () => {
  try {
    const profile = await authAPI.getProfile();
    return profile;
  } catch (error) {
    // Handle error
  }
};
```

### Product API Call
```typescript
import { productsAPI } from '@/services/api';

const getProducts = async () => {
  try {
    const products = await productsAPI.getAll();
    return products;
  } catch (error) {
    // Handle error
  }
};
```

## Testing

A test page is available at `/test-auth` to verify all authentication endpoints are working correctly. The test page includes:

- Login test with real credentials
- Registration test
- Logout test
- Profile fetch test
- Token refresh test

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Django Settings
Ensure your Django settings include:
- `djangorestframework-simplejwt` for JWT authentication
- CORS configuration for frontend domain
- Proper authentication classes and permissions

## Best Practices

1. **Token Security**: Never expose refresh tokens in client-side code
2. **Error Handling**: Always handle API errors gracefully
3. **Loading States**: Show loading indicators during API calls
4. **Validation**: Validate user input before sending to API
5. **Logout**: Always call logout endpoint to invalidate tokens
6. **Refresh Logic**: Implement automatic token refresh
7. **Error Messages**: Display user-friendly error messages

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Django CORS settings include your frontend domain
2. **Token Expiration**: Check if tokens are being refreshed automatically
3. **Authentication Errors**: Verify token format and expiration
4. **API Endpoint Errors**: Confirm URL structure matches Django URLs

### Debug Steps

1. Check browser network tab for API calls
2. Verify token format in localStorage
3. Test endpoints directly with tools like Postman
4. Check Django server logs for errors
5. Use the test page at `/test-auth` to verify endpoints

## Security Considerations

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Implement proper CORS policies
- Use HTTPS in production
- Regularly rotate refresh tokens
- Implement rate limiting on authentication endpoints
- Log authentication events for security monitoring 