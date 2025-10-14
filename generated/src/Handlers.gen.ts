/* TypeScript file generated from Handlers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const HandlersJS = require('./Handlers.res.js');

import type {HandlerTypes_eventConfig as Types_HandlerTypes_eventConfig} from './Types.gen';

import type {LexipopToken_Approval_eventFilters as Types_LexipopToken_Approval_eventFilters} from './Types.gen';

import type {LexipopToken_Approval_event as Types_LexipopToken_Approval_event} from './Types.gen';

import type {LexipopToken_Transfer_eventFilters as Types_LexipopToken_Transfer_eventFilters} from './Types.gen';

import type {LexipopToken_Transfer_event as Types_LexipopToken_Transfer_event} from './Types.gen';

import type {MoneyTree_Deposit_eventFilters as Types_MoneyTree_Deposit_eventFilters} from './Types.gen';

import type {MoneyTree_Deposit_event as Types_MoneyTree_Deposit_event} from './Types.gen';

import type {MoneyTree_Withdraw_eventFilters as Types_MoneyTree_Withdraw_eventFilters} from './Types.gen';

import type {MoneyTree_Withdraw_event as Types_MoneyTree_Withdraw_event} from './Types.gen';

import type {chain as Types_chain} from './Types.gen';

import type {contractRegistrations as Types_contractRegistrations} from './Types.gen';

import type {fnWithEventConfig as Types_fnWithEventConfig} from './Types.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {handlerContext as Types_handlerContext} from './Types.gen';

import type {loaderContext as Types_loaderContext} from './Types.gen';

import type {onBlockArgs as Envio_onBlockArgs} from 'envio/src/Envio.gen';

import type {onBlockOptions as Envio_onBlockOptions} from 'envio/src/Envio.gen';

export const LexipopToken_Transfer_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_LexipopToken_Transfer_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Transfer_eventFilters>> = HandlersJS.LexipopToken.Transfer.contractRegister as any;

export const LexipopToken_Transfer_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Transfer_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Transfer_eventFilters>> = HandlersJS.LexipopToken.Transfer.handler as any;

export const LexipopToken_Transfer_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_LexipopToken_Transfer_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Transfer_event,Types_handlerContext,loaderReturn>>,Types_LexipopToken_Transfer_eventFilters>) => void = HandlersJS.LexipopToken.Transfer.handlerWithLoader as any;

export const LexipopToken_Approval_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_LexipopToken_Approval_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Approval_eventFilters>> = HandlersJS.LexipopToken.Approval.contractRegister as any;

export const LexipopToken_Approval_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Approval_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Approval_eventFilters>> = HandlersJS.LexipopToken.Approval.handler as any;

export const LexipopToken_Approval_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_LexipopToken_Approval_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Approval_event,Types_handlerContext,loaderReturn>>,Types_LexipopToken_Approval_eventFilters>) => void = HandlersJS.LexipopToken.Approval.handlerWithLoader as any;

export const MoneyTree_Deposit_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MoneyTree_Deposit_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Deposit_eventFilters>> = HandlersJS.MoneyTree.Deposit.contractRegister as any;

export const MoneyTree_Deposit_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Deposit_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Deposit_eventFilters>> = HandlersJS.MoneyTree.Deposit.handler as any;

export const MoneyTree_Deposit_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MoneyTree_Deposit_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Deposit_event,Types_handlerContext,loaderReturn>>,Types_MoneyTree_Deposit_eventFilters>) => void = HandlersJS.MoneyTree.Deposit.handlerWithLoader as any;

export const MoneyTree_Withdraw_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MoneyTree_Withdraw_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Withdraw_eventFilters>> = HandlersJS.MoneyTree.Withdraw.contractRegister as any;

export const MoneyTree_Withdraw_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Withdraw_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Withdraw_eventFilters>> = HandlersJS.MoneyTree.Withdraw.handler as any;

export const MoneyTree_Withdraw_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MoneyTree_Withdraw_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Withdraw_event,Types_handlerContext,loaderReturn>>,Types_MoneyTree_Withdraw_eventFilters>) => void = HandlersJS.MoneyTree.Withdraw.handlerWithLoader as any;

/** Register a Block Handler. It'll be called for every block by default. */
export const onBlock: (_1:Envio_onBlockOptions<Types_chain>, _2:((_1:Envio_onBlockArgs<Types_handlerContext>) => Promise<void>)) => void = HandlersJS.onBlock as any;

export const LexipopToken: { Transfer: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_LexipopToken_Transfer_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Transfer_event,Types_handlerContext,loaderReturn>>,Types_LexipopToken_Transfer_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Transfer_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Transfer_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_LexipopToken_Transfer_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Transfer_eventFilters>>
}; Approval: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_LexipopToken_Approval_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Approval_event,Types_handlerContext,loaderReturn>>,Types_LexipopToken_Approval_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_LexipopToken_Approval_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Approval_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_LexipopToken_Approval_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_LexipopToken_Approval_eventFilters>>
} } = HandlersJS.LexipopToken as any;

export const MoneyTree: { Deposit: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MoneyTree_Deposit_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Deposit_event,Types_handlerContext,loaderReturn>>,Types_MoneyTree_Deposit_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Deposit_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Deposit_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MoneyTree_Deposit_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Deposit_eventFilters>>
}; Withdraw: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MoneyTree_Withdraw_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Withdraw_event,Types_handlerContext,loaderReturn>>,Types_MoneyTree_Withdraw_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MoneyTree_Withdraw_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Withdraw_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MoneyTree_Withdraw_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MoneyTree_Withdraw_eventFilters>>
} } = HandlersJS.MoneyTree as any;
