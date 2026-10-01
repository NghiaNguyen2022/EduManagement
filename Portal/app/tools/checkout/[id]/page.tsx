import Checkout from './checkout';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <Checkout id={(await params).id} />; }
