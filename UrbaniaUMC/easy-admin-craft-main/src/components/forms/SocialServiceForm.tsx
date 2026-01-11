import React from 'react';

const requiredFields = ['applicantName','typeOfSupport'];

const SocialServiceForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Applicant Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.applicantName||''} onChange={e=>update('applicantName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Type of Support Needed *</label>
        <select className="w-full border rounded px-3 py-2" value={formData.typeOfSupport||''} onChange={e=>update('typeOfSupport', e.target.value)}>
          <option value="">Select</option>
          <option value="counseling">Counseling</option>
          <option value="family_dispute">Family Dispute</option>
          <option value="elder_care">Elder Care</option>
          <option value="community_referral">Community Referral</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Description of Issue</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.description||''} onChange={e=>update('description', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Preferred Language</label>
        <input className="w-full border rounded px-3 py-2" value={formData.language||''} onChange={e=>update('language', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Is Confidential?</label>
        <select className="w-full border rounded px-3 py-2" value={formData.isConfidential||''} onChange={e=>update('isConfidential', e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Preferred Mode</label>
        <select className="w-full border rounded px-3 py-2" value={formData.preferredMode||''} onChange={e=>update('preferredMode', e.target.value)}>
          <option value="in-person">In-person</option>
          <option value="phone">Phone</option>
          <option value="online">Online</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Availability</label>
        <input className="w-full border rounded px-3 py-2" value={formData.availability||''} onChange={e=>update('availability', e.target.value)} />
      </div>
    </div>
  );
};

(SocialServiceForm as any).requiredFields = requiredFields;
export default SocialServiceForm;
