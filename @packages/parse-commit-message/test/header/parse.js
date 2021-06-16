import { parseHeader } from '../../src/header';

test('.parseHeader throw if not a string given', () => {
  expect(() => parseHeader(123)).toThrow(TypeError);
  expect(() => parseHeader(123)).toThrow(
    /expect `header` to be non empty string/,
  );
  expect(() => parseHeader('')).toThrow(
    /expect `header` to be non empty string/,
  );
});

test('.parseHeader throw when invalid conventional commits', () => {
  expect(() => parseHeader('fix bar qux')).toThrow(Error);
  expect(() => parseHeader('fix bar qux')).toThrow(
    /<type>\[optional scope]: <description>/,
  );
});

test('.parseHeader NOT throw when header is valid by conventional commits', () => {
  const one = parseHeader('fix: zzz qux');
  const two = parseHeader('fix(cli): aaaa qux');
  const res = parseHeader('fix(cli): qqqqq qux\n\nSome awesome body');

  expect(typeof one === 'object').toBe(true);
  expect(typeof two === 'object').toBe(true);
  expect(typeof res === 'object').toBe(true);
});

test('.parseHeader correctly header string without scope', () => {
  const result = parseHeader('fix: bar qux');

  expect(result).toMatchObject({
    type: 'fix',
    scope: null,
    subject: 'bar qux',
  });
});

test('.parseHeader header string with scope', () => {
  expect(parseHeader('fix(cli): bar qux')).toMatchObject({
    type: 'fix',
    scope: 'cli',
    subject: 'bar qux',
  });
});
