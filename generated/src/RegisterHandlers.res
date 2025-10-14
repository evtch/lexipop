@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

%%private(
  let makeGeneratedConfig = () => {
    let chains = [
      {
        let contracts = [
          {
            InternalConfig.name: "LexipopToken",
            abi: Types.LexipopToken.abi,
            addresses: [
              "0xf732f31f73e7dc21299f3ab42bd22e8a7c6b4b07"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.LexipopToken.Transfer.register() :> Internal.eventConfig),
              (Types.LexipopToken.Approval.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "MoneyTree",
            abi: Types.MoneyTree.abi,
            addresses: [
              "0xe636baaf2c390a591edbffaf748898eb3f6ff9a1"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.MoneyTree.Deposit.register() :> Internal.eventConfig),
              (Types.MoneyTree.Withdraw.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=8453)
        {
          InternalConfig.confirmedBlockThreshold: 200,
          startBlock: 0,
          id: 8453,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "LexipopToken",events: [Types.LexipopToken.Transfer.register(), Types.LexipopToken.Approval.register()],abi: Types.LexipopToken.abi}, {name: "MoneyTree",events: [Types.MoneyTree.Deposit.register(), Types.MoneyTree.Withdraw.register()],abi: Types.MoneyTree.abi}], ~hyperSync=Some("https://8453.hypersync.xyz"), ~allEventSignatures=[Types.LexipopToken.eventSignatures, Types.MoneyTree.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[], ~lowercaseAddresses=false)
        }
      },
    ]

    Config.make(
      ~shouldRollbackOnReorg=true,
      ~shouldSaveFullHistory=false,
      ~isUnorderedMultichainMode=false,
      ~chains,
      ~enableRawEvents=false,
      ~batchSize=?Env.batchSize,
      ~preloadHandlers=false,
      ~lowercaseAddresses=false,
      ~shouldUseHypersyncClientDecoder=true,
    )
  }

  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  let configWithoutRegistrations = makeGeneratedConfig()
  EventRegister.startRegistration(
    ~ecosystem=configWithoutRegistrations.ecosystem,
    ~multichain=configWithoutRegistrations.multichain,
    ~preloadHandlers=configWithoutRegistrations.preloadHandlers,
  )

  registerContractHandlers(
    ~contractName="LexipopToken",
    ~handlerPathRelativeToRoot="src/TokenHandlers.ts",
    ~handlerPathRelativeToConfig="src/TokenHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="MoneyTree",
    ~handlerPathRelativeToRoot="src/MoneyTreeHandlers.ts",
    ~handlerPathRelativeToConfig="src/MoneyTreeHandlers.ts",
  )

  let generatedConfig = {
    // Need to recreate initial config one more time,
    // since configWithoutRegistrations called register for event
    // before they were ready
    ...makeGeneratedConfig(),
    registrations: Some(EventRegister.finishRegistration()),
  }
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}

let getConfigWithoutRegistrations = makeGeneratedConfig
