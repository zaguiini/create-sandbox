import path from 'node:path'

const getFallbackDirectoryName = (repositoryUrl: string) => {
  return path.parse(repositoryUrl).name
}

export const createSandbox = (
  repositoryUrl: string,
  directoryName = getFallbackDirectoryName(repositoryUrl)
) => {
  console.log({ repositoryUrl, directoryName })
}
