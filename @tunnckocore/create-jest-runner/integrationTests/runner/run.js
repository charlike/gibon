const fs = require('fs');
const { pass, fail, skip } = require('../../');

module.exports = ({ testPath }) => {
  const start = +new Date();
  const contents = fs.readFileSync(testPath, 'utf8');
  const end = +new Date();

  if (contents.includes('⚔️🏃')) {
    return pass({ start, end, test: { path: testPath } });
  }
  if (contents.includes('🙈')) {
    return skip({ start, end, test: { path: testPath } });
  }
  const errorMessage = 'Company policies require ⚔️ 🏃 in every file';
  return fail({
    start,
    end,
    test: { path: testPath, errorMessage, title: 'Check for ⚔️ 🏃' },
  });
};
