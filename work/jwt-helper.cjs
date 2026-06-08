const crypto = require('crypto');
function b64url(input){return Buffer.from(input).toString('base64url')}
function jwt(payload, secret){const header={alg:'HS256',typ:'JWT'}; const data=b64url(JSON.stringify(header))+'.'+b64url(JSON.stringify(payload)); const sig=crypto.createHmac('sha256', secret).update(data).digest('base64url'); return data+'.'+sig}
const secret='super-secret-jwt-token-with-at-least-32-characters-long';
console.log(jwt({iss:'supabase',ref:'local',role:'anon',iat:1641769200,exp:1957345600}, secret));
console.log(jwt({iss:'supabase',ref:'local',role:'service_role',iat:1641769200,exp:1957345600}, secret));
