/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {Claim_t as Entities_Claim_t} from '../src/db/Entities.gen';

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {Transfer_t as Entities_Transfer_t} from '../src/db/Entities.gen';

import type {User_t as Entities_User_t} from '../src/db/Entities.gen';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = {
  readonly log: Envio_logger; 
  readonly addLexipopToken: (_1:Address_t) => void; 
  readonly addMoneyTree: (_1:Address_t) => void
};

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type claim = Entities_Claim_t;
export type Claim = claim;

export type transfer = Entities_Transfer_t;
export type Transfer = transfer;

export type user = Entities_User_t;
export type User = user;

export type eventIdentifier = {
  readonly chainId: number; 
  readonly blockTimestamp: number; 
  readonly blockNumber: number; 
  readonly logIndex: number
};

export type entityUpdateAction<entityType> = "Delete" | { TAG: "Set"; _0: entityType };

export type entityUpdate<entityType> = {
  readonly eventIdentifier: eventIdentifier; 
  readonly entityId: id; 
  readonly entityUpdateAction: entityUpdateAction<entityType>
};

export type entityValueAtStartOfBatch<entityType> = 
    "NotSet"
  | { TAG: "AlreadySet"; _0: entityType };

export type updatedValue<entityType> = {
  readonly latest: entityUpdate<entityType>; 
  readonly history: entityUpdate<entityType>[]; 
  readonly containsRollbackDiffChange: boolean
};

export type inMemoryStoreRowEntity<entityType> = 
    { TAG: "Updated"; _0: updatedValue<entityType> }
  | { TAG: "InitialReadFromDb"; _0: entityValueAtStartOfBatch<entityType> };

export type Transaction_t = {
  readonly hash: string; 
  readonly from: (undefined | Address_t); 
  readonly to: (undefined | Address_t); 
  readonly value: bigint; 
  readonly input: string
};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {
  readonly from: (undefined | Address_t); 
  readonly hash: string; 
  readonly input: string; 
  readonly to: (undefined | Address_t); 
  readonly value: bigint
};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type LexipopToken_chainId = 8453;

export type LexipopToken_Transfer_eventArgs = {
  readonly from: Address_t; 
  readonly to: Address_t; 
  readonly value: bigint
};

export type LexipopToken_Transfer_block = Block_t;

export type LexipopToken_Transfer_transaction = Transaction_t;

export type LexipopToken_Transfer_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: LexipopToken_Transfer_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: LexipopToken_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: LexipopToken_Transfer_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: LexipopToken_Transfer_block
};

export type LexipopToken_Transfer_loaderArgs = Internal_genericLoaderArgs<LexipopToken_Transfer_event,loaderContext>;

export type LexipopToken_Transfer_loader<loaderReturn> = Internal_genericLoader<LexipopToken_Transfer_loaderArgs,loaderReturn>;

export type LexipopToken_Transfer_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<LexipopToken_Transfer_event,handlerContext,loaderReturn>;

export type LexipopToken_Transfer_handler<loaderReturn> = Internal_genericHandler<LexipopToken_Transfer_handlerArgs<loaderReturn>>;

export type LexipopToken_Transfer_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<LexipopToken_Transfer_event,contractRegistrations>>;

export type LexipopToken_Transfer_eventFilter = { readonly from?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type LexipopToken_Transfer_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: LexipopToken_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type LexipopToken_Transfer_eventFiltersDefinition = 
    LexipopToken_Transfer_eventFilter
  | LexipopToken_Transfer_eventFilter[];

export type LexipopToken_Transfer_eventFilters = 
    LexipopToken_Transfer_eventFilter
  | LexipopToken_Transfer_eventFilter[]
  | ((_1:LexipopToken_Transfer_eventFiltersArgs) => LexipopToken_Transfer_eventFiltersDefinition);

export type LexipopToken_Approval_eventArgs = {
  readonly owner: Address_t; 
  readonly spender: Address_t; 
  readonly value: bigint
};

export type LexipopToken_Approval_block = Block_t;

export type LexipopToken_Approval_transaction = Transaction_t;

export type LexipopToken_Approval_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: LexipopToken_Approval_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: LexipopToken_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: LexipopToken_Approval_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: LexipopToken_Approval_block
};

export type LexipopToken_Approval_loaderArgs = Internal_genericLoaderArgs<LexipopToken_Approval_event,loaderContext>;

export type LexipopToken_Approval_loader<loaderReturn> = Internal_genericLoader<LexipopToken_Approval_loaderArgs,loaderReturn>;

export type LexipopToken_Approval_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<LexipopToken_Approval_event,handlerContext,loaderReturn>;

export type LexipopToken_Approval_handler<loaderReturn> = Internal_genericHandler<LexipopToken_Approval_handlerArgs<loaderReturn>>;

