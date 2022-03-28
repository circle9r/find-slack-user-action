const core = require('@actions/core');
const slack = require('slack')

async function run() {
	try {
		const username = core.getInput('username', { required: true })
		const slackToken = core.getInput('slack-token', { required: false }) || process.env.SLACK_API_TOKEN
		const includeAtSymbol = core.getInput('include-at-symbol') == 'true'

		if (!slackToken) {
			core.setFailed('No Slack token provided. Either add SLACK_API_TOKEN to the env or provide the slack-token parameter.')
			return
		}

		let success = true;
		let member = {};
		const response = await slack.users.list({ token: slackToken }).catch(err => { success = false })
		if (response?.members) {
			const list = response.members;
			const names = list.map(n => String(n.real_name).toLowerCase());
			const search = String(username).toLowerCase();
			const index = names.findIndex(n => n === search);
			member = list[index];
		}

		core.setOutput("found-user", success)
		core.setOutput("username", success ? (includeAtSymbol ? '@' : '').concat(member.name) : core.getInput('default-username', { required: false }))
		core.setOutput("member-id", success ? member.id : core.getInput('default-member-id', { required: false }))
	} catch (err) {
		core.setFailed(err.message)
	}
}

run()