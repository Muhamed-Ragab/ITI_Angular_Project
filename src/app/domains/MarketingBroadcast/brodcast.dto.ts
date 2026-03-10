export interface BroadcastRequest {
  channel: 'email' | 'push' | 'promotional';
  title: string;
  body: string;
}

export interface BroadcastResponse {
  success: boolean;
  message: string;
  data: {
    channel: string;
    title: string;
    body: string;
    recipients_count: number; 
  };
}
