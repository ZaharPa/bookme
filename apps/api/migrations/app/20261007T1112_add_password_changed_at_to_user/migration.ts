#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/69f9438b0f51471216385c38e0ffaaa3933bae254b82a78695906ff6606f6d52/contract';
import endContract from '../../snapshots/69f9438b0f51471216385c38e0ffaaa3933bae254b82a78695906ff6606f6d52/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d9c3bd2cb1648c5ea9dc88e9a571c2bb32c933374fe7c895ac35aebd7730ede8/contract';
import startContract from '../../snapshots/d9c3bd2cb1648c5ea9dc88e9a571c2bb32c933374fe7c895ac35aebd7730ede8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('passwordChangetAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
