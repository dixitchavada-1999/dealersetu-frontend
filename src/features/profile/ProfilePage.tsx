import { PageHeader } from '../../components/ui';
import ProfileInfoCard from './components/ProfileInfoCard';
import ChangePasswordCard from './components/ChangePasswordCard';

/** Profile — editable info card + change-password card. */
export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile" />
      <ProfileInfoCard />
      <ChangePasswordCard />
    </div>
  );
}
