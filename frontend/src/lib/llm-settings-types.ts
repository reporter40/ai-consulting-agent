export type LlmSettingsPublic = {
  llm_configured: boolean;
  llm_backend: string;
  anthropic_key_set: boolean;
  abacus_key_set: boolean;
  abacus_base_url: string;
  llm_model: string;
  settings_write_enabled: boolean;
};
