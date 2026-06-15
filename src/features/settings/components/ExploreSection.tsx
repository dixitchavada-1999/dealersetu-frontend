import { Card, FormField, TextInput, Toggle } from '../../../components/ui';
import SaveButton from './SaveButton';
import type { useSettings } from '../hooks/useSettings';

type Props = {
  explore: ReturnType<typeof useSettings>['explore'];
  saving: boolean;
  onSave: () => void;
};

/** Customer Explore-feed layout and banner rotation settings. */
export default function ExploreSection({ explore: e, saving, onSave }: Props) {
  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Explore Feed</h2>
      <p className="text-sm text-slate-500 mb-5">Configure how banners appear on customer dashboard</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Banner Rotate (seconds)">
            <TextInput type="number" min={3} value={e.bannerRotateInterval} onChange={ev => e.setBannerRotateInterval(Math.max(3, Number(ev.target.value) || 5))} />
            <p className="text-[10px] text-slate-400 mt-1">Auto-shuffle images every X seconds (min 3)</p>
          </FormField>
          <FormField label="Grid Columns">
            <TextInput type="number" min={2} max={5} value={e.exploreGridCols} onChange={ev => e.setExploreGridCols(Math.min(5, Math.max(2, Number(ev.target.value) || 3)))} />
            <p className="text-[10px] text-slate-400 mt-1">Number of columns (2-5)</p>
          </FormField>
          <FormField label="Grid Gap (px)">
            <TextInput type="number" min={0} max={10} value={e.exploreGridGap} onChange={ev => e.setExploreGridGap(Math.min(10, Math.max(0, Number(ev.target.value) || 0)))} />
            <p className="text-[10px] text-slate-400 mt-1">Space between images (0-10)</p>
          </FormField>
          <div className="flex items-center justify-between pt-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Show Title</label>
              <p className="text-[10px] text-slate-400 mt-0.5">Title overlay on images</p>
            </div>
            <Toggle checked={e.exploreShowTitle} onChange={() => e.setExploreShowTitle(!e.exploreShowTitle)} aria-label="Show title" />
          </div>
        </div>
        <div className="pt-2"><SaveButton onClick={onSave} saving={saving} /></div>
      </div>
    </Card>
  );
}
