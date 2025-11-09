import React from 'react';

const SkeletonElement: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-slate-300/50 dark:bg-gray-700/50 rounded animate-shimmer ${className}`} />
);

const AnalysisResultSkeleton: React.FC = () => {
    return (
        <div className="w-full max-w-4xl p-4 sm:p-6 bg-slate-200/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-300/50 dark:border-gray-700/50">
            <div className="text-center mb-6">
                <SkeletonElement className="h-10 w-3/4 mx-auto mb-4" />
                
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    <SkeletonElement className="h-7 w-24 rounded-full" />
                    <SkeletonElement className="h-7 w-20 rounded-full" />
                    <SkeletonElement className="h-7 w-28 rounded-full" />
                </div>
                <div className="space-y-2 mt-4">
                    <SkeletonElement className="h-4 w-full" />
                    <SkeletonElement className="h-4 w-5/6 mx-auto" />
                </div>
            </div>
            
            <div className="mt-6">
                <div className="flex gap-2 sm:space-x-2 justify-center overflow-x-auto border-b border-slate-300 dark:border-gray-700 pb-2">
                    <SkeletonElement className="h-10 w-24" />
                    <SkeletonElement className="h-10 w-24" />
                    <SkeletonElement className="h-10 w-24" />
                </div>
                <div className="py-4 space-y-3">
                    <div className="p-4 rounded-md border-l-4 border-slate-400/50 dark:border-gray-600/50">
                        <SkeletonElement className="h-6 w-1/2 mb-2" />
                        <SkeletonElement className="h-4 w-1/3 mb-3" />
                        <SkeletonElement className="h-4 w-full" />
                        <SkeletonElement className="h-4 w-full mt-1" />
                    </div>
                    <div className="p-4 rounded-md border-l-4 border-slate-400/50 dark:border-gray-600/50">
                        <SkeletonElement className="h-6 w-2/3 mb-2" />
                        <SkeletonElement className="h-4 w-1/4 mb-3" />
                        <SkeletonElement className="h-4 w-full" />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <SkeletonElement className="h-7 w-1/3 mx-auto mb-3" />
                <div className="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-slate-300 dark:border-gray-700 space-y-3">
                    <div className="p-3">
                        <SkeletonElement className="h-5 w-1/2 mb-2" />
                        <SkeletonElement className="h-4 w-full" />
                    </div>
                    <div className="p-3">
                        <SkeletonElement className="h-5 w-1/2 mb-2" />
                        <SkeletonElement className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                <SkeletonElement className="h-7 w-1/4 mb-3" />
                <div className="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-slate-300 dark:border-gray-700">
                    <SkeletonElement className="h-4 w-full" />
                </div>
            </div>
        </div>
    );
};

export default AnalysisResultSkeleton;
