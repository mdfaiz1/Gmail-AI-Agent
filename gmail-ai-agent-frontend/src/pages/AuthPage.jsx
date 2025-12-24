import { User } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useLoginHook } from "../hooks/useLoginHook";
import { toast } from "react-toastify";

const AuthPage = ({ refetchAuthUser }) => {
  const navigate = useNavigate();
  const loginMutation = useLoginHook();
  const responseGoogle = async response => {
    try {
      if (!response?.code) return;

      const res = await loginMutation.mutateAsync(response.code);

      if (res?.data?.success) {
        localStorage.setItem("gmail-user", JSON.stringify(res.data.user));

        await refetchAuthUser();
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("Google login failed");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Google login failed"),
    flow: "auth-code",
    scope: "openid email profile https://www.googleapis.com/auth/gmail.modify",
  });
  if (loginMutation.isPending) {
    return (
      <div className="flex flex-col gap-4 w-full h-screen items-center justify-center">
        <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
          <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
        </div>
      </div>
    );
  }
  return (
    // --- Main Background/Container (Same as before) ---
    <div
      className="flex justify-center items-center min-h-screen 
                       bg-linear-to-br from-gray-900 via-indigo-950 to-purple-900"
    >
      {/* --- Login Card (Frosted Glass Effect) --- */}
      <div
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 
                           w-96 max-w-full shadow-2xl shadow-purple-900/70 
                           border border-white/10 
                           flex flex-col-reverse items-center text-white"
      >
        <button
          className="relative inline-flex w-full items-center justify-center rounded-md border border-gray-400 bg-white px-3.5 py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black focus:outline-none cursor-pointer"
          type="button"
          onClick={googleLogin}
        >
          <span className="mr-2 inline-block">
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-rose-500"
            >
              <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
            </svg>
          </span>
          Sign in with Google
        </button>
        {/* --- Profile Icon: Using <User /> --- */}
        <div
          className="bg-white/20 rounded-full p-5 mb-8 
                               shadow-lg flex justify-center items-center"
        >
          {/* Size 60px corresponds roughly to w-16 and h-16 in Tailwind */}
          <User className="text-white w-16 h-16" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
