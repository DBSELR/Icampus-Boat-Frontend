import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent } from "@ionic/react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Zap,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";
import { loginApi, loadSubMenus } from "../apis/AuthApis";
import { Formik, Form } from "formik";
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
    <IonPage>
      <IonContent scrollY={true} className="icampus-erp-ion-content">
        <div className="icampus-erp-login-wrapper">
          {/* Dynamic Animated Light Canvas Backdrop */}
          <div className="icampus-erp-bg-canvas">
            {/* Subtle grid pattern overlay */}
            <div className="icampus-erp-grid-overlay"></div>

            {/* Ambient Gradient Mesh Orbs */}
            <div className="icampus-erp-orb icampus-erp-orb-1"></div>
            <div className="icampus-erp-orb icampus-erp-orb-2"></div>
            <div className="icampus-erp-orb icampus-erp-orb-3"></div>

            {/* Floating Particles & Cards */}
            <div className="icampus-erp-particle particle-1"></div>
            <div className="icampus-erp-particle particle-2"></div>
            <div className="icampus-erp-particle particle-3"></div>
            <div className="icampus-erp-particle particle-4"></div>

            {/* SVG Light Wave Vectors */}
            <svg className="icampus-erp-wave-bg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path
                fill="rgba(37, 99, 235, 0.04)"
                fillOpacity="1"
                d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
              <path
                fill="rgba(14, 165, 233, 0.03)"
                fillOpacity="1"
                d="M0,96L60,112C120,128,240,160,360,170.7C480,181,600,171,720,149.3C840,128,960,96,1080,101.3C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              ></path>
            </svg>
          </div>

          <AnimatePresence mode="wait">
            {showIntro ? (
              <motion.div
                key="intro"
                className="icampus-erp-intro-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                onClick={() => setShowIntro(false)}
              >
                <div className="icampus-erp-intro-content">
                  {/* Central Glowing Logo Ring */}
                  <motion.div
                    className="icampus-erp-intro-logo-container"
                    initial={{ scale: 0.5, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 14,
                      delay: 0.15
                    }}
                  >
                    <motion.img
                      src="/images/dbs-logo-short.png"
                      alt="DBS Logo"
                      className="icampus-erp-intro-logo"
                      animate={{
                        filter: [
                          "drop-shadow(0 4px 15px rgba(37, 99, 235, 0.25))",
                          "drop-shadow(0 8px 30px rgba(37, 99, 235, 0.5))",
                          "drop-shadow(0 4px 15px rgba(37, 99, 235, 0.25))"
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                    />
                    <div className="icampus-erp-intro-glow-ring"></div>
                  </motion.div>

                  {/* Light Cinematic Typography */}
                  <div className="icampus-erp-intro-text-box">
                    <motion.h1
                      className="icampus-erp-intro-title"
                      initial={{ opacity: 0, letterSpacing: "2px" }}
                      animate={{ opacity: 1, letterSpacing: "6px" }}
                      transition={{ delay: 0.5, duration: 1.0, ease: "easeOut" }}
                    >
                      iCAMPUS BOAT
                    </motion.h1>

                    <motion.p
                      className="icampus-erp-intro-subtitle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.7 }}
                    >
                      DBASE SOLUTIONS PVT. LTD.
                    </motion.p>

                    <motion.span
                      className="icampus-erp-intro-tagline"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      transition={{ delay: 1.1, duration: 0.7 }}
                    >
                      Innovation through Ideas...
                    </motion.span>
                  </div>

                  {/* Progress Scan Bar */}
                  <div className="icampus-erp-intro-progress-track">
                    <motion.div
                      className="icampus-erp-intro-progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.6, duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>

                  <motion.button
                    className="icampus-erp-intro-skip-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.4 }}
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
                key="login-layout"
                className="icampus-erp-main-container"
                initial={{ opacity: 0, y: 35, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Desktop ERP Hero Showcase Section */}
                <div className="icampus-erp-hero-panel">
                  <div className="icampus-erp-hero-badge">
                    <span className="icampus-erp-badge-dot"></span>
                    <span>DBASE ERP Enterprise Suite v4.2</span>
                  </div>

                  <h1 className="icampus-erp-hero-title">
                    Next-Gen Campus & Enterprise Management System
                  </h1>

                  <p className="icampus-erp-hero-subtitle">
                    Streamline academic operations, student analytics, financial accounting, and administrative workflows in one unified platform.
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="icampus-erp-features-list">
                    <div className="icampus-erp-feature-item">
                      <div className="icampus-erp-feature-icon">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="icampus-erp-feature-text">
                        <strong>Smart Attendance & Timetabling</strong>
                        <span>Real-time tracking and automated scheduling</span>
                      </div>
                    </div>

                    <div className="icampus-erp-feature-item">
                      <div className="icampus-erp-feature-icon">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="icampus-erp-feature-text">
                        <strong>Fee Engine & Financial Accounts</strong>
                        <span>End-to-end ledger management & payment gateways</span>
                      </div>
                    </div>

                    <div className="icampus-erp-feature-item">
                      <div className="icampus-erp-feature-icon">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="icampus-erp-feature-text">
                        <strong>Student & Staff Lifecycle Suite</strong>
                        <span>360° digital records and performance metrics</span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Indicators */}
                  <div className="icampus-erp-metrics-row">
                    <div className="icampus-erp-metric-card">
                      <span className="icampus-erp-metric-val">99.99%</span>
                      <span className="icampus-erp-metric-lbl">Uptime SLA</span>
                    </div>
                    <div className="icampus-erp-metric-card">
                      <span className="icampus-erp-metric-val">256-Bit</span>
                      <span className="icampus-erp-metric-lbl">SSL Encrypted</span>
                    </div>
                    <div className="icampus-erp-metric-card">
                      <span className="icampus-erp-metric-val">Instant</span>
                      <span className="icampus-erp-metric-lbl">Sync Engine</span>
                    </div>
                  </div>

                  <div className="icampus-erp-hero-footer">
                    <Building2 size={16} />
                    <span>Powered by D Base Solutions Pvt. Ltd.</span>
                  </div>
                </div>

                {/* Auth Form Card Panel (Web Glass + Native Mobile Sheet) */}
                <motion.div
                  className="icampus-erp-auth-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                >
                  {/* Native Mobile Pull Indicator Bar */}
                  <div className="icampus-erp-mobile-handle"></div>

                  {/* Card Brand Header */}
                  <div className="icampus-erp-card-header">
                    <motion.div
                      className="icampus-erp-logo-mark"
                      whileHover={{ scale: 1.06, rotate: 3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img src="/images/dbs-logo-short.png" alt="DBS Logo" className="icampus-erp-logo-img" />
                    </motion.div>

                    <div className="icampus-erp-brand-text">
                      <h2>DBASE SOLUTIONS PVT. LTD.</h2>
                      <p>Innovation through Ideas...</p>
                    </div>

                    <div className="icampus-erp-mobile-status-pill">
                      <span className="icampus-erp-status-dot"></span>
                      <span>System Active</span>
                    </div>
                  </div>

                  {/* Login Title Banner */}
                  <div className="icampus-erp-title-banner">
                    <ShieldCheck size={18} className="icampus-erp-title-icon" />
                    <span>EMPLOYEE SIGN IN | DBS-ERP</span>
                  </div>

                  {/* Formik Auth Form */}
                  <Formik
                    initialValues={{
                      userId: userId || "",
                      password: password || "",
                    }}
                    enableReinitialize
                    validationSchema={loginValidationSchema}
                    onSubmit={async (values) => {
                      localStorage.clear();

                      try {
                        setLoading(true);

                        const loginRes = await loginApi(values);
                        console.log("Login Response:", loginRes);

                        if (!loginRes.success) {
                          toast.error(loginRes.message || "Invalid credentials");
                          return;
                        }

                        localStorage.setItem("token", loginRes.data.token);
                        localStorage.setItem("user", JSON.stringify(loginRes.data.user));

                        const subMenuRes = await loadSubMenus();

                        if (subMenuRes.status === 200) {
                          localStorage.setItem(
                            "subMenus",
                            JSON.stringify(subMenuRes.data)
                          );
                        }

                        const menus = [
                          ...new Map(
                            subMenuRes.data.map((x: any) => [
                              x.menuId,
                              {
                                menuId: x.menuId,
                                menuName: x.menuName,
                                subGroup: x.subGroup,
                              },
                            ])
                          ).values(),
                        ];

                        localStorage.setItem("menus", JSON.stringify(menus));
                        toast.success("Login Successful! Welcome to Dashboard.");
                        history.push("/home");

                      } catch (err: any) {
                        console.error("ERROR:", err);
                        toast.error("Network error. Please try again.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {({ values, handleChange, handleBlur, errors, touched }) => (
                      <Form className="icampus-erp-form">

                        {/* userId Field */}
                        <div className="icampus-erp-input-group">
                          <label htmlFor="userId">Employee User ID</label>

                          <div className={`icampus-erp-input-wrapper ${touched.userId && errors.userId ? "icampus-erp-input-error" : ""}`}>
                            <User size={18} className="icampus-erp-field-icon" />

                            <input
                              id="userId"
                              name="userId"
                              type="text"
                              value={values.userId}
                              onChange={(e) => {
                                handleChange(e);
                                setuserId(e.target.value);
                              }}
                              onBlur={handleBlur}
                              placeholder="e.g. EMP1024 or admin"
                              autoComplete="username"
                            />
                          </div>

                          <div className="icampus-erp-error-slot">
                            {touched.userId && errors.userId && (
                              <span className="icampus-erp-error-text">{errors.userId}</span>
                            )}
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="icampus-erp-input-group">
                          <label htmlFor="password">Security Password</label>

                          <div className={`icampus-erp-input-wrapper ${touched.password && errors.password ? "icampus-erp-input-error" : ""}`}>
                            <Lock size={18} className="icampus-erp-field-icon" />

                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={values.password}
                              onChange={(e) => {
                                handleChange(e);
                                setPassword(e.target.value);
                              }}
                              onBlur={handleBlur}
                              placeholder="Enter your secret password"
                              autoComplete="current-password"
                            />

                            <button
                              type="button"
                              className="icampus-erp-password-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                          </div>

                          <div className="icampus-erp-error-slot">
                            {touched.password && errors.password && (
                              <span className="icampus-erp-error-text">{errors.password}</span>
                            )}
                          </div>
                        </div>

                        {/* Remember me & Quick Help Row */}
                        <div className="icampus-erp-actions-row">
                          <label className="icampus-erp-checkbox-label">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="icampus-erp-checkbox-custom"></span>
                            <span className="icampus-erp-checkbox-text">Remember device</span>
                          </label>
                        </div>

                        {/* Submit CTA Button */}
                        <motion.button
                          type="submit"
                          className="icampus-erp-submit-btn"
                          disabled={loading}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                        >
                          {loading ? (
                            <div className="icampus-erp-btn-loading">
                              <span className="icampus-erp-spinner"></span>
                              <span>Authenticating...</span>
                            </div>
                          ) : (
                            <div className="icampus-erp-btn-content">
                              <span>Login to Dashboard</span>
                              <ArrowRight size={18} />
                            </div>
                          )}
                        </motion.button>

                      </Form>
                    )}
                  </Formik>

                  {/* Forgot Password Section */}
                  <div className="icampus-erp-forgot-pwd-box">
                    <button
                      type="button"
                      className="icampus-erp-reset-link"
                      onClick={() => toast.info("Password reset link has been dispatched to your registered SMS/Email.")}
                    >
                      Forgot your password? <strong>RESET HERE</strong>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="icampus-erp-divider">

                  </div>



                  {/* Footer text */}
                  <div className="icampus-erp-card-footer">
                    2026 © D Base Solutions - ERP System. All rights reserved.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;