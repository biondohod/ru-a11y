#!/usr/bin/env node

'use strict';

const { runCli } = require('../dist/cli.js');

runCli(process.argv.slice(2))
  .then((code) => {
    process.exit(code);
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : 'Internal CLI error.';
    process.stderr.write(`Error: ${message}\n`);
    process.exit(2);
  });
