export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const parseApiError = (error: any): ApiError => {
  // Handle different error formats
  if (error?.response?.data) {
    const { data, status } = error.response;
    
    // Handle Django REST Framework error format
    if (data.detail) {
      return {
        message: data.detail,
        status,
        code: data.code,
        details: data
      };
    }
    
    // Handle custom API error format with 'errors' object
    if (typeof data === 'object' && data.errors && typeof data.errors === 'object') {
      return {
        message: data.message || 'Validation failed',
        status,
        details: data.errors
      };
    }
    
    // Handle field-specific validation errors
    if (typeof data === 'object' && Object.keys(data).length > 0) {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        return {
          message: firstError[0] as string,
          status,
          details: data
        };
      }
      if (typeof firstError === 'string') {
        return {
          message: firstError,
          status,
          details: data
        };
      }
    }
    
    // Handle generic error message
    if (data.message) {
      return {
        message: data.message,
        status,
        details: data
      };
    }
  }
  
  // Handle network errors
  if (error?.message === 'Network Error') {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      status: 0,
      code: 'NETWORK_ERROR'
    };
  }
  
  // Handle timeout errors
  if (error?.code === 'ECONNABORTED') {
    return {
      message: 'Request timed out. Please try again.',
      status: 408,
      code: 'TIMEOUT'
    };
  }
  
  // Handle generic error
  return {
    message: error?.message || 'An unexpected error occurred. Please try again.',
    status: error?.status || 500,
    code: 'UNKNOWN_ERROR'
  };
};

export const getErrorMessage = (error: any): string => {
  const apiError = parseApiError(error);
  return apiError.message;
};

export const getValidationErrors = (error: any): ValidationError[] => {
  const apiError = parseApiError(error);
  
  if (apiError.details && typeof apiError.details === 'object') {
    const validationErrors: ValidationError[] = [];
    
    Object.entries(apiError.details).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((message: string) => {
          validationErrors.push({ field, message });
        });
      } else if (typeof messages === 'string') {
        validationErrors.push({ field, message: messages });
      }
    });
    
    return validationErrors;
  }
  
  return [];
};

export const isNetworkError = (error: any): boolean => {
  return error?.message === 'Network Error' || error?.code === 'NETWORK_ERROR';
};

export const isAuthError = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 401 || status === 403;
};

export const isServerError = (error: any): boolean => {
  const status = error?.response?.status;
  return status >= 500;
};

export const isValidationError = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 400 || status === 422;
};

export const getErrorType = (error: any): 'network' | 'auth' | 'validation' | 'server' | 'unknown' => {
  if (isNetworkError(error)) return 'network';
  if (isAuthError(error)) return 'auth';
  if (isValidationError(error)) return 'validation';
  if (isServerError(error)) return 'server';
  return 'unknown';
}; 