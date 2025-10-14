/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {LexipopToken_Approval_event as Types_LexipopToken_Approval_event} from './Types.gen';

import type {LexipopToken_Transfer_event as Types_LexipopToken_Transfer_event} from './Types.gen';

import type {MoneyTree_Deposit_event as Types_MoneyTree_Deposit_event} from './Types.gen';

import type {MoneyTree_Withdraw_event as Types_MoneyTree_Withdraw_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = {
  readonly from?: (undefined | Address_t); 
  readonly hash?: string; 
  readonly input?: string; 
  readonly to?: (undefined | Address_t); 
  readonly value?: bigint
};

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type LexipopToken_Transfer_createMockArgs = {
  readonly from?: Address_t; 
  readonly to?: Address_t; 
  readonly value?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type LexipopToken_Approval_createMockArgs = {
  readonly owner?: Address_t; 
  readonly spender?: Address_t; 
  readonly value?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type MoneyTree_Deposit_createMockArgs = {
  readonly signer?: Address_t; 
  readonly token?: Address_t; 
  readonly amount?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type MoneyTree_Withdraw_createMockArgs = {
  readonly signer?: Address_t; 
  readonly recipient?: Address_t; 
  readonly token?: Address_t; 
  readonly amount?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const LexipopToken_Transfer_processEvent: EventFunctions_eventProcessor<Types_LexipopToken_Transfer_event> = TestHelpersJS.LexipopToken.Transfer.processEvent as any;

export const LexipopToken_Transfer_createMockEvent: (args:LexipopToken_Transfer_createMockArgs) => Types_LexipopToken_Transfer_event = TestHelpersJS.LexipopToken.Transfer.createMockEvent as any;

export const LexipopToken_Approval_processEvent: EventFunctions_eventProcessor<Types_LexipopToken_Approval_event> = TestHelpersJS.LexipopToken.Approval.processEvent as any;

export const LexipopToken_Approval_createMockEvent: (args:LexipopToken_Approval_createMockArgs) => Types_LexipopToken_Approval_event = TestHelpersJS.LexipopToken.Approval.createMockEvent as any;

export const MoneyTree_Deposit_processEvent: EventFunctions_eventProcessor<Types_MoneyTree_Deposit_event> = TestHelpersJS.MoneyTree.Deposit.processEvent as any;

export const MoneyTree_Deposit_createMockEvent: (args:MoneyTree_Deposit_createMockArgs) => Types_MoneyTree_Deposit_event = TestHelpersJS.MoneyTree.Deposit.createMockEvent as any;

export const MoneyTree_Withdraw_processEvent: EventFunctions_eventProcessor<Types_MoneyTree_Withdraw_event> = TestHelpersJS.MoneyTree.Withdraw.processEvent as any;

export const MoneyTree_Withdraw_createMockEvent: (args:MoneyTree_Withdraw_createMockArgs) => Types_MoneyTree_Withdraw_event = TestHelpersJS.MoneyTree.Withdraw.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const LexipopToken: { Transfer: { processEvent: EventFunctions_eventProcessor<Types_LexipopToken_Transfer_event>; createMockEvent: (args:LexipopToken_Transfer_createMockArgs) => Types_LexipopToken_Transfer_event }; Approval: { processEvent: EventFunctions_eventProcessor<Types_LexipopToken_Approval_event>; createMockEvent: (args:LexipopToken_Approval_createMockArgs) => Types_LexipopToken_Approval_event } } = TestHelpersJS.LexipopToken as any;

export const MoneyTree: { Deposit: { processEvent: EventFunctions_eventProcessor<Types_MoneyTree_Deposit_event>; createMockEvent: (args:MoneyTree_Deposit_createMockArgs) => Types_MoneyTree_Deposit_event }; Withdraw: { processEvent: EventFunctions_eventProcessor<Types_MoneyTree_Withdraw_event>; createMockEvent: (args:MoneyTree_Withdraw_createMockArgs) => Types_MoneyTree_Withdraw_event } } = TestHelpersJS.MoneyTree as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;
