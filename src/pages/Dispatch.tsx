import TeamManagementPage from '../features/team/TeamManagementPage';
import { dispatchTeamConfig } from '../features/team/teamConfigs';

export default function Dispatch() {
  return <TeamManagementPage config={dispatchTeamConfig} />;
}
