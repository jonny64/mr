const GitBranch  = require('./GitBranch')

module.exports = class {
	constructor(o) {
		this.gitRepo = o.gitRepo
		this.parsedArgs = o.parsedArgs
		this.createCommand = o.createCommand
	}

	async todo () {
		let {parsedArgs, gitRepo} = this
		let {dst} = await parsedArgs.value ()
		let dstBranch = await GitBranch.withName (dst, gitRepo)

		if (!await gitRepo.existBranch (dstBranch)) {
			return this.createCommand.todo ()
		}

		return {
			todo: [
				`git fetch`,
				`git switch --guess --merge ${dst}`,
			]
		}
	}
}
