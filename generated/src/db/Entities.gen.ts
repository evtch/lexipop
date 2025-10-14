/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type Claim_t = {
  readonly amount: bigint; 
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly nonce: bigint; 
  readonly timestamp: bigint; 
  readonly transactionHash: string; 
  readonly user_id: id
};

export type Claim_indexedFieldOperations = { readonly user_id: whereOperations<Claim_t,id> };

export type Transfer_t = {
  readonly amount: bigint; 
  readonly blockNumber: bigint; 
  readonly from: string; 
  readonly id: id; 
  readonly timestamp: bigint; 
  readonly to: string; 
  readonly transactionHash: string
};

export type Transfer_indexedFieldOperations = {};

export type User_t = {
  readonly address: string; 
  readonly claimCount: number; 
  readonly createdAt: bigint; 
  readonly currentBalance: bigint; 
  readonly fid: (undefined | bigint); 
  readonly firstClaimDate: (undefined | bigint); 
  readonly id: id; 
  readonly lastClaimDate: (undefined | bigint); 
  readonly totalClaimed: bigint; 
  readonly updatedAt: bigint
};

export type User_indexedFieldOperations = {};
