import path from 'node:path'
import git from 'simple-git'
import ora from 'ora'
import fs from 'fs-extra'
import type { PackageJson } from 'type-fest'

import { hasYarn } from './hasYarn'
import { run } from './run'

const fetchSourceCodeInformation = async (sourceDirectory: string) => {
  const isThereYarnLock = await fs.pathExists(
    path.resolve(sourceDirectory, 'yarn.lock')
  )

  const packageJson: PackageJson = await fs.readJson(
    path.resolve(sourceDirectory, 'package.json')
  )

  const reactPackage = 'react'

  const reactEntry =
    packageJson.peerDependencies?.[reactPackage] ??
    packageJson.dependencies?.[reactPackage] ??
    packageJson.devDependencies?.[reactPackage]

  return {
    packageManager: isThereYarnLock ? 'yarn' : 'npm',
    reactVersion: reactEntry ?? undefined,
    packageName: packageJson.name,
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
  const sandboxName = `${directoryName}-sandbox`

  spinner.start('Cloning repository...')
  await git().clone(repositoryUrl, sourceDirectory)
  spinner.succeed('Cloned successfully')

  const { packageManager, reactVersion, packageName } =
    await fetchSourceCodeInformation(sourceDirectory)

  if (!packageName) {
    spinner.fail('I did not find a name inside package.json')
    process.exit(1)
  }

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

  spinner.start('Creating a React sandbox...')

  await run(
    'npx',
    [
      'create-react-app',
      sandboxName,
      packageManager === 'npm' ? '--use-npm' : '',
    ].filter(Boolean)
  )

  spinner.succeed('React sandbox created successfully')
}
