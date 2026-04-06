const { coverage } = require('../../../../lib/index.js');

/** @type {import('poku').PokuConfig} */
module.exports = {
  include: ['test/'],
  plugins: [
    coverage({
      config: false,
      reports: ['console-details'],
      logging: 'error',
      filter: { '**/node_modules/**': false, '**/src/**': true },
    }),
  ],
};
