import USER_ROLE from '../constants/userRoles';

export const isNormalUser = (role) => {
  if (role !== USER_ROLE.PRO && role !== USER_ROLE.ADMIN) {
    return true;
  }
  return false;
};
