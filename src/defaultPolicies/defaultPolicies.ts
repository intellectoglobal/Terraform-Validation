const defaultPolicies = {
  aws: {
      aws_s3_bucket: { min: 2, max: 3 },
      aws_instance: { min: 1, max: 5 },
      // aws_lambda_function: { min: 1, max: 2 },
  },
  azure: {
      azurerm_storage_account: { min: 1, max: 3 },
      azurerm_virtual_machine: { min: 1, max: 5 },
      azurerm_function_app: { min: 1, max: 2 },
      azurerm_network_interface: { min: 1, max: 10 },
      azurerm_app_service_plan: { min: 1, max: 2 },
      azurerm_sql_server: { min: 1, max: 1 },
      azurerm_key_vault: { min: 1, max: 2 },
      azurerm_cosmosdb_account: { min: 1, max: 2 }
  },
};