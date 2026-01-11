import React from 'react';

const requiredFields = ['name','dateOfShahada'];

const NewMuslimForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.name||''} onChange={e=>update('name', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Age</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.age||''} onChange={e=>update('age', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Date of Shahada *</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={formData.dateOfShahada||''} onChange={e=>update('dateOfShahada', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Language Preference</label>
        <input className="w-full border rounded px-3 py-2" value={formData.language||''} onChange={e=>update('language', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Support Needed</label>
        <select className="w-full border rounded px-3 py-2" value={formData.supportNeeded||''} onChange={e=>update('supportNeeded', e.target.value)}>
          <option value="">Select</option>
          <option value="salah">Learning Salah</option>
          <option value="quran">Quran</option>
          <option value="integration">Community Integration</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Mentor Request?</label>
        <select className="w-full border rounded px-3 py-2" value={formData.mentorRequest||''} onChange={e=>update('mentorRequest', e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Preferred Meeting Mode</label>
        <select className="w-full border rounded px-3 py-2" value={formData.meetingMode||''} onChange={e=>update('meetingMode', e.target.value)}>
          <option value="in-person">In-person</option>
          <option value="online">Online</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.notes||''} onChange={e=>update('notes', e.target.value)} />
      </div>
    </div>
  );
};

(NewMuslimForm as any).requiredFields = requiredFields;
export default NewMuslimForm;
