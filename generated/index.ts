// Generated types for Envio indexer
export interface EventContext {
  User: {
    get(id: string): Promise<User | null>;
    set(user: User): void;
  };
  Transfer: {
    get(id: string): Promise<Transfer | null>;
    set(transfer: Transfer): void;
  };
  Claim: {
    get(id: string): Promise<Claim | null>;
    set(claim: Claim): void;
  };
}

export interface User {
  id: string;
  address: string;
  fid: bigint | null;
  totalClaimed: bigint;
  currentBalance: bigint;
  claimCount: number;
  firstClaimDate: bigint | null;
  lastClaimDate: bigint | null;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: bigint;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: bigint;
}

export interface Claim {
  id: string;
  user: string;
  amount: bigint;
  nonce: bigint;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: bigint;
}

export interface ContractEvent {
  params: any;
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  block: {
    timestamp: number;
  };
}

export interface EventHandler<T> {
  handler: (args: { event: ContractEvent & { params: T }; context: EventContext }) => Promise<void>;
}

// Contract interfaces
export const LexipopTokenContract = {
  Transfer: {
    handler: (fn: (args: { event: ContractEvent & { params: { from: string; to: string; value: bigint } }; context: EventContext }) => Promise<void>) => {
      // This would be implemented by Envio
    }
  } as EventHandler<{ from: string; to: string; value: bigint }>,

  Approval: {
    handler: (fn: (args: { event: ContractEvent & { params: { owner: string; spender: string; value: bigint } }; context: EventContext }) => Promise<void>) => {
      // This would be implemented by Envio
    }
  } as EventHandler<{ owner: string; spender: string; value: bigint }>
};

export const MoneyTreeContract = {
  Deposit: {
    handler: (fn: (args: { event: ContractEvent & { params: { signer: string; token: string; amount: bigint } }; context: EventContext }) => Promise<void>) => {
      // This would be implemented by Envio
    }
  } as EventHandler<{ signer: string; token: string; amount: bigint }>,

  Withdraw: {
    handler: (fn: (args: { event: ContractEvent & { params: { signer: string; recipient: string; token: string; amount: bigint } }; context: EventContext }) => Promise<void>) => {
      // This would be implemented by Envio
    }
  } as EventHandler<{ signer: string; recipient: string; token: string; amount: bigint }>
};