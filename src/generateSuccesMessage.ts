interface GenerateSuccessMessageOptions {
  sandboxName: string
  packageManager: string
}

export const generateSuccessMessage = ({
  sandboxName,
  packageManager,
}: GenerateSuccessMessageOptions) =>
  console.log(`
  Done!

  Now enter the \`${sandboxName}\` directory,
  run \`${packageManager} start\` and enjoy your development sandbox!
`)
