import React from 'react';

const requiredFields = ['applicantName','amountRequired','declaration'];

const FinancialAidForm = ({ formData, setFormData }: any) => {
  const update = (k: string, v: any) => setFormData((prev: any) => ({ ...prev, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Applicant Name *</label>
        <input className="w-full border rounded px-3 py-2" value={formData.applicantName||''} onChange={e=>update('applicantName', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Family Members Count</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.familyCount||''} onChange={e=>update('familyCount', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Monthly Income Range</label>
        <input className="w-full border rounded px-3 py-2" value={formData.incomeRange||''} onChange={e=>update('incomeRange', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Employment Status</label>
        <input className="w-full border rounded px-3 py-2" value={formData.employmentStatus||''} onChange={e=>update('employmentStatus', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Type of Aid Requested</label>
        <select className="w-full border rounded px-3 py-2" value={formData.aidType||''} onChange={e=>update('aidType', e.target.value)}>
          <option value="">Select</option>
          <option value="rent">Rent</option>
          <option value="medical">Medical</option>
          <option value="food">Food</option>
          <option value="education">Education</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Amount Required *</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={formData.amountRequired||''} onChange={e=>update('amountRequired', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Reason for Request</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[80px]" value={formData.reason||''} onChange={e=>update('reason', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Supporting Documents (describe/upload)</label>
        <input className="w-full border rounded px-3 py-2" value={formData.supportingDocs||''} onChange={e=>update('supportingDocs', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Urgency Level</label>
        <select className="w-full border rounded px-3 py-2" value={formData.urgency||''} onChange={e=>update('urgency', e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="inline-flex items-center">
          <input type="checkbox" className="mr-2" checked={!!formData.declaration} onChange={e=>update('declaration', e.target.checked)} />
          <span className="text-sm">I declare the information is true *</span>
        </label>
      </div>
    </div>
  );
};

(FinancialAidForm as any).requiredFields = requiredFields;
export default FinancialAidForm;
