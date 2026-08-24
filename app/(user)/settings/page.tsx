import { SettingsHeader } from './_components/settings-header';
import { SettingsTabs } from './_components/settings-tabs';
import { getUserSettings } from './actions/get-user-settings';
import { getBusinessSettings } from './actions/get-business-settings';
import { getActiveWorkspaceId } from '../actions/workspace';

export default async function SettingsPage() {
  const userSettings = await getUserSettings();
  const businessSettings = await getBusinessSettings();
  const businessId = await getActiveWorkspaceId();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-4">
        <SettingsHeader />
        <SettingsTabs
          userSettings={userSettings}
          businessSettings={businessSettings}
          businessId={businessId}
        />
      </div>
    </div>
  );
}
