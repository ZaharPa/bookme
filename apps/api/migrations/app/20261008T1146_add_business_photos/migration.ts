#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4f22c4b16192d6c8ff394740cad5cc7dc1c45cbfd780988615c14037312e5bb3/contract';
import endContract from '../../snapshots/4f22c4b16192d6c8ff394740cad5cc7dc1c45cbfd780988615c14037312e5bb3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/69f9438b0f51471216385c38e0ffaaa3933bae254b82a78695906ff6606f6d52/contract';
import startContract from '../../snapshots/69f9438b0f51471216385c38e0ffaaa3933bae254b82a78695906ff6606f6d52/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'businessPhoto',
        columns: [
          col('businessId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'businessPhoto',
        constraint: 'businessPhoto_key_key',
        columns: ['key'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'businessPhoto',
        index: 'businessPhoto_businessId_idx_ae0ed511',
        columns: ['businessId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'businessPhoto',
        foreignKey: {
          name: 'businessPhoto_businessId_fkey',
          columns: ['businessId'],
          references: { schema: 'public', table: 'business', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
