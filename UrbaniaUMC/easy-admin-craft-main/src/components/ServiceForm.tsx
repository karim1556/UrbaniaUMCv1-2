import React, { useState } from 'react';
import NewcomerForm from './forms/NewcomerForm';
import MedicalForm from './forms/MedicalForm';
import FinancialAidForm from './forms/FinancialAidForm';
import SocialServiceForm from './forms/SocialServiceForm';
import NikahForm from './forms/NikahForm';
import FuneralForm from './forms/FuneralForm';
import NewMuslimForm from './forms/NewMuslimForm';
import SpecialNeedForm from './forms/SpecialNeedForm';
import MatrimonyForm from './forms/MatrimonyForm';
import FacilityForm from './forms/FacilityForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { servicePostService } from '@/services/servicePost.service';

const FORM_MAP: Record<string, any> = {
  newcomer: NewcomerForm,
  medical: MedicalForm,
  financial: FinancialAidForm,
  social: SocialServiceForm,
  nikah: NikahForm,
  funeral: FuneralForm,
  'new-muslim': NewMuslimForm,
  'special-needs': SpecialNeedForm,
  matrimony: MatrimonyForm,
  facilities: FacilityForm
};

type Props = {
  service: string;
  title: string;
  description: string;
  phone?: string;
  images?: string[];
  onSuccess?: () => void;
};

const ServiceForm: React.FC<Props> = ({ service, title, description, phone, images, onSuccess }) => {
  const FormComp = FORM_MAP[service];
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  if (!service) return <div className="text-sm text-muted-foreground">Select a service to show its form.</div>;
  if (!FormComp) return <div className="text-sm text-red-600">No form available for this service.</div>;

  const handleSubmit = async () => {
    // basic required validation using schema provided by form component
    const required = FormComp.requiredFields || [];
    for (const key of required) {
      if (formData[key] === undefined || formData[key] === '') {
        toast.error(`Please fill ${key}`);
        return;
      }
    }

    if (!title) return toast.error('Title is required');

    setLoading(true);
    try {
      await servicePostService.createPost({ serviceId: service, title, description, phone, images, meta: formData });
      toast.success('Service post created');
      setFormData({});
      onSuccess && onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormComp formData={formData} setFormData={setFormData} />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating…' : 'Create Post'}</Button>
      </div>
    </div>
  );
};

export default ServiceForm;
