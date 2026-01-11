import React, { useState } from 'react';
import ServiceForm from '@/components/ServiceForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SERVICE_OPTIONS } from './admin/CreateService';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateService() {
  const [service, setService] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [imagesCsv, setImagesCsv] = useState('');
  const navigate = useNavigate();

  const images = imagesCsv.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Service</h1>

      <div className="space-y-4">
        <Input placeholder="Title" value={title} onChange={(e:any)=>setTitle(e.target.value)} />
        <select className="w-full border p-2 rounded mb-2" value={service} onChange={(e)=>setService(e.target.value)}>
          <option value="">Select Service</option>
          {SERVICE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
        <Textarea placeholder="Description" value={description} onChange={(e:any)=>setDescription(e.target.value)} />
        <Input placeholder="Phone (optional)" value={phone} onChange={(e:any)=>setPhone(e.target.value)} />
        <Input placeholder="Images (comma separated URLs)" value={imagesCsv} onChange={(e:any)=>setImagesCsv(e.target.value)} />

        <div className="mt-4">
          <ServiceForm service={service} title={title} description={description} phone={phone} images={images} onSuccess={() => navigate('/admin/services')} />
        </div>
      </div>
    </div>
  );
}
