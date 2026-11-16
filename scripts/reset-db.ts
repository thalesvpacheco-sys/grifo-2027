/**
 * Recria o banco a partir do conteúdo inicial (seed). ATENÇÃO: apaga conteúdo editado, leads e usuários.
 * Uso: CONFIRM=sim npm run seed:reset
 */
import path from 'node:path';
import fs from 'node:fs';

if (process.env.CONFIRM !== 'sim') {
  console.error('Operação destrutiva. Rode com CONFIRM=sim para confirmar.');
  process.exit(1);
}
const dir = path.resolve(process.env.DATA_DIR || './data');
for (const f of ['grifo.db', 'grifo.db-wal', 'grifo.db-shm']) fs.rmSync(path.join(dir, f), { force: true });
console.log('Banco removido. Ele será recriado com o conteúdo inicial na próxima inicialização do site.');
