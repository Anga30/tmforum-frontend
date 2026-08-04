export type Permission = {
  id: string;
  name: string;
  function: string;
  action: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
};

export type PermissionSet = {
  id: string;
  name: string;
  description?: string | null;
  involvementRole?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  permissions: Permission[];
};

export type Role = {
  id: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  permissionSet: PermissionSet;
};
