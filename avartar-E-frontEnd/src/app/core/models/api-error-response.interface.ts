export interface ApiErrorRespnse {
  status: number;
  message: string;
  timestamp: string;
  error?: { [key: string]: string }
}
