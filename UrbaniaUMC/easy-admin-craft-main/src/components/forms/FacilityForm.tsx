import React from 'react';

const requiredFields = ['requesterName','facilityType','dateTime','expectedAttendees'];

const FacilityForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Requester Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.requesterName||''} onChange={e=>update('requesterName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Facility Type *</label>
        <select className="w-full border rounded px-3 py-2" value={formData.facilityType||''} onChange={e=>update('facilityType', e.target.value)}>
          <option value="">Select</option>
          <option value="hall">Hall</option>
          <option value="classroom">Classroom</option>
          <option value="conference">Conference Room</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Purpose of Use</label>
        <input className="w-full border rounded px-3 py-2" value={formData.purpose||''} onChange={e=>update('purpose', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Date & Time Slot *</label>
        <input type="datetime-local" className="w-full border rounded px-3 py-2" value={formData.dateTime||''} onChange={e=>update('dateTime', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Expected Attendees *</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.expectedAttendees||''} onChange={e=>update('expectedAttendees', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Equipment Required</label>
        <input className="w-full border rounded px-3 py-2" value={formData.equipment||''} onChange={e=>update('equipment', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Catering Needed?</label>
        <select className="w-full border rounded px-3 py-2" value={formData.catering||''} onChange={e=>update('catering', e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Special Arrangements</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.specialArrangements||''} onChange={e=>update('specialArrangements', e.target.value)} />
      </div>
    </div>
  );
};

(FacilityForm as any).requiredFields = requiredFields;
export default FacilityForm;
