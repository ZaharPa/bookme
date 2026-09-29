#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/23ab91ae065dd0d367b71fd4c1e7b4d379b5f5b263953ee3e672cda91afba3b9/contract';
import startContract from '../../snapshots/23ab91ae065dd0d367b71fd4c1e7b4d379b5f5b263953ee3e672cda91afba3b9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a685da5e120fe6b16c5eaa5e0b41d9aaf67e0b528718ad90462cbc7a6bf32e64/contract';
import endContract from '../../snapshots/a685da5e120fe6b16c5eaa5e0b41d9aaf67e0b528718ad90462cbc7a6bf32e64/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'business',
        column: col('viewCount', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
