![Intro](intro.png)

This application is a simple webhook service for [GitBook.com](https://www.gitbook.com) that post notifications to [Slack](https://www.slack.com).

#### How to use it?

1. Create an `incoming-webhook` integration in your Slack account.
2. It generates an URL like `https://hooks.slack.com/services/<tokens>`
3. Add a webhook in your book with `https://slack-service.gitbook.com/hook/v1/<tokens>`
4. You're good to go!

