#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract';
import startContract from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c6f8e07f92759f62cc41705914050fc70bf093acc4872e0af04a71625e121646/contract';
import endContract from '../../snapshots/c6f8e07f92759f62cc41705914050fc70bf093acc4872e0af04a71625e121646/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'post' }),
      this.dropColumn({ schema: 'public', table: 'user', column: 'name' }),
      this.dropColumn({ schema: 'public', table: 'user', column: 'username' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
