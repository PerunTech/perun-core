export function rolesConfig (userType) {
  const userTypes = {
    ADMIN: {
      roles: ['ADD', 'EDIT', 'LPIS']
    },
    INTERNAL: {
      roles: ['ADD', 'EDIT', 'LPIS']
    },
    EXTERNAL: {
      roles: ['ADD', 'EDIT', 'LPIS']
    }
  }
  return userTypes[userType].roles
}
