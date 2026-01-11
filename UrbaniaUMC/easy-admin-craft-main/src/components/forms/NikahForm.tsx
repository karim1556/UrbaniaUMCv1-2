import React from 'react';

const requiredFields = ['groomName','brideName','nikahDatePreference'];

const NikahForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Groom Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.groomName||''} onChange={e=>update('groomName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Bride Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.brideName||''} onChange={e=>update('brideName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Wali Name</label>
        <input className="w-full border rounded px-3 py-2" value={formData.waliName||''} onChange={e=>update('waliName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Nikah Date Preference *</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={formData.nikahDatePreference||''} onChange={e=>update('nikahDatePreference', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Nikah Location</label>
        <input className="w-full border rounded px-3 py-2" value={formData.nikahLocation||''} onChange={e=>update('nikahLocation', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Mahr Amount</label>
        <input className="w-full border rounded px-3 py-2" value={formData.mahrAmount||''} onChange={e=>update('mahrAmount', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Witness Names</label>
        <input className="w-full border rounded px-3 py-2" value={formData.witnessNames||''} onChange={e=>update('witnessNames', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Imam Required?</label>
        <select className="w-full border rounded px-3 py-2" value={formData.imamRequired||''} onChange={e=>update('imamRequired', e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Documents Uploaded (describe)</label>
        <input className="w-full border rounded px-3 py-2" value={formData.documents||''} onChange={e=>update('documents', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Contact Person</label>
        <input className="w-full border rounded px-3 py-2" value={formData.contactPerson||''} onChange={e=>update('contactPerson', e.target.value)} />
      </div>
    </div>
  );
};

(NikahForm as any).requiredFields = requiredFields;
export default NikahForm;
