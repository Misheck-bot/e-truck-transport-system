declare module 'flutterwave-node-v3' {
  interface FlutterwaveConfig {
    publicKey: string;
    secretKey: string;
  }

  interface TransactionVerifyParams {
    id: string;
  }

  interface TransactionData {
    status: string;
    [key: string]: any;
  }

  interface TransactionResponse {
    status: string;
    data: TransactionData;
    message?: string;
  }

  class Flutterwave {
    constructor(publicKey: string, secretKey: string);
    Transaction: {
      verify(params: TransactionVerifyParams): Promise<TransactionResponse>;
    };
    Payment: {
      initialize(payload: any): Promise<TransactionResponse>;
    };
  }

  export default Flutterwave;
} 