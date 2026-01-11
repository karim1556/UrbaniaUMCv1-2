import React from 'react';

const requiredFields = ['applicantName','typeOfNeed','careDuration'];

const SpecialNeedForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Applicant Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.applicantName||''} onChange={e=>update('applicantName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Type of Special Need</label>
        <select className="w-full border rounded px-3 py-2" value={formData.typeOfNeed||''} onChange={e=>update('typeOfNeed', e.target.value)}>
          <option value="">Select</option>
          <option value="physical">Physical</option>
          <option value="mental">Mental</option>
          <option value="developmental">Developmental</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Age Group</label>
        <input className="w-full border rounded px-3 py-2" value={formData.ageGroup||''} onChange={e=>update('ageGroup', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Required Support</label>
        <input className="w-full border rounded px-3 py-2" value={formData.requiredSupport||''} onChange={e=>update('requiredSupport', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Caregiver</label>
        <input className="w-full border rounded px-3 py-2" value={formData.caregiver||''} onChange={e=>update('caregiver', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Therapy</label>
        <input className="w-full border rounded px-3 py-2" value={formData.therapy||''} onChange={e=>update('therapy', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Accessibility</label>
        <input className="w-full border rounded px-3 py-2" value={formData.accessibility||''} onChange={e=>update('accessibility', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Medical Certificate (describe/upload)</label>
        <input className="w-full border rounded px-3 py-2" value={formData.medicalCertificate||''} onChange={e=>update('medicalCertificate', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Care Duration *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.careDuration||''} onChange={e=>update('careDuration', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Emergency Contact</label>
        <input className="w-full border rounded px-3 py-2" value={formData.emergencyContact||''} onChange={e=>update('emergencyContact', e.target.value)} />
      </div>
    </div>
  );
};

(SpecialNeedForm as any).requiredFields = requiredFields;
export default SpecialNeedForm;
