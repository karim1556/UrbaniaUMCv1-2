import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { servicePostService } from '@/services/servicePost.service';
import { useNavigate } from 'react-router-dom';
import ServiceForm from '@/components/ServiceForm';

export const SERVICE_OPTIONS = [
  { id: 'newcomer', label: 'Newcomer Support (Ansar)' },
  { id: 'medical', label: 'Medical Clinic' },
  { id: 'financial', label: 'Financial Aid' },
  { id: 'social', label: 'Social Services' },
  { id: 'education', label: 'Educational Programs' },
  { id: 'nikah', label: 'Nikah Services' },
  { id: 'funeral', label: 'Funeral Support' },
  { id: 'facilities', label: 'Facilities Services' },
  { id: 'new-muslim', label: 'New Muslim Service' },
  { id: 'special-needs', label: 'Special Needs Services' },
  { id: 'matrimony', label: 'Matrimony Services' }
];

const CreateServicePage = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(SERVICE_OPTIONS[0].id);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [imagesCsv, setImagesCsv] = useState('');

  // Full form definitions per service. Each key maps to an array of fields rendered for that service.
  const FIELD_DEFINITIONS: Record<string, Array<{ name: string; label: string; type?: string; placeholder?: string; options?: string[] }>> = {
    newcomer: [
      { name: 'contactPerson', label: 'Contact Person' },
      { name: 'languages', label: 'Languages (comma separated)', placeholder: 'e.g. Urdu, English' },
      { name: 'supportTypes', label: 'Support Types', placeholder: 'e.g. Housing, Language, Jobs' },
      { name: 'availability', label: 'Availability Notes', placeholder: 'Days / times' }
    ],
    medical: [
      { name: 'doctorName', label: 'Doctor / Clinic Contact' },
      { name: 'clinicHours', label: 'Clinic Hours', placeholder: 'e.g. Mon-Fri 9-5' },
      { name: 'servicesOffered', label: 'Services Offered', placeholder: 'e.g. Consultations, Screenings' },
      { name: 'cost', label: 'Cost / Free Notes', placeholder: 'e.g. Free or $10 per visit' }
    ],
    financial: [
      { name: 'assistanceType', label: 'Assistance Type', placeholder: 'Emergency, Rent, Bills' },
      { name: 'maxAmount', label: 'Max Amount (optional)', type: 'number' },
      { name: 'eligibility', label: 'Eligibility Criteria', placeholder: 'Who qualifies' },
      { name: 'howToApply', label: 'How to Apply', placeholder: 'Apply via phone/email' }
    ],
    social: [
      { name: 'programName', label: 'Program Name' },
      { name: 'targetGroup', label: 'Target Group', placeholder: 'e.g. Families, Youth' },
      { name: 'schedule', label: 'Schedule / Times' },
      { name: 'notes', label: 'Notes', placeholder: 'Additional info' }
    ],
    education: [
      { name: 'programName', label: 'Program Name' },
      { name: 'ageGroup', label: 'Age Group', placeholder: 'e.g. 5-12, Adults' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'duration', label: 'Duration', placeholder: 'e.g. 8 weeks' }
    ],
    nikah: [
      { name: 'officiant', label: 'Officiant Name' },
      { name: 'venue', label: 'Venue' },
      { name: 'availableDates', label: 'Available Dates', placeholder: 'Comma separated dates' },
      { name: 'requirements', label: 'Requirements / Documents' }
    ],
    funeral: [
      { name: 'services', label: 'Services Provided', placeholder: 'e.g. Ghusl, Janazah, Burial' },
      { name: 'contact', label: 'Contact Person / Phone' },
      { name: 'coverage', label: 'Coverage Area / Notes' }
    ],
    facilities: [
      { name: 'capacity', label: 'Capacity', type: 'number' },
      { name: 'availableFrom', label: 'Available From', type: 'date' },
      { name: 'availableTo', label: 'Available To', type: 'date' },
      { name: 'price', label: 'Price (if any)' }
    ],
    'new-muslim': [
      { name: 'mentor', label: 'Mentor / Contact' },
      { name: 'resources', label: 'Resources Available', placeholder: 'e.g. Classes, Mentoring' },
      { name: 'schedule', label: 'Schedule / Times' }
    ],
    'special-needs': [
      { name: 'serviceTypes', label: 'Service Types', placeholder: 'e.g. Therapy, Education Support' },
      { name: 'accessibility', label: 'Accessibility Features', placeholder: 'e.g. Wheelchair access' },
      { name: 'contact', label: 'Contact Person' }
    ],
    matrimony: [
      { name: 'candidateName', label: 'Candidate Name', placeholder: 'Full name' },
      { name: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 28' },
      { name: 'gender', label: 'Gender', placeholder: 'Male / Female / Other' },
      { name: 'location', label: 'Location', placeholder: 'City, State' },
      { name: 'religion', label: 'Religion', placeholder: 'e.g. Sunni' },
      { name: 'education', label: 'Education / Profession', placeholder: 'e.g. BSc, Engineer' },
      { name: 'additionalDetails', label: 'Additional Details', placeholder: 'Bio, expectations' }
    ]
  };

  const currentFields = FIELD_DEFINITIONS[type] || [];
  const navigate = useNavigate();

  const images = imagesCsv.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Service</h1>
          <p className="text-muted-foreground">Create a service template (admin)</p>
        </div>
      </div>

      <Card className="shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="pb-3 bg-gray-50 rounded-t-xl border-b border-gray-200">
          <CardTitle>New Service</CardTitle>
          <CardDescription>Define a new service offering for the site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <Input placeholder="Service Title" value={title} onChange={e => setTitle(e.target.value)} />
            <select className="border rounded px-2 py-2 w-48" value={type} onChange={e => setType(e.target.value)}>
              {SERVICE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <Input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input placeholder="Images (comma separated URLs, optional)" value={imagesCsv} onChange={e => setImagesCsv(e.target.value)} />

            {/* Render the per-service form component which handles its own validation and submission */}
            <div className="pt-2">
              <ServiceForm service={type} title={title} description={description} phone={phone} images={images} onSuccess={() => navigate('/admin/services')} />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => navigate('/admin/services')}>Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateServicePage;
