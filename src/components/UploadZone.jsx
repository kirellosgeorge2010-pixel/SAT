import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, Image, X } from 'lucide-react';
import clsx from 'clsx';

const ACCEPTED_TYPES = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

function FileIcon({ type }) {
  if (type === 'application/pdf') {
    return <FileText className="w-4 h-4 text-burgundy-light" />;
  }
  return <Image className="w-4 h-4 text-gold" />;
}

function Thumbnail({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const url = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="relative group flex-shrink-0 w-24 h-24 rounded-lg border border-border overflow-hidden bg-surface animate-fade-in">
      {isImage ? (
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-burgundy-muted">
          <FileText className="w-8 h-8 text-burgundy-light" />
          <span className="text-xs text-text-muted font-mono text-center px-1 leading-tight">PDF</span>
        </div>
      )}
      {/* Hover overlay with filename */}
      <div className="absolute inset-0 bg-base/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
        <span className="text-[10px] text-text-secondary leading-tight line-clamp-3 break-all">{file.name}</span>
      </div>
      {/* Remove button */}
      <button
        onClick={() => onRemove(file)}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-base/80 border border-border
                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                   hover:bg-error hover:border-error/50 text-text-muted hover:text-white"
        title="Remove file"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export function UploadZone({ files, onFilesAdd, onFileRemove, onProcess, isProcessing }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter(f => f.type in ACCEPTED_TYPES);
    if (valid.length > 0) onFilesAdd(valid);
  }, [onFilesAdd]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed',
          'cursor-pointer transition-all duration-200 p-10',
          isDragging
            ? 'border-gold bg-gold-muted drop-active'
            : 'border-border hover:border-gold/40 hover:bg-surface/50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Object.values(ACCEPTED_TYPES).join(',')}
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />

        <div className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
          isDragging ? 'bg-gold/20 scale-110' : 'bg-surface border border-border',
        )}>
          <Upload className={clsx('w-7 h-7 transition-colors', isDragging ? 'text-gold' : 'text-text-muted')} />
        </div>

        <div className="text-center">
          <p className={clsx('text-base font-semibold transition-colors', isDragging ? 'text-gold' : 'text-text-primary')}>
            {isDragging ? 'Drop files here' : 'Upload SAT questions or error log scans'}
          </p>
          <p className="text-sm text-text-muted mt-1">
            Drag & drop or click to browse · PDF, PNG, JPG, WebP supported
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['PDF', 'PNG', 'JPG', 'WebP'].map(ext => (
            <span key={ext} className="px-2 py-0.5 rounded text-xs font-mono bg-surface border border-border text-text-muted">
              {ext}
            </span>
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      {files.length > 0 && (
        <div className="card p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="section-label">Queued Files</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gold-muted text-gold font-semibold">
                {files.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary text-xs py-1"
                onClick={() => files.forEach(f => onFileRemove(f))}
                disabled={isProcessing}
              >
                Clear all
              </button>
              <button
                className="btn-primary text-sm py-1.5"
                onClick={onProcess}
                disabled={isProcessing || files.length === 0}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 56" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Analyze with AI
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {files.map(file => (
              <Thumbnail
                key={`${file.name}-${file.size}`}
                file={file}
                onRemove={onFileRemove}
              />
            ))}
          </div>

          <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
            <FileIcon type={files.some(f => f.type === 'application/pdf') ? 'application/pdf' : 'image/jpeg'} />
            {files.filter(f => f.type === 'application/pdf').length} PDF
            {files.filter(f => f.type === 'application/pdf').length !== 1 ? 's' : ''} ·{' '}
            {files.filter(f => f.type.startsWith('image/')).length} image
            {files.filter(f => f.type.startsWith('image/')).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
