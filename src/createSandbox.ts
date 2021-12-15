import path from 'node:path'
import git from 'simple-git'
import ora from 'ora'
import fs from 'fs-extra'
import type { PackageJson } from 'type-fest'

import { hasYarn } from './hasYarn'
import { run } from './run'
import { generateSuccessMessage } from './generateSuccesMessage'

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

  const peerDependencies = packageJson.peerDependencies ?? {}

  return {
    packageManager: isThereYarnLock ? 'yarn' : 'npm',
    reactVersion: reactEntry ?? undefined,
    packageName: packageJson.name,
    peerDependencies: Object.keys(peerDependencies)
      .filter((package_) => !['react', 'react-dom'].includes(package_))
      .map((key) => {
        const fixedVersion = peerDependencies[key].replace(/^[\^~]/, '~')

        return `${key}@${fixedVersion}`
      }),
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
  const sandboxDirectory = path.resolve(process.cwd(), sandboxName)

  if (await fs.pathExists(sandboxDirectory)) {
    spinner.fail('Sandbox project already exists')
    console.error(`
  Please remove the ${sandboxName} directory:
    \`rm -rf ${sandboxName}\`
`)
    process.exit(1)
  } else if (await fs.pathExists(sourceDirectory)) {
    spinner.succeed('Repository already exists')
  } else {
    spinner.start('Cloning repository...')
    await git().clone(repositoryUrl, sourceDirectory)
    spinner.succeed('Cloned successfully')
  }

  const { packageManager, reactVersion, packageName, peerDependencies } =
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

  try {
    await run(
      'npx',
      [
        'create-react-app',
        sandboxName,
        packageManager === 'npm' ? '--use-npm' : '',
      ].filter(Boolean),
      {
        env: {
          ...process.env,
          npm_config_yes: 'true',
        },
      }
    )
  } catch {
    spinner.fail('Failed to create React sandbox')

    console.error(`
  Try deleting npx cache by running the following command:
    \`rm -rf $(npm config get cache)/_npx\`
  And make sure that Create React App is not installed globally:
    - \`npm remove create-react-app -g\`
    - \`yarn global remove create-react-app\`
`)

    process.exit(1)
  }

  spinner.succeed('React sandbox created successfully')

  spinner.start('Installing project dependencies...')

  await run(packageManager, ['install'], {
    cwd: sourceDirectory,
  })

  spinner.succeed('Project dependencies installed')

  spinner.start('Building project...')

  await run(packageManager, ['build'], {
    cwd: sourceDirectory,
  })

  spinner.succeed('Project built')

  if (peerDependencies.length > 0) {
    spinner.start('Installing peer dependencies in the sandbox...')

    await run(
      packageManager,
      [packageManager === 'npm' ? 'install' : 'add', ...peerDependencies],
      {
        cwd: sandboxDirectory,
      }
    )

    spinner.succeed('Peer dependencies installed')
  }

  spinner.start('Linking project dependencies to the sandbox...')

  await run(packageManager, ['link'], {
    cwd: sourceDirectory,
  })

  await run(packageManager, ['link'], {
    cwd: path.resolve(sourceDirectory, 'node_modules', 'react'),
  })

  let linkedReactDOM = true

  try {
    await run(packageManager, ['link'], {
      cwd: path.resolve(sourceDirectory, 'node_modules', 'react-dom'),
    })
  } catch {
    // Not all projects include react-dom as a dependency
    linkedReactDOM = false
  }

  await run(
    packageManager,
    ['link', packageName, 'react', linkedReactDOM ? 'react-dom' : ''].filter(
      Boolean
    ),
    {
      cwd: sandboxDirectory,
    }
  )

  spinner.succeed('Dependencies linked')

  generateSuccessMessage({
    packageManager,
    sandboxName,
  })
}
