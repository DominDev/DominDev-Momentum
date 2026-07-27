const { spawn, spawnSync } = require('node:child_process');
const { createServer } = require('node:net');
const { join } = require('node:path');

const ROOT = join(__dirname, '..');
const TEST_FILES = [
  'tests/service-navigation.e2e.cjs',
  'tests/chatbot.e2e.cjs',
  'tests/accessibility.e2e.cjs',
  'tests/performance.e2e.cjs',
];
const requestedPort = process.env.TEST_PORT ? Number(process.env.TEST_PORT) : null;
const externalUrl = process.env.APP_URL;
let server = null;

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(requestedPort || 0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : requestedPort;
      probe.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
    windowsHide: true,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status || 1;
  return result.status === 0;
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 30_000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const [pageResponse, scriptResponse] = await Promise.all([
        fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(2_000) }),
        fetch(`${baseUrl}/js/main.js?v=8`, { signal: AbortSignal.timeout(2_000) }),
      ]);
      if (pageResponse.ok && scriptResponse.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Test server did not become ready: ${lastError?.message || baseUrl}`);
}

function stopServer() {
  if (!server || server.killed) return;

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill('SIGTERM');
    }
  }

  server = null;
}

async function main() {
  if (!externalUrl && !run(process.execPath, ['_scripts/build-pages.js'])) return;

  for (const testFile of TEST_FILES) {
    const port = externalUrl ? null : await findAvailablePort();
    const baseUrl = externalUrl || `http://127.0.0.1:${port}`;

    try {
      if (!externalUrl) {
        const wrangler = join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
        server = spawn(
          process.execPath,
          [
            wrangler,
            'pages',
            'dev',
            'dist',
            '--port',
            String(port),
            '--ip',
            '127.0.0.1',
            '--log-level',
            'warn',
            '--show-interactive-dev-session',
            'false',
          ],
          {
            cwd: ROOT,
            detached: process.platform !== 'win32',
            stdio: 'inherit',
            windowsHide: true,
          },
        );
        await waitForServer(baseUrl);
      }

      console.log(`\n=== ${testFile} ===`);
      const ok = run(process.execPath, [testFile], {
        ...process.env,
        APP_URL: baseUrl,
      });
      if (!ok) return;
    } finally {
      if (!externalUrl) stopServer();
    }
  }
}

process.once('SIGINT', () => {
  stopServer();
  process.exit(130);
});
process.once('SIGTERM', () => {
  stopServer();
  process.exit(143);
});

main()
  .catch((error) => {
    console.error(error.stack || error);
    process.exitCode = 1;
  })
  .finally(stopServer);
