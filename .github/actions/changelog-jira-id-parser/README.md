This can parse changelog of commits and Create a new changelog with JiraIds and their title

Reference: https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action

Example:
````
- name: Parse Changelog to Populate JiraIds and Jira Title
    uses: .github/actions/changelog-jira-id-parser
    id: changelog_jira_parser
    with:
    changelog: ${{ steps.changelog.outputs.changelog }}
    jiraUserEmail: ${{ secrets.RUPIFI_JIRA_USER }}
    jiraUserToken: ${{ secrets.RUPIFI_JIRA_TOKEN }}
    jiraProjectName: "rupifi"
````