import type { ReactNode } from "react";

import authStore from "../../store/auth.store";

interface Props {
  roles: string[];
  children: ReactNode;
}

function RoleGuard({
  roles,
  children,
}: Props) {

  const user = authStore.getUser();

  if (!user) {
    return null;
  }

  if (!roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

export default RoleGuard;