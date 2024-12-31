
const ShellCommand = require ('./ShellCommand')
const GitBranch = require ('./GitBranch')

module.exports = class {

	async currentBranch () {
		let name = await this.run (`git symbolic-ref --short HEAD`)
		return GitBranch.withName (name, this)
	}

	async defaultBranch () {
		let [origin, name] = (await this.run (`git symbolic-ref refs/remotes/origin/HEAD --short`)).split ('/')
		return GitBranch.withName (`${origin}/${name}`, this)
	}

	async countDiffCommits (src, dst) {
		let srcName = await src.print ()
		let dstName = await dst.print ()
		let diff = await this.run (`git log --oneline ${dstName}..${srcName}`)
		return diff.split (`\n`).filter (i => i).length
	}

	async existInRemote (src) {
		let {origin, name} = src
		let commitBranch = await this.run (`git ls-remote --heads ${origin} ${name}`)
		return !!commitBranch
	}

	async existBranch (src) {
		let ok = await this.run (`git branch --list ${src.name}`)
		if (ok) {
			return true
		}
		return this.existInRemote (src)
	}

	async toMergeAfter (branch) {
		let listComma = await this.config (`branch.${branch.name}.mr-merge-after`)
		if (!listComma) {
			this.log (`to set up premerge for branch '${branch.name}': `.padEnd (40) + `git config branch.${branch.name}.mr-merge-after test,release`)
			return []
		}
		return listComma.split (',').map (i => GitBranch.withName (i, this))
	}

	async toTest () {
		if (this.commandTest) {
			return this.commandTest
		}

		let listComma = await this.config (`mr.test`)
		if (!listComma) {
			this.log (`to set up prepush command: `.padEnd (40) + `git config mr.test 'npm test'`)
			this.commandTest = []
			return this.commandTest
		}
		this.commandTest = listComma.split (',')
		return this.commandTest
	}

	async config (key) {
		let v
		try {
			v = await this.run (`git config ${key}`)
		} catch (x) {
			// @todo #70:1h replace catch by --default '' when git 2.11 EOL
			return ''
		}
		return v
	}

	log (label) {
		// @todo #40:1h move all console.log to injected LogCommand
		if (global.FUZZ) {
			return ''
		}
		console.log (label)
	}

	async run (cmd) {
		return ShellCommand.withText (cmd).runSilent ()
	}
}
