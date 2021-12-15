# `create-sandbox`

Create a local sandbox of a library you'd like to contribute!

Run it with `npx create-sandbox <repository-url>`

It works on single project repositories that are using React. Another requirement is that the build step for the package is strictly `build`.

When you run the `create-sandbox` command, the CLI will:

1. clone the repository if it does not exist already;
2. create a React sandbox;
3. install the project dependencies;
4. build the project;
5. install the project's peer dependencies in the sandbox;
6. link the project's artifacts to the sandbox.

Now all you need to do is to start the sandboxed application and let your ideas change the world!

## Roadmap

- [x] Simple repository with React sandbox
- [ ] Custom build script
- [ ] Folder as project instead of repository
- [ ] Unlink packages NPM script
- [ ] Monorepo with React sandbox
- [ ] Package selection for monorepos
- [ ] Framework detector + adapter (e.g. Vue, Angular)

## Contributing

Fork it and create PRs. They are welcome!

On creating issues, please make sure to specify the URL of the repository, along with your environment settings such as OS, package manager and NodeJS version.

## Making `create-sandbox`

1. Clone the repository;
2. Install the packages;
3. Run the `start` script.

It will start the compiler in watch mode.

To test you changes, run the following script on the parent folder:

```sh
node --experimental-specifier-resolution=node create-sandbox/dist/index.js <repository-url>
```
## LICENSE

MIT
