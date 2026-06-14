import { dispatchApi, productionApi, marketingApi } from '../../lib/api';
import type { TeamConfig } from './types';

export const dispatchTeamConfig: TeamConfig = {
  noun: 'Dispatch User',
  title: 'Dispatch Team',
  emptyMessage: 'Add dispatch team members to manage deliveries.',
  api: {
    list: () => dispatchApi.getDispatchUsers(),
    create: (data) => dispatchApi.createDispatchUser(data),
    update: (id, data) => dispatchApi.updateDispatchUser(id, data),
    remove: (id) => dispatchApi.deleteDispatchUser(id),
  },
};

export const productionTeamConfig: TeamConfig = {
  noun: 'Production User',
  title: 'Production Team',
  emptyMessage: 'Add production team members to manage manufacturing.',
  api: {
    list: () => productionApi.getAll(),
    create: (data) => productionApi.create(data),
    update: (id, data) => productionApi.update(id, data),
    remove: (id) => productionApi.delete(id),
  },
};

export const marketingTeamConfig: TeamConfig = {
  noun: 'Marketing User',
  title: 'Marketing Team',
  emptyMessage: 'Add marketing team members to manage field sales & visits.',
  api: {
    list: () => marketingApi.getAll(),
    create: (data) => marketingApi.create(data),
    update: (id, data) => marketingApi.update(id, data),
    remove: (id) => marketingApi.delete(id),
  },
};
