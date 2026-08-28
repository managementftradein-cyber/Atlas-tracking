import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  in_transit: 'In Transit',
  arrived_at_facility: 'Arrived at Facility',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
};

// Called by a Postgres trigger (see supabase/notify_trigger.sql) whenever a
// row is inserted into tracking_events — not by the frontend directly. This
// means a customer gets emailed regardless of where the status update came
// from (admin panel, a script, direct SQL, etc).
export async function POST(req: Request) {
  if (req.headers.get('x-webhook-secret') !== process.env.SHIPMENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const shipmentId = body?.shipment_id;
  const eventId = body?.tracking_event_id;
  if (!shipmentId || !eventId) {
    return NextResponse.json({ error: 'missing shipment_id or tracking_event_id' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const [{ data: shipment }, { data: event }] = await Promise.all([
    admin.from('shipments').select('*').eq('id', shipmentId).single(),
    admin.from('tracking_events').select('*').eq('id', eventId).single(),
  ]);

  if (!shipment || !event) {
    // Nothing to notify about — respond 200 so the DB trigger doesn't retry forever.
    return NextResponse.json({ ok: false, reason: 'shipment or event not found' });
  }

  const { data: userRes } = await admin.auth.admin.getUserById(shipment.customer_id);
  const email = userRes?.user?.email;
  if (!email) {
    return NextResponse.json({ ok: false, reason: 'no email on file for customer' });
  }

  const statusLabel = STATUS_LABEL[event.status] || event.status;
  const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/track?number=${encodeURIComponent(shipment.tracking_number)}`;

  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `${shipment.tracking_number} — ${statusLabel}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#06101d;padding:32px;color:#eaf4fb;">
        <div style="max-width:520px;margin:0 auto;background:#0b1828;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,.08);">
          <p style="margin:0;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#26b7e8;font-weight:700;">Atlas Tracking</p>
          <h1 style="margin:12px 0 0;font-size:22px;">${statusLabel}</h1>
          <p style="margin:8px 0 0;color:#94a3b8;">Tracking number <b style="color:#eaf4fb;">${shipment.tracking_number}</b></p>
          <div style="margin:24px 0;padding:16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);">
            <p style="margin:0;font-size:13px;color:#64748b;">Location</p>
            <p style="margin:4px 0 0;font-weight:700;">${event.location || '—'}</p>
            ${event.description ? `<p style="margin:12px 0 0;color:#94a3b8;font-size:14px;">${event.description}</p>` : ''}
          </div>
          <p style="margin:0;color:#94a3b8;font-size:13px;">${shipment.origin} → ${shipment.destination}</p>
          <a href="${trackUrl}" style="display:inline-block;margin-top:20px;background:#26b7e8;color:#03101b;font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none;">Track this shipment</a>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
