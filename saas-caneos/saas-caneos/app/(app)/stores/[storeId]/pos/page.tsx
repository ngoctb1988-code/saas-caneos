import { getPosProducts } from "@/lib/queries/pos";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { PosInterface } from "./pos-interface";
export const dynamic = "force-dynamic";
export default async function PosPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  await requireStoreAccess(storeId, ["staff","manager","owner"]);
  const { products, categories } = await getPosProducts(storeId);
  return (
    <div className="-mx-4 -mt-6 px-4 pt-4 pb-0 lg:-mx-8 lg:px-8 lg:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bán hàng (POS)</h1>
          <p className="text-sm text-muted-foreground">Chọn món → Thanh toán. Tồn kho tự trừ.</p>
        </div>
      </div>
      <PosInterface storeId={storeId} products={products} categories={categories} />
    </div>
  );
}
