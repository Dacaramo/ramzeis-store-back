import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

const domainURL = process.env.OPENSEARCH_PRODUCTS_DOMAIN_URL;

if (!domainURL) {
  throw new Error(
    'OPENSEARCH_PRODUCTS_DOMAIN_URL missing, it may be because the key is not defined on the serverless.yaml file. Since this value is a not a secret it must be defined on the file.'
  );
}

export const openSearchClient = new Client({
  ...AwsSigv4Signer({
    region: 'us-east-1',
    service: 'es', // 'aoss' for OpenSearch Serverless
    // Must return a Promise that resolve to an AWS.Credentials object.
    // This function is used to acquire the credentials when the client start and
    // when the credentials are expired.
    // The Client will treat the Credentials as expired if within
    // `requestTimeout` ms of expiration (default is 30000 ms).

    // Example with AWS SDK V3:
    getCredentials: () => {
      // Any other method to acquire a new Credentials object can be used.
      const credentialsProvider = defaultProvider();
      return credentialsProvider();
    },
  }),
  requestTimeout: 60000, // Also used for refreshing credentials in advance
  node: domainURL, // OpenSearch domain URL
});
