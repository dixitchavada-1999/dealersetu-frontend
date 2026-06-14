import TeamManagementPage from '../features/team/TeamManagementPage';
import { productionTeamConfig } from '../features/team/teamConfigs';

export default function Production() {
  return <TeamManagementPage config={productionTeamConfig} />;
}
