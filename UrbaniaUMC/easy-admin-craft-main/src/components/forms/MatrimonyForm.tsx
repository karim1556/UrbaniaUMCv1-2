import React from 'react';

const requiredFields = ['fullName','gender','age'];

const MatrimonyForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.fullName||''} onChange={e=>update('fullName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Gender *</label>
        <select className="w-full border rounded px-3 py-2" value={formData.gender||''} onChange={e=>update('gender', e.target.value)}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Age *</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.age||''} onChange={e=>update('age', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Marital Status</label>
        <input className="w-full border rounded px-3 py-2" value={formData.maritalStatus||''} onChange={e=>update('maritalStatus', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Education Level</label>
        <input className="w-full border rounded px-3 py-2" value={formData.educationLevel||''} onChange={e=>update('educationLevel', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Occupation</label>
        <input className="w-full border rounded px-3 py-2" value={formData.occupation||''} onChange={e=>update('occupation', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Ethnicity / Background</label>
        <input className="w-full border rounded px-3 py-2" value={formData.ethnicity||''} onChange={e=>update('ethnicity', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Preferences</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.preferences||''} onChange={e=>update('preferences', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Guardian Contact</label>
        <input className="w-full border rounded px-3 py-2" value={formData.guardianContact||''} onChange={e=>update('guardianContact', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Confidential Profile?</label>
        <select className="w-full border rounded px-3 py-2" value={formData.confidentialProfile||''} onChange={e=>update('confidentialProfile', e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  );
};

(MatrimonyForm as any).requiredFields = requiredFields;
export default MatrimonyForm;
