import React, { useEffect, useState } from 'react';
import { Save, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { api, errorMessage } from '../api';
import { PageHeader, Card, Button, Loading, Toast } from '../components/UI';

const defaults = [
  ['ORGANIZATION_NAME', 'Organization name', Building2],
  ['CONTACT_EMAIL', 'Contact email', Mail],
  ['CONTACT_PHONE', 'Contact phone', Phone],
  ['OFFICE_ADDRESS', 'Office address', MapPin],
];

export default function Settings() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then((response) => {
        const mapped = {};
        response.data.forEach((setting) => {
          mapped[setting.key] = setting.value || '';
        });
        setValues(mapped);
      })
      .catch((error) => setToast({ type: 'error', message: errorMessage(error) }))
      .finally(() => setLoading(false));
  }, []);

  const saveSetting = async (key) => {
    setSaving(key);
    try {
      await api.put('/settings', { key, value: values[key] || '' });
      setToast({ message: 'Setting saved' });
    } catch (error) {
      setToast({ type: 'error', message: errorMessage(error) });
    } finally {
      setSaving('');
    }
  };

  return (
    <>
      <PageHeader title="System settings" description="Configure organization details displayed across the administration system." />
      {loading ? <Loading /> : (
        <div className="settings-grid">
          {defaults.map(([key, label, Icon]) => (
            <Card className="setting-card" key={key}>
              <div className="setting-icon"><Icon /></div>
              <div>
                <label>{label}</label>
                <input value={values[key] || ''} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />
              </div>
              <Button loading={saving === key} onClick={() => saveSetting(key)}><Save /> Save</Button>
            </Card>
          ))}
        </div>
      )}
      <Card className="info-banner"><div><h3>Security reminder</h3><p>Keep JWT secrets and database credentials in environment variables before production deployment.</p></div></Card>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
