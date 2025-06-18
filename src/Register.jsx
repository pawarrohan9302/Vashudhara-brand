import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { auth } from "./firebase";
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    updatePassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
=======
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
import { useNavigate, Link } from "react-router-dom";

const actionCodeSettings = {
    url: window.location.origin + "/register", // Same page for handling link
    handleCodeInApp: true,
};

const Register = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
<<<<<<< HEAD
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // On mount, check if this is email sign-in link
    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let storedEmail = window.localStorage.getItem("emailForRegistration");

            if (!storedEmail) {
                storedEmail = window.prompt("Please provide your email for confirmation");
            }

            setIsVerifying(true);
            signInWithEmailLink(auth, storedEmail, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem("emailForRegistration");
                    setMessage("Email verified! Now set your password.");
                    setIsVerifying(false);
                    setEmail(storedEmail);
                })
                .catch((err) => {
                    setError("Invalid or expired link. Please register again.");
                    setIsVerifying(false);
                });
        }
    }, []);

    const handleSendLink = async (e) => {
=======
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let countdown;
        if (step === 2 && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(countdown);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdown);
    }, [step, timer]);

    const generateOtp = () => {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otpCode);
        console.log("Generated OTP (for demo):", otpCode); // Simulate sending
        setMessage("OTP sent to your email. (Check console in demo)");
        setTimer(60);
        setCanResend(false);
    };

    const handleRequestOtp = (e) => {
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

<<<<<<< HEAD
        try {
            // Store email locally to confirm on link click
            window.localStorage.setItem("emailForRegistration", email);

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            setMessage(
                `Verification link sent to ${email}. Please check your inbox and click the link to verify your email.`
            );
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.message);
        }
    };

    // After email verified, user sets password
    const handleSetPassword = async (e) => {
=======
        generateOtp();
        setStep(2);
    };

    const handleVerifyOtpAndRegister = (e) => {
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
        e.preventDefault();
        setError("");
        setMessage("");

<<<<<<< HEAD
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }

        try {
            // Update password for current user
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, password);
                setMessage("Password set successfully! You can now login.");
                // Optionally logout user after setting password
                await signOut(auth);
                navigate("/login");
            } else {
                setError("User not signed in properly.");
            }
        } catch (err) {
            setError(err.message);
=======
        if (!otp || otp !== generatedOtp) {
            return setError("Invalid OTP. Please enter the correct OTP.");
        }

        setMessage("OTP verified! Account registered successfully.");
        setTimeout(() => navigate("/login"), 2000);
    };

    const handleResendOtp = () => {
        if (canResend) {
            generateOtp();
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Register Account
                </h2>

                {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
                {message && <p className="mb-4 text-green-600 text-center">{message}</p>}

<<<<<<< HEAD
                {/* Show email input and send link if not verified yet */}
                {!auth.currentUser && !isVerifying && (
                    <form onSubmit={handleSendLink} className="space-y-5">
=======
                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-5">
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <button
                            type="submit"
<<<<<<< HEAD
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition"
                        >
                            Send Verification Link
                        </button>
                        <p className="text-center mt-3 text-gray-600">
                            Already registered?{" "}
                            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
=======
                            disabled={loading}
                            className={`w-full py-3 rounded-md font-semibold transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            {loading ? "Sending OTP..." : "Register & Send OTP"}
                        </button>
                        <p className="text-center mt-3 text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-purple-600 font-semibold hover:underline"
                            >
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
                                Login here
                            </Link>
                        </p>
                    </form>
                )}

<<<<<<< HEAD
                {/* If email verified, show password set form */}
                {auth.currentUser && (
                    <form onSubmit={handleSetPassword} className="space-y-5 mt-6">
                        <p className="text-center text-gray-700 mb-4">
                            Set your password for the account {email}
                        </p>
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold transition"
                        >
                            Set Password
=======
                {step === 2 && (
                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
                        <p className="text-center text-gray-700">
                            OTP sent to <strong>{email}</strong>
                        </p>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            required
                        />
                        <div className="text-center text-sm text-gray-700">
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-purple-600 hover:underline font-medium"
                                >
                                    Resend OTP
                                </button>
                            ) : (
                                <p>Resend available in {timer}s</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-md font-semibold transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            {loading ? "Verifying..." : "Verify OTP & Register"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setError("");
                                setMessage("");
                            }}
                            className="w-full py-3 mt-2 rounded-md font-semibold text-purple-600 border border-purple-600 hover:bg-purple-50 transition"
                        >
                            Go Back / Edit Details
>>>>>>> parent of 4056cb3 (Temporarily saving current work before revert operation)
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
