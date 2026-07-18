import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useSecuritySettings, useIpAllowlist, useApiKeys } from '@/features/platform/ops';
import { useAuditLogEntries } from '@/features/platform/audit-log';
import { timeAgo } from '@/features/platform/audit';

export function SecurityScreen() {
  const { settings, toggleTwoFactor } = useSecuritySettings();
  const { ranges, add, remove } = useIpAllowlist();
  const { keys, revoke } = useApiKeys();
  const { entries } = useAuditLogEntries();

  const [showAdd, setShowAdd] = useState(false);
  const [cidr, setCidr] = useState('');
  const [label, setLabel] = useState('');

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    await add(cidr, label);
    setCidr('');
    setLabel('');
    setShowAdd(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Card className="flex-1 p-[18px]">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[13px] font-semibold">SSO / SAML</div>
            {settings?.ssoConnected && <span className="inline-flex items-center h-5 px-2.5 rounded-full text-[10px] font-medium bg-success-bg text-success-text">Connected</span>}
          </div>
          <div className="text-[12px] text-body">Internal team sign-in via Okta &middot; SCIM provisioning {settings?.scimEnabled ? 'on' : 'off'}</div>
        </Card>
        <Card className="flex-1 p-[18px]">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[13px] font-semibold">Two-factor enforcement</div>
            <button onClick={toggleTwoFactor} className={`w-[34px] h-[19px] rounded-full relative ${settings?.twoFactorEnforced ? 'bg-navy' : 'bg-borderStrong'}`}>
              <span className={`w-[15px] h-[15px] rounded-full bg-white absolute top-[2px] ${settings?.twoFactorEnforced ? 'right-[2px]' : 'left-[2px]'}`} />
            </button>
          </div>
          <div className="text-[12px] text-body">
            {settings?.twoFactorEnforced
              ? 'Required for all internal admins & billing roles — click the toggle to turn off.'
              : 'Not currently enforced — click the toggle to require 2FA for internal admins & billing roles.'}
          </div>
        </Card>
      </div>

      <Card className="p-[18px]">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[13px] font-semibold">IP allowlist</div>
          <Button variant="secondary" onClick={() => setShowAdd((s) => !s)}>+ Add range</Button>
        </div>
        {showAdd && (
          <form onSubmit={onAdd} className="flex items-center gap-2 mb-3">
            <input required value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="10.0.0.0/24" className="flex-1 h-8 px-2.5 rounded-control border-[0.5px] border-hairline text-[12px] font-mono outline-none" />
            <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="flex-1 h-8 px-2.5 rounded-control border-[0.5px] border-hairline text-[12px] outline-none" />
            <Button type="submit">Add</Button>
          </form>
        )}
        {ranges.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5 text-[12.5px] py-2 border-b-[0.5px] border-hairline last:border-0">
            <span className="font-mono w-[140px]">{r.cidr}</span>
            <span className="flex-1 text-body">{r.label}</span>
            <button onClick={() => remove(r)}><Icon name="close" size={15} className="text-label" /></button>
          </div>
        ))}
        {ranges.length === 0 && <p className="text-[12px] text-label">No IP ranges configured.</p>}
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Audit log</div>
        {entries.map((e) => (
          <div key={e.id} className="flex items-baseline gap-2.5 text-[12px] py-2 border-b-[0.5px] border-hairline last:border-0">
            <span className="font-semibold w-24 flex-shrink-0">{e.actor}</span>
            <span className="flex-1 text-body">{e.action} &middot; {e.target}</span>
            <span className="text-faint text-[11px] flex-shrink-0">{e.time}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="text-[12px] text-label">No audit entries yet.</p>}
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">API keys</div>
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_80px] pb-2 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span>Name</span><span>Scopes</span><span>Last used</span><span>Created</span><span />
        </div>
        {keys.map((k) => (
          <div key={k.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_80px] items-center py-2.5 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <span className="font-medium">{k.name}</span>
            <span className="font-mono text-[11.5px] text-body">{k.scopes}</span>
            <span className="text-label">{k.lastUsed ? timeAgo(k.lastUsed) : 'never'}</span>
            <span className="text-label">{new Date(k.created).toLocaleDateString()}</span>
            <button onClick={() => revoke(k)} className="text-danger text-[11.5px] font-semibold">Revoke</button>
          </div>
        ))}
        {keys.length === 0 && <p className="text-[12px] text-label">No API keys.</p>}
      </Card>
    </div>
  );
}
