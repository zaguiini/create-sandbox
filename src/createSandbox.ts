import path from 'node:path'
import git from 'simple-git'
import ora from 'ora'
import fs from 'fs-extra'
import type { PackageJson } from 'type-fest'

import { hasYarn } from './hasYarn'

const fetchSourceCodeInformation = async (sourceDirectory: string) => {
  const isThereYarnLock = await fs.pathExists(
    path.resolve(sourceDirectory, 'yarn.lock')
  )

  const packageJson: PackageJson = await fs.readJson(
    path.resolve(sourceDirectory, 'package.json')
  )

  const reactEntry =
    packageJson.peerDependencies?.react ??
    packageJson.dependencies?.react ??
    packageJson.devDependencies?.react

  return {
    packageManager: isThereYarnLock ? 'yarn' : 'npm',
    reactVersion: reactEntry ?? undefined,
  }
}

const getFallbackDirectoryName = (repositoryUrl: string) => {
  return path.parse(repositoryUrl).name
}

export const createSandbox = async (
  repositoryUrl: string,
  directoryName = getFallbackDirectoryName(repositoryUrl)
) => {
  const spinner = ora()
  const sourceDirectory = path.resolve(process.cwd(), directoryName)

  spinner.start('Cloning repository...')
  await git().clone(repositoryUrl, sourceDirectory)
  spinner.succeed('Cloned successfully')

  const { packageManager, reactVersion } = await fetchSourceCodeInformation(
    sourceDirectory
  )

  if (!reactVersion) {
    spinner.fail('The cloned repository is not a React project')
    process.exit(1)
  }

  if (packageManager === 'yarn' && !(await hasYarn())) {
    spinner.fail(
      'The cloned project uses Yarn, but I could not find it in your system'
    )
    process.exit(1)
  }
}
