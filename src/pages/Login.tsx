import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";
import { loginApi } from "../apis/AuthApis";
import { Formik, Form, ErrorMessage } from "formik";
import { loginValidationSchema } from "../Validations/AuthValidations";

export const Login: React.FC = () => {
  const history = useHistory();
  const [userId, setuserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  const triggerDemoLogin = () => {
    toast.info("Auto-filling demo credentials...");
    setuserId("admin");
    setPassword("admin");
    setRememberMe(true);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user", JSON.stringify({ userId: "admin", role: "Super Admin" }));
      toast.success("Demo Login Authorized!");
      history.push("/home");
    }, 800);
  };

  return (
    <div className="dbs-login-wrapper">
      {/* Animated Floating Bubbles Backdrop */}
      <div className="dbs-login-bg-bubbles">
        <div className="dbs-bubble"></div>
        <div className="dbs-bubble"></div>
        <div className="dbs-bubble"></div>
        <div className="dbs-bubble"></div>
        {/* Cinematic glow overlays */}
        <div className="dbs-glow-orb dbs-glow-orb-1"></div>
        <div className="dbs-glow-orb dbs-glow-orb-2"></div>
      </div>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            className="dbs-intro-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            onClick={() => setShowIntro(false)}
          >
            <div className="dbs-intro-content">
              {/* Central Glowing Logo */}
              <motion.div
                className="dbs-intro-logo-container"
                initial={{ scale: 0.6, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: 0.2
                }}
              >
                <motion.img
                  src="/images/dbs-logo-short.png"
                  alt="DBS Logo"
                  className="dbs-intro-logo"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 10px rgba(37, 99, 235, 0.3))",
                      "drop-shadow(0 0 30px rgba(37, 99, 235, 0.7))",
                      "drop-shadow(0 0 10px rgba(37, 99, 235, 0.3))"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
                <div className="dbs-intro-logo-glow-ring"></div>
              </motion.div>

              {/* Cinematic Typography Titles */}
              <div className="dbs-intro-text-box">
                <motion.h1
                  className="dbs-intro-title"
                  initial={{ opacity: 0, letterSpacing: "1px" }}
                  animate={{ opacity: 1, letterSpacing: "8px" }}
                  transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                >
                  iCAMPUS BOAT
                </motion.h1>

                <motion.p
                  className="dbs-intro-subtitle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  D BASE SOLUTIONS
                </motion.p>

                <motion.span
                  className="dbs-intro-tagline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  Innovation through Ideas...
                </motion.span>
              </div>

              {/* Progress Scan Bar */}
              <div className="dbs-intro-progress-track">
                <motion.div
                  className="dbs-intro-progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              <motion.button
                className="dbs-intro-skip-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIntro(false);
                }}
              >
                Skip Intro
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login-content"
            className="dbs-login-card-container"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo and Header */}
            <div className="dbs-login-card-header">
              <motion.div
                className="dbs-login-logo-mark"
                initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 12 }}
              >
                <img src="/images/dbs-logo-short.png" alt="DBS Logo" className="dbs-card-logo-img" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                DBASE SOLUTIONS PVT. LTD.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                Innovation through Ideas...
              </motion.p>
            </div>

            {/* Login Core Box */}
            <motion.div
              className="dbs-login-form-box"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2>LOGIN | DBS-ERP</h2>

              <Formik
                initialValues={{
                  userId: "",
                  password: "",
                }}
                validationSchema={loginValidationSchema}
                onSubmit={async (values) => {
                  setLoading(true);

                  const res = await loginApi(values);

                  setLoading(false);

                  if (res.success) {
                    localStorage.setItem("user", JSON.stringify(res.data));
                    toast.success(res.message);
                    history.push("/home");
                  } else {
                    toast.error(res.message);
                  }
                }}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <Form className="dbs-login-form">

                    {/* userId */}
                    <div className="dbs-login-input-group">
                      <label>userId</label>

                      <div className="dbs-login-input-field-wrapper">
                        <User size={18} className="dbs-login-field-icon" />

                        <input
                          name="userId"
                          value={values.userId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter employee userId"
                        />
                      </div>

                      {touched.userId && errors.userId && (
                        <div className="dbs-error-text">{errors.userId}</div>
                      )}
                    </div>

                    {/* password */}
                    <div className="dbs-login-input-group">
                      <label>Password</label>

                      <div className="dbs-login-input-field-wrapper">
                        <Lock size={18} className="dbs-login-field-icon" />

                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter password code"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="dbs-password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                      </div>

                      {touched.password && errors.password && (
                        <div className="dbs-error-text">{errors.password}</div>
                      )}
                    </div>

                    {/* remember me (unchanged) */}
                    <div className="dbs-login-actions-row">
                      <label className="dbs-login-checkbox-label">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                      </label>
                    </div>

                    {/* submit */}
                    <button
                      type="submit"
                      className="dbs-login-submit-btn"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Login to Dashboard"}
                    </button>

                  </Form>
                )}
              </Formik>

              {/* Reset password suggestion */}
              <div className="dbs-login-reset-pwd-box">
                <span>Forgot your password?</span>
                <button
                  className="dbs-reset-pwd-link"
                  onClick={() => toast.info("Password reset instructions dispatched to registered mobile number.")}
                >
                  No Worries, Click Here To RESET PASSWORD.
                </button>
              </div>

              <div className="dbs-login-divider">
                <span>OR</span>
              </div>

              {/* Explicit demo access button */}
              <button
                type="button"
                className="dbs-login-demo-btn"
                onClick={triggerDemoLogin}
                disabled={loading}
              >
                <span>Run in Demo Mode</span>
              </button>
            </motion.div>

            {/* Footer info */}
            <motion.div
              className="dbs-login-card-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              2026 © D Base Solutions - ERP.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default Login;