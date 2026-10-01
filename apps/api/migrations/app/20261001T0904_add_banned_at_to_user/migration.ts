#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6b21fffc3327cacbe8722b3bf340f416f35c5873a49015bf6f664f94b644de30/contract';
import endContract from '../../snapshots/6b21fffc3327cacbe8722b3bf340f416f35c5873a49015bf6f664f94b644de30/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ded8b531875f394b8d2d4139a5d5989f5e13ea593522a00cbc84d8a8ca6d03d0/contract';
import startContract from '../../snapshots/ded8b531875f394b8d2d4139a5d5989f5e13ea593522a00cbc84d8a8ca6d03d0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('bannedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
