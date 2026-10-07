#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6b21fffc3327cacbe8722b3bf340f416f35c5873a49015bf6f664f94b644de30/contract';
import startContract from '../../snapshots/6b21fffc3327cacbe8722b3bf340f416f35c5873a49015bf6f664f94b644de30/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d9c3bd2cb1648c5ea9dc88e9a571c2bb32c933374fe7c895ac35aebd7730ede8/contract';
import endContract from '../../snapshots/d9c3bd2cb1648c5ea9dc88e9a571c2bb32c933374fe7c895ac35aebd7730ede8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('emailVerifiedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