export type LexipopToken_Approval_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<LexipopToken_Approval_event,contractRegistrations>>;

export type LexipopToken_Approval_eventFilter = { readonly owner?: SingleOrMultiple_t<Address_t>; readonly spender?: SingleOrMultiple_t<Address_t> };

export type LexipopToken_Approval_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: LexipopToken_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type LexipopToken_Approval_eventFiltersDefinition = 
    LexipopToken_Approval_eventFilter
  | LexipopToken_Approval_eventFilter[];

export type LexipopToken_Approval_eventFilters = 
    LexipopToken_Approval_eventFilter
  | LexipopToken_Approval_eventFilter[]
  | ((_1:LexipopToken_Approval_eventFiltersArgs) => LexipopToken_Approval_eventFiltersDefinition);

export type MoneyTree_chainId = 8453;

export type MoneyTree_Deposit_eventArgs = {
  readonly signer: Address_t; 
  readonly token: Address_t; 
  readonly amount: bigint
};

export type MoneyTree_Deposit_block = Block_t;

export type MoneyTree_Deposit_transaction = Transaction_t;

export type MoneyTree_Deposit_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: MoneyTree_Deposit_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: MoneyTree_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: MoneyTree_Deposit_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: MoneyTree_Deposit_block
};

export type MoneyTree_Deposit_loaderArgs = Internal_genericLoaderArgs<MoneyTree_Deposit_event,loaderContext>;

export type MoneyTree_Deposit_loader<loaderReturn> = Internal_genericLoader<MoneyTree_Deposit_loaderArgs,loaderReturn>;

export type MoneyTree_Deposit_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<MoneyTree_Deposit_event,handlerContext,loaderReturn>;

export type MoneyTree_Deposit_handler<loaderReturn> = Internal_genericHandler<MoneyTree_Deposit_handlerArgs<loaderReturn>>;

export type MoneyTree_Deposit_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<MoneyTree_Deposit_event,contractRegistrations>>;

export type MoneyTree_Deposit_eventFilter = { readonly signer?: SingleOrMultiple_t<Address_t>; readonly token?: SingleOrMultiple_t<Address_t> };

export type MoneyTree_Deposit_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: MoneyTree_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type MoneyTree_Deposit_eventFiltersDefinition = 
    MoneyTree_Deposit_eventFilter
  | MoneyTree_Deposit_eventFilter[];

export type MoneyTree_Deposit_eventFilters = 
    MoneyTree_Deposit_eventFilter
  | MoneyTree_Deposit_eventFilter[]
  | ((_1:MoneyTree_Deposit_eventFiltersArgs) => MoneyTree_Deposit_eventFiltersDefinition);

export type MoneyTree_Withdraw_eventArgs = {
  readonly signer: Address_t; 
  readonly recipient: Address_t; 
  readonly token: Address_t; 
  readonly amount: bigint
};

export type MoneyTree_Withdraw_block = Block_t;

export type MoneyTree_Withdraw_transaction = Transaction_t;

export type MoneyTree_Withdraw_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: MoneyTree_Withdraw_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: MoneyTree_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: MoneyTree_Withdraw_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: MoneyTree_Withdraw_block
};

export type MoneyTree_Withdraw_loaderArgs = Internal_genericLoaderArgs<MoneyTree_Withdraw_event,loaderContext>;

export type MoneyTree_Withdraw_loader<loaderReturn> = Internal_genericLoader<MoneyTree_Withdraw_loaderArgs,loaderReturn>;

export type MoneyTree_Withdraw_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<MoneyTree_Withdraw_event,handlerContext,loaderReturn>;

export type MoneyTree_Withdraw_handler<loaderReturn> = Internal_genericHandler<MoneyTree_Withdraw_handlerArgs<loaderReturn>>;

export type MoneyTree_Withdraw_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<MoneyTree_Withdraw_event,contractRegistrations>>;

export type MoneyTree_Withdraw_eventFilter = {
  readonly signer?: SingleOrMultiple_t<Address_t>; 
  readonly recipient?: SingleOrMultiple_t<Address_t>; 
  readonly token?: SingleOrMultiple_t<Address_t>
};

export type MoneyTree_Withdraw_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: MoneyTree_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type MoneyTree_Withdraw_eventFiltersDefinition = 
    MoneyTree_Withdraw_eventFilter
  | MoneyTree_Withdraw_eventFilter[];

export type MoneyTree_Withdraw_eventFilters = 
    MoneyTree_Withdraw_eventFilter
  | MoneyTree_Withdraw_eventFilter[]
  | ((_1:MoneyTree_Withdraw_eventFiltersArgs) => MoneyTree_Withdraw_eventFiltersDefinition);

export type chainId = number;

export type chain = 8453;
