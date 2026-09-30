#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a685da5e120fe6b16c5eaa5e0b41d9aaf67e0b528718ad90462cbc7a6bf32e64/contract';
import startContract from '../../snapshots/a685da5e120fe6b16c5eaa5e0b41d9aaf67e0b528718ad90462cbc7a6bf32e64/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ded8b531875f394b8d2d4139a5d5989f5e13ea593522a00cbc84d8a8ca6d03d0/contract';
import endContract from '../../snapshots/ded8b531875f394b8d2d4139a5d5989f5e13ea593522a00cbc84d8a8ca6d03d0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'location',
        column: col('deletedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'resource',
        column: col('deletedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('deletedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
