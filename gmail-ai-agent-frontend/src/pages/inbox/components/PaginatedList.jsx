import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import EmailCard from "./EmailCard";
import CardSkeleton from "../../../components/skeleton/cardSkeleton";
import { useEmailFetchHook } from "../../../hooks/useEmailFetchHook";
import { useAuthUser } from "../../../hooks/useAuthUser";

export default function PaginatedList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { authUser } = useAuthUser();

  const { data, isLoading, isError, error } = useEmailFetchHook({
    userId: authUser.user?._id,
    page,
    limit,
  });

  const mails = data?.data || [];
  const totalPages = data?.pagination?.totalPages;
  const hasMoreData = page < totalPages;
  const isSyncing = !isLoading && !isError && mails.length < 5;

  const handleNext = e => {
    e.preventDefault();
    if (!isLoading && hasMoreData) setPage(prev => prev + 1);
  };

  const handlePrevious = e => {
    e.preventDefault();
    if (!isLoading && page > 1) setPage(prev => prev - 1);
  };

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        Error loading emails: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Inbox
          {/* Show a mini spinner in header if Syncing */}
          {isSyncing && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </h1>
        <span className="text-sm text-gray-500">
          Page {page} {totalPages > 1 && `of ${totalPages}`}
        </span>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          // 1. INITIAL LOADING (Skeletons)
          [...Array(limit)].map((_, i) => <CardSkeleton key={i} />)
        ) : isSyncing ? (
          <>
            {mails.map(mail => (
              <EmailCard key={mail._id || mail.id} data={mail} />
            ))}

            {/* The "Syncing" Placeholder Card */}
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-blue-700">
                Syncing your emails...
              </h3>
              <p className="text-blue-500 text-sm mt-2">
                We are fetching your history from the provider.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Found {mails.length} emails so far...
              </p>
            </div>
          </>
        ) : mails.length > 0 ? (
          // 3. SUCCESS STATE (More than 5 emails)
          mails.map(mail => <EmailCard key={mail._id || mail.id} data={mail} />)
        ) : (
          // 4. TRULY EMPTY STATE (0 emails and backend says done - rare if using syncing logic above)
          <div className="col-span-full py-20 text-center text-gray-500">
            No emails found.
          </div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      {/* Hide pagination if we are in the middle of a heavy sync */}
      {!isSyncing && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrevious}
                  className={
                    page === 1 || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm font-medium text-gray-600">
                  Page {page}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNext}
                  className={
                    !hasMoreData || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
