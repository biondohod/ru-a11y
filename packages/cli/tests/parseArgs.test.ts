import { parseCliArgs } from '../src/args/parseArgs';

describe('parseCliArgs', () => {
  it('parses URLs and basic flags', async () => {
    const options = await parseCliArgs([
      'https://example.com',
      '--format',
      'json',
      '--standard',
      'gost-aaa',
      '--concurrency',
      '4',
      '--include',
      'contrast,управляемость',
    ]);

    expect(options.urls).toEqual(['https://example.com']);
    expect(options.format).toBe('json');
    expect(options.standard).toBe('gost-aaa');
    expect(options.concurrency).toBe(4);
    expect(options.include).toEqual(['contrast', 'управляемость']);
  });

  it('derives WCAG tags from the selected standard', async () => {
    const options = await parseCliArgs(['https://example.com', '--standard', 'gost-a']);

    expect(options.wcagTags).toEqual(['wcag2a', 'wcag21a']);
  });

  it('rejects a non-http URL', async () => {
    await expect(parseCliArgs(['not-a-url'])).rejects.toThrow('Некорректный URL');
  });

  it('allows running without URLs when --with-eslint is set', async () => {
    const options = await parseCliArgs(['--with-eslint', '--project-root', '.']);

    expect(options.withEslint).toBe(true);
    expect(options.urls).toEqual([]);
    expect(options.projectRoot).toBe('.');
  });

  it('keeps brace globs intact in --eslint-targets', async () => {
    const options = await parseCliArgs([
      'https://example.com',
      '--with-eslint',
      '--eslint-targets',
      'src/**/*.{js,jsx},tests/**/*.js',
    ]);

    expect(options.eslintTargets).toEqual(['src/**/*.{js,jsx}', 'tests/**/*.js']);
  });

  it('accepts the junit format', async () => {
    const options = await parseCliArgs(['https://example.com', '--format', 'junit']);

    expect(options.format).toBe('junit');
  });
});

describe('parseCliArgs edge cases', () => {
  it('rejects unknown flags', async () => {
    await expect(parseCliArgs(['https://example.com', '--nope'])).rejects.toThrow(
      'Неизвестный флаг: --nope',
    );
  });

  it('does not swallow the next flag as a missing value', async () => {
    await expect(
      parseCliArgs(['https://example.com', '--output', '--format', 'json']),
    ).rejects.toThrow('Для флага --output нужно указать путь к директории.');
  });

  it('rejects values that are not plain non-negative integers', async () => {
    await expect(parseCliArgs(['https://example.com', '--timeout', '5abc'])).rejects.toThrow(
      'Некорректное значение для --timeout',
    );
    await expect(parseCliArgs(['https://example.com', '--max-issues', '-1'])).rejects.toThrow(
      'Некорректное значение для --max-issues',
    );
  });

  it('validates enum flags', async () => {
    await expect(parseCliArgs(['https://example.com', '--standard', 'wcag'])).rejects.toThrow(
      'Флаг --standard принимает только: gost-a, gost-aa, gost-aaa.',
    );
  });

  it('deduplicates URLs and rewrites the default origin from RU_A11Y_BASE_URL', async () => {
    const options = await parseCliArgs(
      ['http://localhost:3000/a', 'http://localhost:3000/a', 'https://example.com'],
      { env: { RU_A11Y_BASE_URL: 'https://staging.example.com' } },
    );

    expect(options.urls).toEqual(['https://staging.example.com/a', 'https://example.com']);
  });

  it('keeps --help usable without URLs', async () => {
    const options = await parseCliArgs(['--help']);

    expect(options.help).toBe(true);
  });
});
