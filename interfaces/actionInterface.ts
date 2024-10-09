export interface ApiResponse<T> {
  statusCode: number; // HTTP status code (e.g., 200, 404, 500)
  success: boolean; // Indicates if the operation was successful
  message: string; // Descriptive message about the response
  data?: T; // Generic type to hold response data (if any)
  error?: string; // Error message (if any)
}
