const axios = require('axios');

async function getResponse() {
  try {
    const GIT_TOKEN = process.env.GIT_TOKEN;
    const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
    const JIRA_HOST = process.env.JIRA_HOST;
    const JIRA_USERNAME = process.env.JIRA_USERNAME;
    const GITHUB_ISSUE_NUMBER = process.env.GITHUB_ISSUE_NUMBER;
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    // Fetch GitHub issue information
    const githubResponse = await axios.get(
      `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${GITHUB_ISSUE_NUMBER}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${GIT_TOKEN}`,
        },
      },
    );
    const githubIssueTitle = githubResponse.data.title;
    const githubIssueClosed = githubResponse.data.state === 'closed';
    if (githubIssueClosed) {
      // Fetch Jira issues matching the GitHub issue title
      const jiraApiUrl = `https://${JIRA_HOST}/rest/api/3/search`;
      const jiraHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString('base64')}`,
      };

      const jiraResponse = await axios.get(jiraApiUrl, {
        params: {
          jql: `project= OP AND summary ~ "${githubIssueTitle}"`,
          maxResults: 100,
        },
        headers: jiraHeaders,
      });

      const jiraIssues = jiraResponse.data.issues;
      if (jiraResponse.data && Array.isArray(jiraResponse.data.issues)) {
        // Use the find method on the 'issues' array
        const matchingIssue = jiraResponse.data.issues.find(issue => {
          return issue.fields.summary === githubIssueTitle;
        });
        const transitionsUrl = `https://${JIRA_HOST}/rest/api/3/issue/${matchingIssue.key}/transitions`;
        const transitionsResponse = await axios.get(transitionsUrl, {
          headers: jiraHeaders,
        });
        const doneTransition = transitionsResponse.data.transitions.find(
          transition => transition.name.toLowerCase() === 'done',
        );
        if (doneTransition) {
          // Prepare Jira API request to transition the issue to "Done"
          const transitionPayload = {
            transition: { id: doneTransition.id },
          };

          const transitionUrl = `https://${JIRA_HOST}/rest/api/3/issue/${matchingIssue.key}/transitions`;

          await axios.post(transitionUrl, transitionPayload, {
            headers: jiraHeaders,
          });

          console.log('Jira issue status updated to "Done"');
        } else {
          console.log('No "Done" transition found.');
        }
      }
    } else {
      console.log('GitHub issue is not closed.');
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

getResponse();
