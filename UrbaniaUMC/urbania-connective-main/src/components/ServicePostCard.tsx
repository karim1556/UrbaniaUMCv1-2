import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ServicePost } from "@/services/servicePostService";

const formatLabel = (key: string) => {
  const s = key.replace(/\.|_|-/g, ' ').replace(/([A-Z])/g, ' $1');
  return s
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatValue = (v: any) => {
  if (v === null || v === undefined || v === '') return null;
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

export interface ServicePostCardProps {
  post: ServicePost & { meta?: Record<string, any> };
  serviceId?: string;
}

const ServicePostCard: React.FC<ServicePostCardProps> = ({ post, serviceId }) => {
  const [open, setOpen] = useState(false);
  const entries: [string, any][] = (post.meta && Object.entries(post.meta) as [string, any][]) || [];
  const clean = entries.map(([k, v]) => ({ k, v: formatValue(v) })).filter((e: any) => e.v);
  const visible = clean.slice(0, 4);
  const extra = clean.slice(4);

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
      {post.images && post.images.length > 0 ? (
        <img src={post.images[0]} alt={post.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-sand-50 flex items-center justify-center text-muted-foreground">No image</div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{post.title}</h3>
            {post.description && (
              <p className="text-sm text-muted-foreground mt-1">{post.description.length > 120 ? post.description.slice(0,120) + '…' : post.description}</p>
            )}
          </div>
          <div className="text-right text-xs text-muted-foreground ml-4">
            <div>{post.phone ? `Phone: ${post.phone}` : ''}</div>
            <div className="mt-2">{new Date(post.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visible.map((e: any) => (
            <div key={e.k} className="bg-sand-50 text-xs text-muted-foreground px-3 py-1 rounded">{formatLabel(e.k)}: <span className="text-foreground font-medium">{e.v}</span></div>
          ))}
          {extra.length > 0 && (
            <button onClick={() => setOpen(s => !s)} className="text-xs text-primary underline ml-1">{open ? 'Hide' : `+${extra.length} more`}</button>
          )}
        </div>

        {open && extra.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
            {extra.map((e: any) => (
              <div key={e.k} className="flex items-start gap-3">
                <div className="text-xs text-muted-foreground w-32">{formatLabel(e.k)}</div>
                <div className="text-sm text-foreground break-words">{e.v}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{post.images?.length ? `${post.images.length} image${post.images.length>1?'s':''}` : ''}</div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to={`/contact?service=${serviceId}&post=${post._id}`}>Request</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePostCard;
