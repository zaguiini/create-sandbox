#!/usr/bin/env node --experimental-specifier-resolution=node
import { Command } from 'commander'
import { createSandbox } from './createSandbox'

const program = new Command()

program
  .argument('<repository>', 'the repository URL')
  .argument('[directory]', 'The name of a new directory to clone into.')
  .action(createSandbox)

program.parse()
