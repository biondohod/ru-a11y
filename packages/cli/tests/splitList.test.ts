import { splitList } from '../src/args/splitList';

describe('splitList', () => {
  it('returns an empty list for empty input', () => {
    expect(splitList(undefined)).toEqual([]);
    expect(splitList('')).toEqual([]);
  });

  it('trims items and drops empty ones', () => {
    expect(splitList(' a, ,b ,')).toEqual(['a', 'b']);
  });

  it('ignores commas inside braces', () => {
    expect(splitList('src/**/*.{js,jsx},lib/{a,{b,c}}/*.ts')).toEqual([
      'src/**/*.{js,jsx}',
      'lib/{a,{b,c}}/*.ts',
    ]);
  });
});
