import { run } from './run'

export const hasYarn = async () =>
  run('yarn', ['--version'])
    .then(() => true)
    .catch(() => false)
