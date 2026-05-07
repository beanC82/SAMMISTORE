export interface ReduxPayload {
    result?: {
      subset?: any[];
      id?: string;
      errorMessage?: string;
      totalItemCount?: number;
    };
    message?: string;
    isSuccess?: boolean;
    errors?: {
      memberName: string,
      errorMessage: string
    }
  }