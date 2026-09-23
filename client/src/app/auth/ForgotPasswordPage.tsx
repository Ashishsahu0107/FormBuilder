import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";

type Step = "email" | "otp" | "success";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits");
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(email, otp, password);
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80")',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="w-full shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 text-center relative">
            {step !== "success" && (
              <button
                onClick={() =>
                  step === "otp" ? setStep("email") : navigate("/login")
                }
                className="absolute left-6 top-8 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <motion.div variants={itemVariants}>
              <div className="mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                <LockKeyhole className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                {step === "email" && "Reset Password"}
                {step === "otp" && "Verify OTP"}
                {step === "success" && "Password Changed"}
              </CardTitle>
              <CardDescription className="text-gray-500">
                {step === "email" &&
                  "Enter your email to receive a 6-digit OTP"}
                {step === "otp" && `Enter the OTP sent to ${email}`}
                {step === "success" &&
                  "You can now log in with your new password"}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.form
                  key="email-form"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemVariants}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/50 focus:bg-white transition-colors"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100 flex items-start gap-2 overflow-hidden"
                      >
                        <p>{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.form
                  key="otp-form"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={itemVariants}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">6-Digit OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      className="bg-white/50 focus:bg-white transition-colors text-center tracking-widest text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      minLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/50 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      minLength={4}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-white/50 focus:bg-white transition-colors"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100 flex items-start gap-2 overflow-hidden"
                      >
                        <p>{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Change Password"
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-4 py-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Success!
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your password has been changed successfully.
                  </p>

                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    Go to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
