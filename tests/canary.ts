// Canary file for SecurityAuditSkill testing
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: 'super-secret-password-123', // This should be detected
  database: 'caLLM_prod'
};

export async function login(username: string) {
  // Vulnerable SQL query (concatenation)
  const query = "SELECT * FROM users WHERE username = '" + username + "'"; // This should be detected
  return query;
}
