import path from 'node:path'
import git from 'simple-git'
import ora from 'ora'

const getFallbackDirectoryName = (repositoryUrl: string) => {
  return path.parse(repositoryUrl).name
}

const createSpinner = () => {
  const spinner = ora()

  return {
    start: (text: string) => {
      spinner.text = text
      spinner.start()
    },
    succeed: () => spinner.succeed(),
    stop: () => spinner.stop(),
  }
}

export const createSandbox = async (
  repositoryUrl: string,
  directoryName = getFallbackDirectoryName(repositoryUrl)
) => {
  const spinner = createSpinner()
  const sourceDirectory = path.resolve(process.cwd(), directoryName)

  spinner.start('Cloning repository...')
  await git().clone(repositoryUrl, sourceDirectory)
  spinner.stop()
}
