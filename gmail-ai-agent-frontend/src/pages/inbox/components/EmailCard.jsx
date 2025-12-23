import React, { useEffect, useState } from "react"; // ✅ Added useEffect, useState
import { useNavigate } from "react-router-dom";
import {
  Send,
  Clock,
  X,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { parseEmailAndName, formatDate } from "../../../lib/utils";
import { useSendMailMutation } from "../../../hooks/useSendMailHook";

// ✅ Added onCancel to props
const EmailCard = ({ data, onCancel }) => {
  const [status, setStatus] = useState(data.status); // ✅ Used useState directly

  useEffect(() => {
    setStatus(data.status);
  }, [data.status]);

  const { mutate, isPending } = useSendMailMutation();

  const getStatusConfig = status => {
    const normalizedStatus = status?.toUpperCase();

    switch (normalizedStatus) {
      case "NEW":
        return {
          wrapperClass: "bg-blue-50 border-blue-200 text-blue-700",
          icon: <Sparkles size={12} className="text-blue-500" />,
          label: "New",
          renderIndicator: () => (
            <span className="relative flex h-1.5 w-1.5 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
          ),
        };
      case "DRAFT_GENERATED":
        return {
          wrapperClass:
            "bg-amber-50 border-amber-200 text-amber-700 animate-pulse",
          icon: <Bot size={12} className="text-amber-600" />,
          label: "Draft",
          renderIndicator: () => null,
        };
      case "SENT":
        return {
          wrapperClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
          icon: <CheckCircle2 size={12} className="text-emerald-600" />,
          label: "Sent",
          renderIndicator: () => null,
        };
      case "CANCELED":
        return {
          wrapperClass: "bg-red-50 border-red-200 text-red-700",
          icon: <AlertOctagon size={12} className="text-red-600" />,
          label: "Canceled",
          renderIndicator: () => null,
        };
      default:
        return {
          wrapperClass: "bg-gray-50 border-gray-200 text-gray-600",
          icon: null,
          label: status,
          renderIndicator: () => null,
        };
    }
  };

  const navigate = useNavigate();
  const statusConfig = getStatusConfig(data.status);

  const handleCardClick = id => {
    navigate(`/message-details/${id}`);
  };

  const senderResult = parseEmailAndName(data.originalMessage.sender);
  const formattedDate = formatDate(data.originalMessage.receivedAt);

  const handleSendClick = e => {
    e.stopPropagation(); // Prevent card click when clicking send
    // Ensure your mutate function expects an object if your API requires it
    console.log("Sending reply for email ID:", data._id);
    mutate({ emailId: data._id, newStatus: "SENDING" });
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Decorative accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 transition-colors duration-300 ${
          status === "NEW"
            ? "bg-blue-500"
            : status === "DRAFT_GENERATED"
            ? "bg-amber-500"
            : status === "SENT"
            ? "bg-emerald-500"
            : status === "CANCELED"
            ? "bg-red-500"
            : "bg-transparent"
        }`}
      />

      <div className="flex flex-col h-full justify-between">
        <div
          className="cursor-pointer"
          onClick={() => handleCardClick(data._id)}
        >
          {/* Header */}
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 shadow-inner">
                {typeof senderResult?.name === "string" &&
                senderResult.name.length > 0
                  ? senderResult.name.charAt(0)
                  : "U"}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-900 leading-none">
                  {senderResult.name || "Unknown Sender"}
                </h3>
                <p className="truncate text-[11px] text-gray-500 mt-0.5">
                  {senderResult.email || "No Email"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-100">
              <Clock size={10} />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-3 pl-[42px]">
            <h2 className="line-clamp-2 text-sm font-medium text-gray-800 leading-snug">
              {data.originalMessage.subject || "No Subject"}
            </h2>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-all duration-300 ${statusConfig.wrapperClass}`}
          >
            {statusConfig.renderIndicator()}
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {/* Cancel Button */}
            <button
              disabled={isPending || status === "SENT" || status === "FAILED"}
              onClick={e => {
                e.stopPropagation();
                onCancel && onCancel(data._id);
              }}
              className="group/btn flex items-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <X
                size={12}
                className="transition-transform group-hover/btn:rotate-90"
              />
              <span>Cancel</span>
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendClick} // ✅ Fixed: Passed function reference correctly
              disabled={
                isPending ||
                status === "SENDING" ||
                status === "SENT" ||
                status === "FAILED"
              } // ✅ Disabled conditions
              className="flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isPending || status === "SENDING" ? "Sending..." : "Reply"}
              </span>
              <Send size={12} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
