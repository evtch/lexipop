/***** TAKE NOTE ******
This is a hack to get genType to work!

In order for genType to produce recursive types, it needs to be at the 
root module of a file. If it's defined in a nested module it does not 
work. So all the MockDb types and internal functions are defined in TestHelpers_MockDb
and only public functions are recreated and exported from this module.

the following module:
```rescript
module MyModule = {
  @genType
  type rec a = {fieldB: b}
  @genType and b = {fieldA: a}
}
```

produces the following in ts:
```ts
// tslint:disable-next-line:interface-over-type-literal
export type MyModule_a = { readonly fieldB: b };

// tslint:disable-next-line:interface-over-type-literal
export type MyModule_b = { readonly fieldA: MyModule_a };
```

fieldB references type b which doesn't exist because it's defined
as MyModule_b
*/

module MockDb = {
  @genType
  let createMockDb = TestHelpers_MockDb.createMockDb
}

@genType
module Addresses = {
  include TestHelpers_MockAddresses
}

module EventFunctions = {
  //Note these are made into a record to make operate in the same way
  //for Res, JS and TS.

  /**
  The arguements that get passed to a "processEvent" helper function
  */
  @genType
  type eventProcessorArgs<'event> = {
    event: 'event,
    mockDb: TestHelpers_MockDb.t,
    @deprecated("Set the chainId for the event instead")
    chainId?: int,
  }

  @genType
  type eventProcessor<'event> = eventProcessorArgs<'event> => promise<TestHelpers_MockDb.t>

  /**
  A function composer to help create individual processEvent functions
  */
  let makeEventProcessor = (~register) => args => {
    let {event, mockDb, ?chainId} =
      args->(Utils.magic: eventProcessorArgs<'event> => eventProcessorArgs<Internal.event>)

    // Have the line here, just in case the function is called with
    // a manually created event. We don't want to break the existing tests here.
    let _ =
      TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    TestHelpers_MockDb.makeProcessEvents(mockDb, ~chainId=?chainId)([event->(Utils.magic: Internal.event => Types.eventLog<unknown>)])
  }

  module MockBlock = {
    @genType
    type t = {
      hash?: string,
      number?: int,
      timestamp?: int,
    }

    let toBlock = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      number: _mock.number->Belt.Option.getWithDefault(0),
      timestamp: _mock.timestamp->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedBlock.t => Internal.eventBlock)
  }

  module MockTransaction = {
    @genType
    type t = {
      from?: option<Address.t>,
      hash?: string,
      input?: string,
      to?: option<Address.t>,
      value?: bigint,
    }

    let toTransaction = (_mock: t) => {
      from: _mock.from->Belt.Option.getWithDefault(None),
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      input: _mock.input->Belt.Option.getWithDefault("foo"),
      to: _mock.to->Belt.Option.getWithDefault(None),
      value: _mock.value->Belt.Option.getWithDefault(0n),
    }->(Utils.magic: Types.AggregatedTransaction.t => Internal.eventTransaction)
  }

  @genType
  type mockEventData = {
    chainId?: int,
    srcAddress?: Address.t,
    logIndex?: int,
    block?: MockBlock.t,
    transaction?: MockTransaction.t,
  }

  /**
  Applies optional paramters with defaults for all common eventLog field
  */
  let makeEventMocker = (
    ~params: Internal.eventParams,
    ~mockEventData: option<mockEventData>,
    ~register: unit => Internal.eventConfig,
  ): Internal.event => {
    let {?block, ?transaction, ?srcAddress, ?chainId, ?logIndex} =
      mockEventData->Belt.Option.getWithDefault({})
    let block = block->Belt.Option.getWithDefault({})->MockBlock.toBlock
    let transaction = transaction->Belt.Option.getWithDefault({})->MockTransaction.toTransaction
    let config = RegisterHandlers.getConfig()
    let event: Internal.event = {
      params,
      transaction,
      chainId: switch chainId {
      | Some(chainId) => chainId
      | None =>
        switch config.defaultChain {
        | Some(chainConfig) => chainConfig.id
        | None =>
          Js.Exn.raiseError(
            "No default chain Id found, please add at least 1 chain to your config.yaml",
          )
        }
      },
      block,
      srcAddress: srcAddress->Belt.Option.getWithDefault(Addresses.defaultAddress),
      logIndex: logIndex->Belt.Option.getWithDefault(0),
    }
    // Since currently it's not possible to figure out the event config from the event
    // we store a reference to the register function by event in a weak map
    let _ = TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    event
  }
}


module LexipopToken = {
  module Transfer = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.LexipopToken.Transfer.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.LexipopToken.Transfer.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("from")
      from?: Address.t,
      @as("to")
      to?: Address.t,
      @as("value")
      value?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?from,
        ?to,
        ?value,
        ?mockEventData,
      } = args

      let params = 
      {
       from: from->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       to: to->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       value: value->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.LexipopToken.Transfer.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.LexipopToken.Transfer.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.LexipopToken.Transfer.event)
    }
  }

  module Approval = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.LexipopToken.Approval.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.LexipopToken.Approval.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("owner")
      owner?: Address.t,
      @as("spender")
      spender?: Address.t,
      @as("value")
      value?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?owner,
        ?spender,
        ?value,
        ?mockEventData,
      } = args

      let params = 
      {
       owner: owner->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       spender: spender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       value: value->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.LexipopToken.Approval.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.LexipopToken.Approval.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.LexipopToken.Approval.event)
    }
  }

}


module MoneyTree = {
  module Deposit = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.MoneyTree.Deposit.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.MoneyTree.Deposit.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("signer")
      signer?: Address.t,
      @as("token")
      token?: Address.t,
      @as("amount")
      amount?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?signer,
        ?token,
        ?amount,
        ?mockEventData,
      } = args

      let params = 
      {
       signer: signer->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       token: token->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount: amount->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.MoneyTree.Deposit.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.MoneyTree.Deposit.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.MoneyTree.Deposit.event)
    }
  }

  module Withdraw = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.MoneyTree.Withdraw.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.MoneyTree.Withdraw.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("signer")
      signer?: Address.t,
      @as("recipient")
      recipient?: Address.t,
      @as("token")
      token?: Address.t,
      @as("amount")
      amount?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?signer,
        ?recipient,
        ?token,
        ?amount,
        ?mockEventData,
      } = args

      let params = 
      {
       signer: signer->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       recipient: recipient->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       token: token->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount: amount->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.MoneyTree.Withdraw.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.MoneyTree.Withdraw.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.MoneyTree.Withdraw.event)
    }
  }

}

