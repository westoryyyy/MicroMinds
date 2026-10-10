module ContractType = {
  @genType
  type t = 
    | @as("Escrow") Escrow

  let name = "CONTRACT_TYPE"
  let variants = [
    Escrow,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("Balance") Balance
    | @as("Call") Call
    | @as("Deposit") Deposit
    | @as("OperatorChange") OperatorChange
    | @as("Withdrawal") Withdrawal
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    Balance,
    Call,
    Deposit,
    OperatorChange,
    Withdrawal,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])
