export type ConfigurationType =
    | 'number'
    | 'boolean'
    | 'string'
    | 'encryption_key'
    | 'email'

export interface Configuration {
    name: string,
    type: ConfigurationType
}

export interface ConfigurationValidator{
    type: ConfigurationType,
    pattern: RegExp
}