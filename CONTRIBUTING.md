
# Contributing

Thank you for your interest in contributing to the Dogewood frontend!

# Development

## Running the interface locally

1. `npm install`
1. `npm start`

## Creating a production build

1. `npm install`
1. `npm run build`

## Engineering standards

Code merged into the `master` branch of this repository should adhere to high standards of correctness and maintainability. 
Use your best judgment when applying these standards.  If code is in the critical path, will be frequently visited, or 
makes large architectural changes, consider following all the standards.

- Have at least one engineer approve of large code refactorings
- At least manually test small code changes, prefer automated tests
- Thoroughly unit test when code is not obviously correct
- If something breaks, add automated tests so it doesn't break again
- Add integration tests for new pages or flows
- Verify that all CI checks pass before merging
- Have at least one product manager or designer approve of any significant UX changes

## Release process

Features should not be merged into `master` until they are ready for users.
When building larger features or collaborating with other developers, create a new branch from `master` to track its development.
Use the automatic Vercel preview for sharing the feature to collect feedback.  
When the feature is ready for review, create a new pull request from the feature branch into `master` and request reviews from 
the appropriate UX reviewers (PMs or designers).
