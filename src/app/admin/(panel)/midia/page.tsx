import { requireUser } from '@/lib/auth/session';
import { listMedia } from '@/lib/media';
import { PageTitle } from '@/components/admin/ui';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export default async function MediaPage() {
  await requireUser();
  const items = listMedia().map((m) => ({ ...m, url: `/media/${m.file}` }));
  return (
    <>
      <PageTitle title="Mídia" desc="Imagens são verificadas, convertidas para WebP, redimensionadas e têm metadados (como localização) removidos no envio." />
      <MediaLibrary initial={items} />
    </>
  );
}
