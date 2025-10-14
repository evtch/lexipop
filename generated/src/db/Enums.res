module ContractType = {
  @genType
  type t = 
    | @as("LexipopToken") LexipopToken
    | @as("MoneyTree") MoneyTree

  let name = "CONTRACT_TYPE"
  let variants = [
    LexipopToken,
    MoneyTree,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("Claim") Claim
    | @as("Transfer") Transfer
    | @as("User") User
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    Claim,
    Transfer,
    User,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])
