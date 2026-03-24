import { parseCliArgs } from '../src/cli';

describe('parseCliArgs', () => {
  it('должен разбирать URL и базовые флаги', async () => {
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

  it('должен использовать WCAG-теги по умолчанию для выбранного стандарта', async () => {
    const options = await parseCliArgs(['https://example.com', '--standard', 'gost-a']);

    expect(options.wcagTags).toEqual(['wcag2a', 'wcag21a']);
  });

  it('должен выбрасывать ошибку при некорректном URL', async () => {
    await expect(parseCliArgs(['not-a-url'])).rejects.toThrow('Некорректный URL');
  });
});

