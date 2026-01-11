import React from 'react';

const requiredFields = ['fullName','dateOfArrival','typeOfHelp'];

const NewcomerForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.fullName||''} onChange={e=>update('fullName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Country of Origin</label>
        <input className="w-full border rounded px-3 py-2" value={formData.country||''} onChange={e=>update('country', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Date of Arrival *</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={formData.dateOfArrival||''} onChange={e=>update('dateOfArrival', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Language Preference (comma separated)</label>
        <input className="w-full border rounded px-3 py-2" value={formData.languages||''} onChange={e=>update('languages', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Family Size</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.familySize||''} onChange={e=>update('familySize', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Current Housing Status</label>
        <input className="w-full border rounded px-3 py-2" value={formData.housingStatus||''} onChange={e=>update('housingStatus', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Employment Status</label>
        <input className="w-full border rounded px-3 py-2" value={formData.employmentStatus||''} onChange={e=>update('employmentStatus', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Type of Help Needed *</label>
        <select className="w-full border rounded px-3 py-2" value={formData.typeOfHelp||''} onChange={e=>update('typeOfHelp', e.target.value)}>
          <option value="">Select</option>
          <option value="housing">Housing</option>
          <option value="language">Language</option>
          <option value="job">Job Assistance</option>
          <option value="legal">Legal Guidance</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Preferred Contact Method</label>
        <input className="w-full border rounded px-3 py-2" value={formData.contactMethod||''} onChange={e=>update('contactMethod', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Availability Days/Time</label>
        <input className="w-full border rounded px-3 py-2" value={formData.availability||''} onChange={e=>update('availability', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Additional Notes</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.notes||''} onChange={e=>update('notes', e.target.value)} />
      </div>
    </div>
  );
};

(NewcomerForm as any).requiredFields = requiredFields;
export default NewcomerForm;
