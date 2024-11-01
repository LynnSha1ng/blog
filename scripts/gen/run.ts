import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const dev = ['-d', '--dev'].some(opt => args.includes(opt));

let cmd = 'node --env-file=.env';

if (dev) {
  cmd += ' --env-file=.env.development';
}

cmd += ' scripts/dist';

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  console.error(err);
  process.exit(1);
}
