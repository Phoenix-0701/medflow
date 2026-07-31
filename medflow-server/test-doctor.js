const fetch = require('node-fetch');

async function test() {
  console.log("Logging in...");
  const loginRes = await fetch('http://127.0.0.1:4000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadminbkmed@gmail.com', password: 'AdminPassword123!' })
  });
  const loginData = await loginRes.json();
  console.log("Login data:", loginData);

  if (!loginData.accessToken) {
    console.log("No access token!");
    return;
  }

  const token = loginData.accessToken;
  console.log("Fetching users...");
  const usersRes = await fetch('http://127.0.0.1:4000/admin/users', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log("Users status:", usersRes.status);
  const usersData = await usersRes.text();
  console.log("Users response:", usersData);
}

test().catch(console.error);
