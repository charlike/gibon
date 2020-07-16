/* eslint-disable no-param-reassign, unicorn/consistent-function-scoping */

export default () => (node, result) => {
  result.destructuredArgs = result.destructuredArgs || [];

  node.params.forEach((param) => {
    if (
      param.type === 'ObjectPattern' &&
      param.properties &&
      param.properties.length > 0
    ) {
      param.properties.forEach((prop) => {
        const { name } = prop.value;
        result.destructuredArgs.push(name);
      });
    }
  });

  return result;
};
