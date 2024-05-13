import { Spinner } from '@/components/ui/Spinner';
import { useDropZone, useFileUpload, useUploader } from './hooks';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { ChangeEvent, useCallback } from 'react';
import { UIButton } from '@/components/ui/button';

export const ImageUploader = ({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) => {
  const { loading, uploadFile } = useUploader({ onUpload });
  const { handleUploadClick, ref } = useFileUpload();
  const { draggedInside, onDrop, onDragEnter, onDragLeave } = useDropZone({
    uploader: uploadFile,
  });

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      // @ts-ignore
      e.target.files ? uploadFile(e.target.files[0]) : null,
    [uploadFile]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg min-h-[10rem]">
        <Spinner className="text-neutral-500" size={1.5} />
      </div>
    );
  }

  const wrapperClass = cn(
    'flex flex-col items-center justify-center px-8 py-10 rounded-lg',
    draggedInside && 'bg-neutral-100'
  );

  return (
    <div
      className={wrapperClass}
      onDrop={onDrop}
      onDragOver={onDragEnter}
      onDragLeave={onDragLeave}
      contentEditable={false}
    >
      <Icon name="Image" className="w-12 h-12 mb-4" strokeWidth={1.5} />
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-sm font-medium text-center">
          {draggedInside ? 'Drop image here' : 'Drop or'}
        </div>
        <div>
          <UIButton disabled={draggedInside} onClick={handleUploadClick}>
            <Icon
              name="Upload"
              className="mr-2 text-background"
              strokeWidth={1.5}
            />
            Upload an image
          </UIButton>
        </div>
      </div>
      <input
        className="w-0 h-0 overflow-hidden opacity-0"
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ImageUploader;
