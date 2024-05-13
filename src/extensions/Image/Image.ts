import { Image as BaseImage } from '@tiptap/extension-image';

export const Image = BaseImage.extend({
  group: 'block',
  draggable: false,
});

export default Image;
