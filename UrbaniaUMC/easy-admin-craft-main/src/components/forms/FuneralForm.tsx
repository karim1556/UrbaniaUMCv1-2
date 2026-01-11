import React from 'react';

const requiredFields = ['deceasedName','dateOfDeath','contactPerson'];

const FuneralForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Deceased Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.deceasedName||''} onChange={e=>update('deceasedName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Date of Death *</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={formData.dateOfDeath||''} onChange={e=>update('dateOfDeath', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Contact Person *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.contactPerson||''} onChange={e=>update('contactPerson', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Relationship to Deceased</label>
        <input className="w-full border rounded px-3 py-2" value={formData.relationship||''} onChange={e=>update('relationship', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Burial Type</label>
        <select className="w-full border rounded px-3 py-2" value={formData.burialType||''} onChange={e=>update('burialType', e.target.value)}>
          <option value="">Select</option>
          <option value="local">Local</option>
          <option value="overseas">Overseas</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Ghusl Required?</label>
        <select className="w-full border rounded px-3 py-2" value={formData.ghuslRequired||''} onChange={e=>update('ghuslRequired', e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Janazah Location</label>
        <input className="w-full border rounded px-3 py-2" value={formData.janazahLocation||''} onChange={e=>update('janazahLocation', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Emergency Contact</label>
        <input className="w-full border rounded px-3 py-2" value={formData.emergencyContact||''} onChange={e=>update('emergencyContact', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Special Instructions</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.specialInstructions||''} onChange={e=>update('specialInstructions', e.target.value)} />
      </div>
    </div>
  );
};

(FuneralForm as any).requiredFields = requiredFields;
export default FuneralForm;
