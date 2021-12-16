#!/usr/bin/env node --experimental-specifier-resolution=node
import { Command } from 'commander'
import { createSandbox } from './createSandbox'

const program = new Command()

program
  .argument(
    '<source>',
    'The source location. That might be a git repository URL (repository will be cloned) or a folder'
  )
  .argument('[directory]', 'The name of a new directory to clone into.')
  .option('-b, --build-script <script>', 'The build script name', 'build')
  .action(createSandbox)

program.parse()
