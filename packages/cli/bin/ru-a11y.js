#!/usr/bin/env node
'use strict';

const { runCli, EXIT_CODE } = require('../dist/index.js');

runCli(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка CLI.';
    process.stderr.write(`Ошибка: ${message}\n`);
    process.exitCode = EXIT_CODE.auditFailed;
  });
