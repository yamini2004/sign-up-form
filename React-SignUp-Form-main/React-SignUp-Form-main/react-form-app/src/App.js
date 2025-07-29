import React, { useState, useEffect } from "react";

// Corrected Router Component
function Router({ routes }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  const route = routes.find((r) => r.path === path);
  if (!route) return <div>404 Not Found</div>;

  const Component = route.component;
  return <Component navigate={navigate} />;
}

// Countries data
const countries = [
  {
    code: "IN",
    name: "India",
    phoneCode: "+91",
    cities: [
      "Delhi",
      "Mumbai",
      "Bangalore",
      "kurnool",
      "Vijayawada",
      "Chennai",
      "Kolkata",
      "Hyderabad",
      "Pune",
      "Ahmedabad",
    ],
  },
  {
    code: "US",
    name: "USA",
    phoneCode: "+1",
    cities: [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    phoneCode: "+44",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool"],
  },
  {
    code: "CA",
    name: "Canada",
    phoneCode: "+1",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"],
  },
  {
    code: "AU",
    name: "Australia",
    phoneCode: "+61",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  },
  {
    code: "DE",
    name: "Germany",
    phoneCode: "+49",
    cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne"],
  },
  {
    code: "FR",
    name: "France",
    phoneCode: "+33",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  },
  {
    code: "JP",
    name: "Japan",
    phoneCode: "+81",
    cities: ["Tokyo", "Osaka", "Nagoya", "Sapporo", "Fukuoka"],
  },
];

// Regex patterns
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // Indian PAN format
const aadharRegex = /^\d{12}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;



function Form({ navigate }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phoneCode: "+91", // default India
    phoneNumber: "",
    country: "",
    city: "",
    pan: "",
    aadhar: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
      case "username":
        if (!value.trim()) error = "This field is required.";
        break;
      case "email":
        if (!value.trim()) error = "Email is required.";
        else if (!emailRegex.test(value)) error = "Invalid email format.";
        break;
      case "password":
        if (!value) {
          error = "Password is required.";
        } else if (!passwordRegex.test(value)) {
          error =
            "Password must contain at least 1 uppercase letter, 1 special character and 1 number.";
        }
        break;
      case "phoneNumber":
        if (!value.trim()) error = "Phone number is required.";
        else if (!/^\d{6,10}$/.test(value))
          error = "Phone number must be 6 to 10 digits.";
        break;
      case "phoneCode":
        if (!value.trim()) error = "Country code is required.";
        break;
      case "country":
        if (!value) error = "Country is required.";
        break;
      case "city":
        if (!value) error = "City is required.";
        break;
      case "pan":
        if (!value.trim()) error = "PAN is required.";
        else if (!panRegex.test(value)) error = "Invalid PAN format.";
        break;
      case "aadhar":
        if (!value.trim()) error = "Aadhar is required.";
        else if (!aadharRegex.test(value)) error = "Aadhar must be 12 digits.";
        break;
      default:
        break;
    }

    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pan" ? value.toUpperCase() : value,
    }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched(
      Object.keys(form).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    if (validateAll()) {
      const fullPhone = form.phoneCode + form.phoneNumber;
      const toSave = { ...form, phone: fullPhone };
      delete toSave.phoneCode;
      delete toSave.phoneNumber;
      localStorage.setItem("formData", JSON.stringify(toSave));
      navigate("/summary");
    }
  };

  const selectedCountry = countries.find((c) => c.code === form.country);
  const cityOptions = selectedCountry ? selectedCountry.cities : [];

  const isFormValid =
    Object.values(form).every((val) => val.trim() !== "") &&
    Object.values(errors).every((err) => !err);

  return (
    <>
      <style>{`
        body {
          background: #f5e9f7;
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0; padding: 0;
        }
        .form-container {
          max-width: 400px;
          margin: 40px auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(80,0,80,0.1);
          padding: 32px 28px 24px 28px;
        }
        h1 {
          text-align: center;
          color: #6a1b9a;
          margin-bottom: 24px;
        }
        .form-group {
          margin-bottom: 18px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }
        input, select {
          width: 100%;
          padding: 9px 10px;
          border: 1px solid #b39ddb;
          border-radius: 6px;
          font-size: 1rem;
          background: #faf7fc;
          transition: border-color 0.2s;
        }
        input:focus, select:focus {
          border-color: #8e24aa;
          outline: none;
        }
        .error-message {
          color: #c62828;
          font-size: 0.9rem;
          margin-top: 3px;
        }
        .phone-inputs {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .phone-code-select {
          width: 110px;
          padding: 6px 8px;
          font-size: 0.9rem;
          border-radius: 6px;
          border: 1px solid #b39ddb;
          background-color: #faf7fc;
          cursor: pointer;
        }
        .phone-number-input {
          flex: 1;
          padding: 10px 12px;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid #b39ddb;
          max-width: 300px;
        }
        .submit-btn {
          width: 100%;
          padding: 10px 0;
          background: linear-gradient(90deg, #8e24aa 60%, #ce93d8 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, opacity 0.2s;
        }
        .submit-btn:disabled {
          background: #d1c4e9;
          color: #a1887f;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .show-btn {
          margin-left: 8px;
          padding: 3px 10px;
          font-size: 0.95rem;
          border: none;
          background: #ede7f6;
          color: #6a1b9a;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .show-btn:hover {
          background: #d1c4e9;
        }
        .password-helper {
          font-size: 0.85rem;
          color: #666;
          margin-top: 4px;
        }
        .back-btn {
          margin-top: 20px;
          padding: 8px 16px;
          background: #6a1b9a;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .back-btn:hover {
          background: #4a0e6a;
        }
      `}</style>

      <div className="form-container">
        <h1>SignUp Form</h1>
        <form onSubmit={handleSubmit} noValidate>
          {/* First Name */}
          <div className="form-group">
            <label>First Name *</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.firstName && errors.firstName && (
              <div className="error-message">{errors.firstName}</div>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label>Last Name *</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.lastName && errors.lastName && (
              <div className="error-message">{errors.lastName}</div>
            )}
          </div>

          {/* Username */}
          <div className="form-group">
            <label>Username *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.username && errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password *</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            <div className="password-helper">
            </div>
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label>Phone Number *</label>
            <div className="phone-inputs">
              <select
                name="phoneCode"
                value={form.phoneCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className="phone-code-select"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.phoneCode}>
                    {c.phoneCode} ({c.code})
                  </option>
                ))}
              </select>
              <input
                name="phoneNumber"
                placeholder="Enter phone number"
                value={form.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className="phone-number-input"
              />
            </div>
            {touched.phoneCode && errors.phoneCode && (
              <div className="error-message">{errors.phoneCode}</div>
            )}
            {touched.phoneNumber && errors.phoneNumber && (
              <div className="error-message">{errors.phoneNumber}</div>
            )}
          </div>

          {/* Country */}
          <div className="form-group">
            <label>Country *</label>
            <select
              name="country"
              value={form.country}
              onChange={(e) => {
                handleChange(e);
                setForm((prev) => ({ ...prev, city: "" }));
                setTouched((prev) => ({ ...prev, city: false }));
                setErrors((prev) => ({ ...prev, city: "" }));
              }}
              onBlur={handleBlur}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {touched.country && errors.country && (
              <div className="error-message">{errors.country}</div>
            )}
          </div>

          {/* City */}
          <div className="form-group">
            <label>City *</label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!form.country}
            >
              <option value="">Select City</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {touched.city && errors.city && (
              <div className="error-message">{errors.city}</div>
            )}
          </div>

          {/* PAN */}
          <div className="form-group">
            <label>PAN No. *</label>
            <input
              name="pan"
              maxLength={10}
              placeholder="ABCDE1234F"
              value={form.pan}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.pan && errors.pan && (
              <div className="error-message">{errors.pan}</div>
            )}
          </div>

          {/* Aadhar */}
          <div className="form-group">
            <label>Aadhar No. *</label>
            <input
              name="aadhar"
              maxLength={12}
              placeholder="123412341234"
              value={form.aadhar}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.aadhar && errors.aadhar && (
              <div className="error-message">{errors.aadhar}</div>
            )}
          </div>

          <button className="submit-btn" type="submit" disabled={!isFormValid}>
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

function Summary({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("formData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setData(parsed);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      }
    } else {
      setData(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "40px auto",
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "40px auto",
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}
      >
        <p>No submitted data found.</p>
        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Form
        </button>
      </div>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "40px auto",
          fontFamily: "'Segoe UI', Arial, sans-serif",
        }}
      >
        <p>No submitted data found.</p>
        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Form
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: "#fff",
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(80,0,80,0.10), 0 1.5px 3px #e3b6f7",
      }}
    >
      <h1 style={{ color: "#6a1b9a", textAlign: "center" }}>Submitted Details</h1>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {entries.map(([key, value]) => (
          <li key={key} style={{ marginBottom: 10 }}>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
          </li>
        ))}
      </ul>
      <button className="back-btn" onClick={() => navigate("/")}>
        Back to Form
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router
      routes={[
        { path: "/", component: Form },
        { path: "/summary", component: Summary },
      ]}
    />
  );
}