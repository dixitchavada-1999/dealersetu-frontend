// Shared shape for a staff member across Dispatch / Production / Marketing teams.
export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isActive: boolean;
};

export type TeamMemberInput = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password?: string;
};

/** CRUD adapter — maps a team's differently-named API methods to a common shape. */
export type TeamApi = {
  list: () => Promise<TeamMember[]>;
  create: (data: TeamMemberInput) => Promise<unknown>;
  update: (id: string, data: TeamMemberInput) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
};

/** Per-team labels + API used to drive the generic TeamManagementPage. */
export type TeamConfig = {
  /** Singular noun, e.g. "Dispatch User". */
  noun: string;
  /** Page title, e.g. "Dispatch Team". */
  title: string;
  /** Empty-state message. */
  emptyMessage: string;
  api: TeamApi;
};
