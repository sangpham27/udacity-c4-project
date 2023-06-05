// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'a8p87grc01'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-wt5j5x-j.us.auth0.com',            // Auth0 domain
  clientId: '77H2FjoU6Cgb4sGa5Zqg7UorXrfXY9Ac',          // Auth0 client id
  callbackUrl: 'http://localhost:3001/callback'
}
