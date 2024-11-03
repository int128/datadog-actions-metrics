import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: `node_modules/@octokit/graphql-schema/schema.graphql`,
  documents: ['src/queries/**/*.ts'],
  generates: {
    'src/generated/graphql-types.ts': {
      plugins: ['typescript'],
    },
    'src/generated/graphql.ts': {
      preset: 'import-types',
      plugins: ['typescript-operations'],
      presetConfig: {
        typesPath: './graphql-types.js',
      },
    },
  },
  config: {
    // https://docs.github.com/en/graphql/reference/scalars
    scalars: {
      DateTime: 'string',
    },
  },
}

export default config
