const core = require("@actions/core");
const axios = require("axios");

(async function execute() {
	try {
		const initialChangeLog = core.getInput("changelog");
		const jiraUserEmail = core.getInput("jiraUserEmail");
		const jiraUserToken = core.getInput("jiraUserToken");
		const jiraProjectName = core.getInput("jiraProjectName");

		console.log("Initial Changelog", initialChangeLog);

		const commitMessages = getCommitMessages(initialChangeLog);
		const validCommitMessages = commitMessages.filter(filterCommits);
		const jiraIds = getJiraIDs(validCommitMessages);

		const jiraTitleObject = await getJiraTitles(jiraIds, {
			email: jiraUserEmail,
			token: jiraUserToken,
			project: jiraProjectName,
		});
		console.log("Jira Title Object", jiraTitleObject);

		const updatedChangeLog = getReleaseMd(jiraTitleObject, jiraProjectName);
		console.log("Updated Changelog", updatedChangeLog);

		core.setOutput("updatedChangeLog", updatedChangeLog);
	} catch (error) {
		console.log("Error", error)
		core.setFailed(error.message);
	}
})();

// - [0083719]() - feat: LOS-21: something
// - [70d5640]() - feat: UI-21: something
// - [dd4c37d]() - d feat: LOS-21: something
// - [dd4c37d]() - Merge Pull;
// =>
// [ 'LOS-21', 'UI-21' ]
function getCommitMessages(changeLog) {
	return changeLog
		.split("- [")
		.filter(Boolean)
		.map((change) => change.split("- ")[1]);
}

// to make sure commit message are valid & does contain Jira Ids
function filterCommits(msg) {
	return /(fix|poc|chore|feat|refactor|style|test): (LOS|LMS|UI)-\d+: .*/.test(msg);
}

// returns list of Unique Jira Ids
function getJiraIDs(commits) {
	const set = {};
	commits.forEach((commit) => {
		const jiraId = getJiraIdFromCommit(commit);
		set[jiraId] = 1;
	});

	return Object.keys(set);
}

function getJiraIdFromCommit(msg) {
	const [_, jiraId] = msg.split(": ");
	return jiraId;
}

function getReleaseMd(jiraTitleObject, jiraProjectName) {
	let str = "";

	Object.entries(jiraTitleObject).forEach(([jiraID, jiraTitle]) => {
		str += `- [${jiraID}](${getTicketOnJiraLink(jiraID, jiraProjectName)} - ${jiraTitle} \n`;
	});

	return str;
}

function getTicketOnJiraLink(jiraId, jiraProjectname) {
	return `https://${jiraProjectname}.atlassian.net/browse/${jiraId}}`;
}

// takes list of JiraIds
// returns an object with key as JiraId and value as Jira Title
async function getJiraTitles(jiraIds, { email, token, project }) {
	const obj = {};
	const resp = await axios.get(
		`https://${project}.atlassian.net/rest/api/3/search?jql=key in (${jiraIds.join(",")})`,
		{
			headers: {
				Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`,
				Accept: "application/json",
			},
		}
	);

	resp.data.issues.forEach((issue) => {
		obj[issue.key] = issue.fields.summary;
	});

	return obj;
}
