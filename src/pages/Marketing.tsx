import TeamManagementPage from '../features/team/TeamManagementPage';
import { marketingTeamConfig } from '../features/team/teamConfigs';

export default function Marketing() {
  return <TeamManagementPage config={marketingTeamConfig} />;
}
