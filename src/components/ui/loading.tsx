import { Skeleton } from "@/components/ui/skeleton";

export function CertificateTableSkeleton() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[40px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceIdTableSkeleton() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[40px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificateDetailsSkeleton() {
  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-6 w-[200px]" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      ))}
    </div>
  );
}