# ramzeis-store-back

This is the repo for the **Ramzeis Store** back-end. This repo holds a
**Serverless Framework** service (could be multiple in the future) that allows an
easy and straight forward way of managing all of our back-end resources. Our
back-end resources managed by Serverless are shown below. All of the other
back-end resources are not managed by Serverless.

| Managed by Serverless         | Managed manually from the AWS console |
| ----------------------------- | ------------------------------------- |
| AWS API Gateway instance      | AWS DynamoDB main table               |
| AWS Lambda endpoint functions | AWS OpenSearch domain                 |
| AWS Lambda trigger functions  | ...                                   |

## Environments

### Environment details

We have multiple environments in order to prevent bug leaking on production.

1. The development environment, represented by the **dev** branch, is for
   merging brand new features that were recently developed by our team. That does
   not mean that the pull requests made to the **dev** branch don't require
   testing. In order to get a PR accepted you must have written all of the
   necessary tests for your code and be 100% sure that it won't fail.

2. The staging environment, represented by the **stag** branch, is for quality
   assurance. On the staging environment additional tests are going to be made.
   The **stag** branch is like an additional security layer were testers are
   going to try to break the **dev** code. If there are problems all of them
   needs to be fixed right there, on the **stag** branch.

3. The production environment, represented by the **prod** branch, contains the
   code that will be actually used for exposing our product to our customers and
   the world. This environment must be 100% bug free.

> Each environment is represented by a git branch with the same names.

### How to make changes to each environment

- Create your features or make your changes on the branch you're currently using
  (e.g. feature branch, fix branch, etc.), add, commit and push your changes to
  a remote branch called the same as your local branch
- Once your changes are on GitHub, create a PR from the branch you've just
  created to the **dev**, **stag** or **prod** branch
- Ask to people that has deployment permissions to review and deploy your
  changes
- Someone else will deploy the changes to AWS by running `npm run deploy-all-dev`
  for deploying to the **dev** environment, `npm run deploy-all-stag`
  for deploying to the **stag** environment or `npm run deploy-all-prod`
  for deploying to the **prod** environment

Keep in mind that if you run any of the deployment commands without having
deployment permissions you will get an error. In order to successfully run
that command you need:

- An AWS IAM profile with the right permissions
- To create a `.env` file at the root of this folder
- To add the following to the `.env` file by don't forgetting to replace the XXX
  with your keys

```dotenv
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### How does this work?

Every environment branch has:

- All of the necessary keys and data for establishing a connection between our
  AWS Lambda Functions and the resources made specifically for each
  environment located inside the `.env` file.
- A file named `serverless.json` that gives permission to our AWS Lambda
  Functions so they can interact with the resources of each environment.

> Keep in mind that both the `.env` and the `serverless.json` files have different
> content on each branch, that's because each branch is a different environment,
> and each environment must establish a connection from lambda A and resource A.
> Basically, a lambda from the dev environment must be
> connected to the DynamoDB table of the dev environment, and not to the table of
> the prod environment, and so on. Once you now that, it is really important to
> not mess around with the content of those files if you don't know what you are
> doing.

> Remember that we have an AWS resource of each type (e.g. DynamoDB table,
> OpenSearch domain, etc.) per each environment. Below you can see the arns, which are the unique identifiers of every AWS resource.

|          | API Gateway instance | DynamoDB table                                                              | OpenSearch domain |
| -------- | -------------------- | --------------------------------------------------------------------------- | ----------------- |
| **dev**  | arn                  | arn:aws:dynamodb:us-east-1:142399826006:table/ramzeis-store-dev-main-table  | arn               |
| **stag** | arn                  | arn:aws:dynamodb:us-east-1:142399826006:table/ramzeis-store-stag-main-table | arn               |
| **prod** | arn                  | arn:aws:dynamodb:us-east-1:142399826006:table/ramzeis-store-prod-main-table | arn               |

## Future integrations

Here is a list ordered from the most important to the less important features
that needs to be implemented as soon as possible:

- Automate deployment so whenever a PR is merged to any of the environment
  branches CodePipeline will deploy the new changes to AWS
