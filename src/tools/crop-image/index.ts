<<<<<<< HEAD
import { Crop } from '@vicons/tabler';
=======
>>>>>>> sharevb/chore/all-my-stuffs
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.crop-image.title'),
  path: '/crop-image',
  description: translate('tools.crop-image.description'),
  keywords: ['crop', 'image', 'resize', 'canvas'],
  component: () => import('./crop-image.vue'),
<<<<<<< HEAD
  icon: Crop,
=======
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/Crop')),
>>>>>>> sharevb/chore/all-my-stuffs
  createdAt: new Date('2026-06-06'),
  category: 'Images',
});
