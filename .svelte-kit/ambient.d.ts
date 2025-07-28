
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const ALLUSERSPROFILE: string;
	export const APPDATA: string;
	export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
	export const BROWSER: string;
	export const c28fc6f98a2c44abbbd89d6a3037d0d9_POSIX_FD_STATE: string;
	export const CLASSPATH: string;
	export const CommonProgramFiles: string;
	export const CommonProgramW6432: string;
	export const COMPUTERNAME: string;
	export const COMSPEC: string;
	export const DriverData: string;
	export const ELECTRON_NO_ASAR: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const ENCRYPTION_KEY: string;
	export const HOME: string;
	export const HOMEDRIVE: string;
	export const HOMEPATH: string;
	export const JAVA_HOME: string;
	export const LOCALAPPDATA: string;
	export const LOGNAME: string;
	export const NODE_ENV: string;
	export const NUMBER_OF_PROCESSORS: string;
	export const OPENSSL_CONF: string;
	export const OS: string;
	export const Path: string;
	export const PATHEXT: string;
	export const PROCESSOR_ARCHITECTURE: string;
	export const PROCESSOR_IDENTIFIER: string;
	export const PROCESSOR_LEVEL: string;
	export const PROCESSOR_REVISION: string;
	export const ProgramData: string;
	export const ProgramFiles: string;
	export const ProgramW6432: string;
	export const PROMPT: string;
	export const PSExecutionPolicyPreference: string;
	export const PSModulePath: string;
	export const PUBLIC: string;
	export const Python: string;
	export const Python_script: string;
	export const RESTVAR: string;
	export const ROOT_DIR: string;
	export const SHELL: string;
	export const SSH_CLIENT: string;
	export const SSH_CONNECTION: string;
	export const SystemDrive: string;
	export const SystemRoot: string;
	export const TEMP: string;
	export const TMP: string;
	export const USER: string;
	export const USERDOMAIN: string;
	export const USERNAME: string;
	export const USERPROFILE: string;
	export const VSCODE_AGENT_FOLDER: string;
	export const VSCODE_CWD: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const VSCODE_HANDLES_SIGPIPE: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const VSCODE_L10N_BUNDLE_LOCATION: string;
	export const VSCODE_NLS_CONFIG: string;
	export const windir: string;
	export const _FIRST_ARG: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		ALLUSERSPROFILE: string;
		APPDATA: string;
		APPLICATION_INSIGHTS_NO_STATSBEAT: string;
		BROWSER: string;
		c28fc6f98a2c44abbbd89d6a3037d0d9_POSIX_FD_STATE: string;
		CLASSPATH: string;
		CommonProgramFiles: string;
		CommonProgramW6432: string;
		COMPUTERNAME: string;
		COMSPEC: string;
		DriverData: string;
		ELECTRON_NO_ASAR: string;
		ELECTRON_RUN_AS_NODE: string;
		ENCRYPTION_KEY: string;
		HOME: string;
		HOMEDRIVE: string;
		HOMEPATH: string;
		JAVA_HOME: string;
		LOCALAPPDATA: string;
		LOGNAME: string;
		NODE_ENV: string;
		NUMBER_OF_PROCESSORS: string;
		OPENSSL_CONF: string;
		OS: string;
		Path: string;
		PATHEXT: string;
		PROCESSOR_ARCHITECTURE: string;
		PROCESSOR_IDENTIFIER: string;
		PROCESSOR_LEVEL: string;
		PROCESSOR_REVISION: string;
		ProgramData: string;
		ProgramFiles: string;
		ProgramW6432: string;
		PROMPT: string;
		PSExecutionPolicyPreference: string;
		PSModulePath: string;
		PUBLIC: string;
		Python: string;
		Python_script: string;
		RESTVAR: string;
		ROOT_DIR: string;
		SHELL: string;
		SSH_CLIENT: string;
		SSH_CONNECTION: string;
		SystemDrive: string;
		SystemRoot: string;
		TEMP: string;
		TMP: string;
		USER: string;
		USERDOMAIN: string;
		USERNAME: string;
		USERPROFILE: string;
		VSCODE_AGENT_FOLDER: string;
		VSCODE_CWD: string;
		VSCODE_ESM_ENTRYPOINT: string;
		VSCODE_HANDLES_SIGPIPE: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		VSCODE_IPC_HOOK_CLI: string;
		VSCODE_L10N_BUNDLE_LOCATION: string;
		VSCODE_NLS_CONFIG: string;
		windir: string;
		_FIRST_ARG: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
