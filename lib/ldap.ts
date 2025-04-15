import { Client } from 'ldapts';

const LDAP_CONFIG = {
  URL: process.env.LDAP_SERVER_URL || 'ldap://localhost:389',
  BIND_DN: process.env.LDAP_BIND_DN || 'CN=svc.admin,OU=ServiceAccounts,OU=Process,DC=ads,DC=aexp,DC=com',
  BIND_CREDENTIALS: process.env.LDAP_BIND_CREDENTIALS || 'password',
  BASE_DN: process.env.LDAP_BASE_DN || 'dc=ads,dc=aexp,dc=com',
};

export async function authenticateUser(username: string, password: string) {
  const client = new Client({
    url: LDAP_CONFIG.URL,
    tlsOptions: { rejectUnauthorized: false },
  });

  try {
    // Bind with service account
    await client.bind(LDAP_CONFIG.BIND_DN, LDAP_CONFIG.BIND_CREDENTIALS);

    // Search for user
    const { searchEntries } = await client.search(LDAP_CONFIG.BASE_DN, {
      scope: 'sub',
      filter: `(uid=${username})`,
    });

    if (!searchEntries.length) throw new Error('User not found');
    const userDN = searchEntries[0].dn;

    // Verify user credentials
    await client.bind(userDN, password);

    // Get user groups
    const groups = searchEntries.map((group) => {
        if (Array.isArray(group.cn)) {
          return group.cn.map(cn => cn.toString()).filter(Boolean);
        }
        return [group.cn?.toString() || ''].filter(Boolean);
      }).flat();

    return {
      username,
      groups: groups as string[], 
    };
  } finally {
    await client.unbind();
  }
}