import React from 'react';

const requiredFields = ['patientName','preferredDate','consent'];

const MedicalForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Patient Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.patientName||''} onChange={e=>update('patientName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Age</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.age||''} onChange={e=>update('age', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Gender</label>
        <input className="w-full border rounded px-3 py-2" value={formData.gender||''} onChange={e=>update('gender', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Contact Number</label>
        <input className="w-full border rounded px-3 py-2" value={formData.contactNumber||''} onChange={e=>update('contactNumber', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Health Issue Category</label>
        <select className="w-full border rounded px-3 py-2" value={formData.issueCategory||''} onChange={e=>update('issueCategory', e.target.value)}>
          <option value="">Select</option>
          <option value="general">General</option>
          <option value="dental">Dental</option>
          <option value="mental">Mental Health</option>
          <option value="chronic">Chronic Illness</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Symptoms</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.symptoms||''} onChange={e=>update('symptoms', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Existing Medical Conditions</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.existingConditions||''} onChange={e=>update('existingConditions', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Current Medication (yes/no + details)</label>
        <input className="w-full border rounded px-3 py-2" value={formData.currentMedication||''} onChange={e=>update('currentMedication', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Preferred Appointment Date *</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={formData.preferredDate||''} onChange={e=>update('preferredDate', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Emergency Level</label>
        <select className="w-full border rounded px-3 py-2" value={formData.emergencyLevel||''} onChange={e=>update('emergencyLevel', e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="inline-flex items-center">
          <input type="checkbox" className="mr-2" checked={!!formData.consent} onChange={e=>update('consent', e.target.checked)} />
          <span className="text-sm">I consent to receive medical care *</span>
        </label>
      </div>
    </div>
  );
};

(MedicalForm as any).requiredFields = requiredFields;
export default MedicalForm;
