import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ProjectItem } from '../types';
import { ResilientImage } from './ResilientImage';

interface ProjectLightboxProps {
  project: ProjectItem | null;
  onClose: () => void;
  onRequestConsultation: (projectTitle: string) => void;
}

export function ProjectLightbox({
  project,
  onClose,
  onRequestConsultation,
}: ProjectLightboxProps) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-[#F5F1EA] dark:bg-[#1E1E1B] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12 shadow-2xl my-auto"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#252522]/85 text-[#F5F1EA] hover:bg-[#C6A15B] hover:text-[#141412] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 aspect-[4/3] lg:aspect-auto lg:min-h-[480px] bg-[#EFE9DF] dark:bg-[#141412]">
                <ResilientImage
                  src={project.imageUrl}
                  alt={`${project.title} — ${project.category} in ${project.location}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-9 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                    <span>{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{project.year}</span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
                    {project.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12 text-xs">
                    <div>
                      <p className="text-[#5A5851] dark:text-[#B8B2A6]">Area</p>
                      <p className="font-medium mt-0.5 tabular-nums">{project.area}</p>
                    </div>
                    <div>
                      <p className="text-[#5A5851] dark:text-[#B8B2A6]">Architectural Style</p>
                      <p className="font-medium mt-0.5">{project.style}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-[#5A5851] dark:text-[#B8B2A6]">
                    {project.summary}
                  </p>

                  {project.challenge && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold tracking-wide text-[#A8843F] dark:text-[#C6A15B]">
                        Spatial Brief
                      </h4>
                      <p className="text-xs leading-relaxed text-[#5A5851] dark:text-[#B8B2A6]">
                        {project.challenge}
                      </p>
                    </div>
                  )}

                  {project.solution && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold tracking-wide text-[#A8843F] dark:text-[#C6A15B]">
                        Material Resolution
                      </h4>
                      <p className="text-xs leading-relaxed text-[#5A5851] dark:text-[#B8B2A6]">
                        {project.solution}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRequestConsultation(project.title)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors"
                >
                  <span>Inquire About a Similar Space</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
