const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

/**
 * Metro in a monorepo. This is the whole answer to "does a React Native app
 * load workspace packages?" — it does, at BUILD time: Metro walks these folders,
 * compiles `packages/*` from source and inlines them into the bundle that ships
 * inside the binary. There is no runtime module loading involved.
 */
const config = getDefaultConfig(projectRoot)

// Without this Metro only watches apps/mobile and never sees a change in
// packages/client or packages/ui.
config.watchFolders = [workspaceRoot]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

/**
 * Packages that MUST exist exactly once in the bundle. Each of them keeps
 * module-level state that a second copy silently splits in two: React's hook
 * dispatcher, and the query client's context (the same duplication that broke
 * the web with "No QueryClient set").
 *
 * Forcing them matters here because the repo deliberately holds two React
 * majors — 18 for the Next app, 19 for React Native — so npm hoists one of them
 * to the root and nests the other, and WHICH one it picks changes between
 * installs. Resolving these as if every import came from this app's own root
 * makes the outcome the same either way.
 */
const SINGLETONS = ['react', 'react-dom', 'react-native', '@tanstack/react-query']

const defaultResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETONS.some(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`),
  )
  const resolve = defaultResolveRequest ?? context.resolveRequest

  if (isSingleton) {
    return resolve(
      { ...context, originModulePath: path.join(projectRoot, 'package.json') },
      moduleName,
      platform,
    )
  }

  return resolve(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
