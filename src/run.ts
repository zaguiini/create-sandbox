import { spawn, SpawnOptions } from 'node:child_process'

export const run = (
  command: string,
  arguments_: string[],
  options: SpawnOptions = {}
) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, arguments_, {
      stdio: 'ignore',
      ...options,
    })

    child.on('error', () => {
      reject()
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${arguments_.join(' ')}`,
        })
        return
      }
      resolve()
    })
  })
}
