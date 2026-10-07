import { ValueTransformer } from 'typeorm';

// pg returns bigint as string. Minor units stay far below Number.MAX_SAFE_INTEGER.
export const bigintTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value == null ? value : Number(value)),
};
