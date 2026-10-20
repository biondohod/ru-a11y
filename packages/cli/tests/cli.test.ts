import { runCli } from '../src/cli';
import { EXIT_CODE } from '../src/config/defaultConfig';
import { VERSION } from '../src/version';

function captureOutput() {
  const chunks: string[] = [];
  return {
    io: { stdout: { write: (chunk: string) => chunks.push(chunk) > 0 } },
    output: () => chunks.join(''),
  };
}

describe('runCli', () => {
  it('prints the package version', async () => {
    const { io, output } = captureOutput();

    await expect(runCli(['--version'], io)).resolves.toBe(EXIT_CODE.ok);
    expect(output()).toBe(`${VERSION}\n`);
  });

  it('prints help', async () => {
    const { io, output } = captureOutput();

    await expect(runCli(['--help'], io)).resolves.toBe(EXIT_CODE.ok);
    expect(output()).toContain('Использование:');
  });

  it('reads the version from package.json', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(VERSION).toBe(require('../package.json').version);
  });
});
