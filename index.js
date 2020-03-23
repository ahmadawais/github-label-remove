#!/usr/bin/env node

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
	handleError(`UNHANDLED ERROR`, err);
});

const ora = require('ora');
const welcome = require('cli-welcome');
const chalk = require('chalk');
const green = chalk.green;
const yellow = chalk.yellow;
const dim = chalk.dim;
const spinner = ora({ text: '' });
const handleError = require('cli-handle-error');
const logSymbols = require('log-symbols');
const gitLabel = require('git-label');
const meow = require('meow');
const pkgJSON = require('./package.json');
const updateNotifier = require('update-notifier');

(async () => {
	welcome(`github-lable-remove`, `by Awais.dev\n${pkgJSON.description}`, {
		bgColor: `#269F42`,
		color: `#FFFFFF`,
		bold: true,
		clear: false,
		version: `v${pkgJSON.version}`
	});

	updateNotifier({
		pkg: pkgJSON,
		shouldNotifyInNpmScript: true
	}).notify({ isGlobal: true });

	const cli = meow(
		`
	Usage
	  ${green(`npx github-label-remove`)} ${yellow(`[--option]`)}

	Options
	  ${yellow(`--token`)}, ${yellow(`-t`)}     GitHub token
	  ${yellow(`--repo`)}, ${yellow(`-r`)}      GitHub username/repo
	  ${yellow(`--label`)}, ${yellow(`-l`)}     Custom label to remove (optional)
	  ${yellow(`--api`)}, ${yellow(`-a`)}       Custom API link (optional)
	  ${yellow(`--defaults`)}, ${yellow(`-d`)}  Delete all default GitHub labels

	Examples
	  # Delete a single label.
	  ${green(`npx github-label-remove`)} ${yellow(`--token`)} <token> ${yellow(`--repo <name/repo>`)} ${yellow(
			`--lable`
		)} <label-name-to-delete>
	  ${green(`npx github-label-remove`)} ${yellow(`-t`)} <token> ${yellow(`-r <name/repo>`)} ${yellow(`-l`)} <label-name-to-delete>

	  # Delete all the default labels.
	  ${green(`npx github-label-remove`)} ${yellow(`-t`)} <token> ${yellow(`-r`)} <name/repo> ${yellow(`--defaults`)}
	  ${green(`npx github-label-remove`)} ${yellow(`-t`)} <token> ${yellow(`-r`)} <name/repo> ${yellow(`-d`)}
`,
		{
			booleanDefault: undefined,
			hardRejection: false,
			inferType: false,
			flags: {
				token: {
					type: 'string',
					alias: 't'
				},
				repo: {
					type: 'string',
					alias: 'r'
				},
				label: {
					type: 'string',
					alias: 'l'
				},
				api: {
					type: 'string',
					default: 'https://api.github.com',
					alias: 'a'
				},
				defaults: {
					type: 'boolean',
					default: false,
					alias: 'd'
				}
			}
		}
	);

	const token = cli.flags.token;
	const repo = cli.flags.repo;
	const label = cli.flags.label;
	const api = cli.flags.api;
	const defaults = cli.flags.defaults;
	const [input] = cli.input;

	input === 'help' && (await cli.showHelp(0));

	const config = { api, repo, token };

	const defaultLabels = [
		{ name: 'bug', color: '' },
		{ name: 'duplicate', color: '' },
		{ name: 'enhancement', color: '' },
		{ name: 'good first issue', color: '' },
		{ name: 'help wanted', color: '' },
		{ name: 'invalid', color: '' },
		{ name: 'documentation', color: '' },
		{ name: 'question', color: '' },
		{ name: 'wontfix', color: '' }
	];

	const customLabel = [{ name: label, color: '' }];
	const labels = defaults ? defaultLabels : customLabel;

	// Remove specified labels from a repo.
	spinner.start(`${yellow(`DELETING`)} lables…`);
	try {
		await gitLabel.remove(config, labels);
		spinner.succeed(`${green(`DELETED`)} lables\n`);
		console.log(
			`\n${logSymbols.success} ${dim(`Star the repo for updates → https://git.io/github-label-remove`)}\n${
				logSymbols.info
			} ${dim(`Follow for more CLIs → https://twitter.com/MrAhmadAwais\n\n`)}`
		);
	} catch (err) {
		handleError(`UNABLE TO DELETE`, err);
	}
})();
