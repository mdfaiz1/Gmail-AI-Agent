import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Icons
import {
  ArrowLeft,
  Send,
  Clock,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  XCircle,
} from "lucide-react";

// Components & UI
import { Button } from "@/components/ui/button";

// Internal Utils & Hooks
import { sanitizeEmailHtml, formatDate, parseEmailAndName } from "../lib/utils";
import { useEmailDetailHook } from "../hooks/useEmailDetailHook";
import { useCancelSendMail } from "../hooks/useCancelSendMail";
import { sendMailReplyApi, regenerateEmailApi } from "../lib/api";

export default function EmailDetailPage() {
  /* -------------------------------------------------------------------------- */
  /* HOOKS & ROUTER                              */
  /* -------------------------------------------------------------------------- */
  const { emailId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Data Fetching
  const { data, isLoading, isError } = useEmailDetailHook(emailId);

  /* -------------------------------------------------------------------------- */
  /* STATE                                   */
  /* -------------------------------------------------------------------------- */
  const [draft, setDraft] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [status, setStatus] = useState("NEW");
  const [isDraftExpanded, setIsDraftExpanded] = useState(true);

  const textareaRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* DERIVED STATE                               */
  /* -------------------------------------------------------------------------- */
  // Status Checks
  const isProcessing = status === "NEW" || status === "PROCESSING";
  const isReadyToSend = status === "DRAFT_GENERATED";
  const isSending = status === "SENDING";
  const isCancelled = status === "CANCELLED";
  const isSent = status === "SENT";

  // General Disable Flag (Active during processing, sending, sent, or cancelled)
  const isActionDisabled = isProcessing || isSending || isSent || isCancelled;

  /* -------------------------------------------------------------------------- */
  /* EFFECTS                                   */
  /* -------------------------------------------------------------------------- */
  // Sync state with fetched data
  useEffect(() => {
    if (data?.data) {
      setDraft(data.data.generatedReply?.message || "");
      setMailSubject(data.data.generatedReply?.subject || "");
      setStatus(data.data.status || "NEW");
    }
  }, [data]);

  /* -------------------------------------------------------------------------- */
  /* MUTATIONS                                  */
  /* -------------------------------------------------------------------------- */

  // 1. Cancel Mutation
  const { mutate: cancelMutate, isPending: isCancelPending } =
    useCancelSendMail();

  // 2. Regenerate Mutation
  const regenerateMutation = useMutation({
    mutationFn: regenerateEmailApi,
    onSuccess: () => {
      toast.success("Regeneration started...");
      setStatus("PROCESSING"); // Optimistic update
      queryClient.invalidateQueries({ queryKey: ["emailDetail", emailId] });
    },
    onError: error => {
      const msg = error.response?.data?.message || "Failed to regenerate.";
      toast.error(msg);
    },
  });

  // 3. Send Reply Mutation
  const replyMutation = useMutation({
    mutationFn: sendMailReplyApi,
    onSuccess: () => {
      toast.success("Reply sent successfully!");
      setStatus("SENT"); // Optimistic update
      queryClient.invalidateQueries({ queryKey: ["emailDetail", emailId] });
    },
    onError: error => {
      console.error("Error sending reply:", error);
      const msg = error.response?.data?.message || "Failed to send reply.";
      toast.error(msg);
      setStatus("DRAFT_GENERATED"); // Revert status on error
    },
  });

  /* -------------------------------------------------------------------------- */
  /* HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  const handleRegenerateEmail = () => {
    if (isProcessing) {
      toast.info("Already processing...");
      return;
    }
    const newData = {
      newStatus: "PROCESSING",
      subject: mailSubject,
      newMsg: draft,
    };
    regenerateMutation.mutate({ emailId, newData });
  };

  const handleCancel = () => {
    const payload = {
      emailId: emailId,
      status: "CANCELLED",
    };

    // Pass onSuccess here to update local state immediately
    cancelMutate(payload, {
      onSuccess: () => {
        setStatus("CANCELLED");
      },
    });
  };

  const handleSendMail = () => {
    if (!isReadyToSend) return;
    setStatus("SENDING");
    replyMutation.mutate(emailId);
  };

  /* -------------------------------------------------------------------------- */
  /* LOADING & ERROR                               */
  /* -------------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-gray-400 h-8 w-8" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen text-red-500 bg-gray-50">
        <AlertCircle size={32} />
        <p>Failed to load email details.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* DATA PARSING                                */
  /* -------------------------------------------------------------------------- */
  const email = data.data.originalMessage ?? {};
  const {
    subject = "(No Subject)",
    sender = "",
    snippet = "",
    receivedAt,
  } = email;

  const safeHtml = sanitizeEmailHtml(snippet);
  const date = formatDate(receivedAt);
  const fromResult = parseEmailAndName(sender);

  /* -------------------------------------------------------------------------- */
  /* RENDER                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* --- HEADER --- */}
      <header className="bg-white border-b px-4 py-3 shadow-sm z-10">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 min-w-0 items-center">
            <button
              onClick={() => navigate("/inbox")}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate font-semibold text-gray-900 text-lg">
                {subject}
              </h1>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">
                  {fromResult?.name || "Unknown"}
                </span>
                <span className="text-gray-300">|</span>
                <span>{fromResult?.email || "—"}</span>
                <span className="text-gray-300">|</span>
                <Clock size={12} className="inline mr-1" />
                <span>{date}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- EMAIL BODY (IFRAME) --- */}
      <div className="flex-1 relative bg-white w-full">
        <iframe
          title="email-body"
          srcDoc={safeHtml}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full border-none no-scrollbar"
        />
      </div>

      {/* --- DRAFT & ACTIONS SECTION --- */}
      <div
        className={`bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 z-20 flex flex-col
        ${isDraftExpanded ? "h-[50vh] max-h-[500px]" : "h-12"}`}
      >
        {/* Toggle Header */}
        <div
          className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
          onClick={() => setIsDraftExpanded(!isDraftExpanded)}
        >
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={18} />
            <span className="font-semibold text-sm">AI Generated Draft</span>
            {/* Status Badges */}
            {isProcessing && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Generating...
              </span>
            )}
            {isCancelled && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Cancelled
              </span>
            )}
            {isSent && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Sent
              </span>
            )}
          </div>
          {isDraftExpanded ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronUp size={18} />
          )}
        </div>

        {/* Content Area */}
        {isDraftExpanded && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Editor Container */}
            <div className="flex-1 p-4 overflow-hidden">
              {isProcessing ? (
                /* --- STATE: GENERATING --- */
                <div className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
                  <span className="text-sm font-medium text-zinc-500 animate-pulse text-center">
                    Analyzing email context... <br />
                    Drafting response...
                  </span>
                </div>
              ) : isSending ? (
                /* --- STATE: SENDING --- */
                <div className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50">
                  <Send className="h-8 w-8 text-indigo-500 mb-3 animate-bounce" />
                  <span className="text-sm font-medium text-zinc-500 animate-pulse text-center">
                    Sending your reply...
                  </span>
                </div>
              ) : isCancelled ? (
                /* --- STATE: CANCELLED --- */
                <div className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-red-50/50">
                  <XCircle className="h-10 w-10 text-red-300 mb-2" />
                  <p className="text-red-800 font-medium">
                    This draft has been cancelled.
                  </p>
                  <p className="text-red-500 text-xs">
                    Regenerate to start over.
                  </p>
                </div>
              ) : (
                /* --- STATE: EDITOR --- */
                <div className="flex flex-col h-full w-full rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  {/* Subject Input */}
                  <div className="px-4 py-3 border-b border-zinc-100 bg-gray-50/50">
                    <input
                      type="text"
                      disabled={isActionDisabled}
                      placeholder="Subject"
                      value={mailSubject}
                      onChange={e => setMailSubject(e.target.value)}
                      className="w-full text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none bg-transparent disabled:opacity-50"
                    />
                  </div>

                  {/* Body Textarea */}
                  <textarea
                    ref={textareaRef}
                    disabled={isActionDisabled}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Draft will appear here..."
                    className="flex-1 w-full resize-none p-4 text-sm leading-relaxed text-zinc-800 placeholder:text-zinc-400 outline-none bg-transparent disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center gap-4">
              {/* Left Action: Regenerate */}
              <button
                // We enable regenerate if it's disabled, BUT allow if it's specifically cancelled
                disabled={isActionDisabled && !isCancelled}
                onClick={handleRegenerateEmail}
                className="px-4 py-2 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Regenerate
              </button>

              {/* Right Actions: Cancel & Send */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  // DISABLED LOGIC FIX:
                  // 1. isCancelPending: freeze while loading
                  // 2. isCancelled: freeze if already done
                  // 3. isSent: freeze if sent
                  disabled={isCancelPending || isCancelled || isSent}
                  onClick={handleCancel}
                  className="h-9 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 disabled:opacity-50"
                >
                  {isCancelPending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />{" "}
                      Canceling
                    </>
                  ) : (
                    "Cancel Draft"
                  )}
                </Button>

                <button
                  disabled={!isReadyToSend}
                  onClick={handleSendMail}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-md text-xs font-medium shadow-sm transition-all
                    ${
                      !isReadyToSend
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                    }
                  `}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reply <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
