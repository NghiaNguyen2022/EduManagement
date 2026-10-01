'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PaymentPanel, RecoveryPanel, ResultPreview, type AccessJob } from '../../excel/access-panel';
async function readJob(id: string): Promise<AccessJob> { const r = await fetch('/api/tools/jobs/' + encodeURIComponent(id), { cache: 'no-store' }); const data = await r.json(); if (!r.ok) throw new Error(data.error); return data; }
export default function Checkout({ id }: { id: string }) {
  const [job, setJob] = useState<AccessJob | null>(null), [error, setError] = useState('');
  const refresh = useCallback(async () => { const data = await readJob(id); setJob(data); setError(''); }, [id]);
  useEffect(() => {
    let active = true;
    void readJob(id).then(data => { if (active) setJob(data); }).catch(e => { if (active) setError(e.message); });
    const timer = setInterval(() => { void readJob(id).then(data => { if (active) { setJob(data); setError(''); } }).catch(e => { if (active) setError(e.message); }); }, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [id]);
  return <><Link className="vt-back" href="/tools/excel">← Excel Rescue</Link><h1>Kết quả & giao dịch</h1>{error && <p className="vt-error" role="alert">{error} Nếu mở trên thiết bị khác, hãy quét QR hoặc mở liên kết khôi phục đã lưu.</p>}{job && <><PaymentPanel job={job} refresh={refresh} /><RecoveryPanel job={job} /><ResultPreview job={job} /></>}</>;
}
