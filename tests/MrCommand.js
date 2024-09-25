const {describe, it, mock} = require ('node:test')
const assert = require ('assert')
const ShellCommand = require ('../lib/ShellCommand')
const GitRepo = require ('../lib/GitRepo')
const GitBranch = require ('../lib/GitBranch')
const MrCommand = require ('../lib/MrCommand')
const ParsedArgs = require ('../lib/ParsedArgs')
const Push = require ('../lib/PushCommand')
const Switch = require ('../lib/SwitchCommand')

describe('random input', () => {
	let f = function () {
		switch (this.cmd) {
			case 'git switch --merge --guess TASK-42':
			case 'git switch --merge --guess --create TASK-42':
				return `Switched to a new branch 'TASK-42'`
			case 'git branch --list TASK-42':
				return `e46431c45f3c46d87c22cf63d70db2f4435bd89b refs/heads/TASK-42`
			case 'git branch --list TASK-43':
				return ``
			case "git config --default '' --get mr.test":
				return ``
			default:
				throw new Error (`Unknow command: ${this.cmd}`)
		}

	}
	mock.method(ShellCommand.prototype, 'run', f)
	mock.method(ShellCommand.prototype, 'runSilent', f)

	mock.method(GitBranch.prototype, 'isOriginGitlab', function () {
		return false
	})

	mock.method(GitRepo.prototype, 'currentBranch', function () {
		return new GitBranch ({ name: 'TASK-42', origin: 'gitlab', gitRepo: this })
	})

	mock.method(GitRepo.prototype, 'defaultBranch', function () {
		return new GitBranch ({ name: 'main', origin: 'gitlab' })
	})

	it ('push on empty arguments', async (t) => {
		const parsedArgs = new ParsedArgs ([])
		const gitRepo = new GitRepo ()
		const commands = {Push}
		const todo = await new MrCommand ({parsedArgs, gitRepo, commands}).todo()
		assert.deepStrictEqual(todo, {
			todo: [
				'git push --set-upstream gitlab TASK-42:TASK-42'
			]
		})
	})

	it ('switch branch exists', async (t) => {
		const parsedArgs = new ParsedArgs (['TASK-42'])
		const gitRepo = new GitRepo ()
		const commands = {Switch}
		const todo = await new MrCommand ({parsedArgs, gitRepo, commands}).todo()
		assert.deepStrictEqual(todo, {
			todo: [
				'git fetch',
				'git switch --merge --guess TASK-42',
			]
		})
	})

	it ('switch create branch when not exists', async (t) => {
		const parsedArgs = new ParsedArgs (['TASK-43'])
		const gitRepo = new GitRepo ()
		const commands = {Switch}
		const todo = await new MrCommand ({parsedArgs, gitRepo, commands}).todo()
		assert.deepStrictEqual(todo, {
			todo: [
				'git fetch',
				{
					todo: 'git switch --guess --merge --create TASK-43 gitlab/main',
					confirm: "Create new branch 'TASK-43' from 'gitlab/main' [Y/n]? ",
				}
			]
		})
	})
})
