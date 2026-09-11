import { useState } from "react";
import "./App.css";

interface FormData {
  name: string;
  fatherName: string;
  motherName: string;
  email: string;
  phone: string;
  address: string;
  pinCode: string;
  bloodGroup: string;
  gender: string;
}

const initialForm: FormData = {
  name: "",
  fatherName: "",
  motherName: "",
  email: "",
  phone: "",
  address: "",
  pinCode: "",
  bloodGroup: "",
  gender: "",
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    validateField(name, value);
  };

  // Real-time validation
  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = "This field is required.";
    }

    if (name === "phone") {
      if (value.length > 0 && !/^[0-9]*$/.test(value)) {
        error = "Only numbers are allowed.";
      } else if (value.length > 0 && value.length < 10) {
        error = `Phone number needs ${
          10 - value.length
        } more digit${10 - value.length === 1 ? "" : "s"}.`;
      } else if (value.length === 10) {
        error = "";
      } else if (value.length > 10) {
        error = "Phone number cannot exceed 10 digits.";
      }
    }

    if (name === "pinCode") {
      if (value.length > 0 && !/^[0-9]*$/.test(value)) {
        error = "Only numbers are allowed.";
      } else if (value.length > 0 && value.length < 6) {
        error = `PIN code needs ${6 - value.length} more digit${
          6 - value.length === 1 ? "" : "s"
        }.`;
      } else if (value.length === 6) {
        error = "";
      } else if (value.length > 6) {
        error = "PIN code cannot exceed 6 digits.";
      }
    }

    if (name === "email" && value.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Please enter a valid email address.";
      }
    }

    setErrors((previous) => ({
      ...previous,
      [name]: error,
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([name, value]) => {
      if (!value.trim()) {
        newErrors[name] = "This field is required.";
      }
    });

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain exactly 10 digits.";
    }

    if (!/^[0-9]{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "PIN code must contain exactly 6 digits.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
        const apiUrl = (
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        ).replace(/\/$/, "");
        const response = await fetch(`${apiUrl}/api/registrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration completed successfully!");

      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      setSuccess(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>

      <div className="registration-card">
        <div className="header">
          <div className="user-icon">👤</div>

          <h1>Registration Form</h1>

          <p>
            Please fill in your details to complete registration
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="field-box pink">
            <label>👤 Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            {errors.name && (
              <span className="error">{errors.name}</span>
            )}
          </div>

          {/* FATHER NAME */}
          <div className="field-box blue">
            <label>👨 Father Name</label>

            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
            />

            {errors.fatherName && (
              <span className="error">{errors.fatherName}</span>
            )}
          </div>

          {/* MOTHER NAME */}
          <div className="field-box purple">
            <label>👩 Mother Name</label>

            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
            />

            {errors.motherName && (
              <span className="error">{errors.motherName}</span>
            )}
          </div>

          <div className="two-column">

            {/* EMAIL */}
            <div className="field-box yellow">
              <label>✉️ Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              {errors.email && (
                <span className="error">{errors.email}</span>
              )}
            </div>

            {/* PHONE */}
            <div className="field-box green">
              <label>📱 Phone Number</label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^[0-9]*$/.test(value) && value.length <= 10) {
                    handleChange(e);
                  }
                }}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />

              <div className="counter">
                {formData.phone.length}/10 digits
              </div>

              {errors.phone && (
                <span className="error">{errors.phone}</span>
              )}

              {formData.phone.length === 10 && !errors.phone && (
                <span className="valid">✓ Valid phone number</span>
              )}
            </div>
          </div>

          <div className="two-column">

            {/* BLOOD GROUP */}
            <div className="field-box lavender">
              <label>🩸 Blood Group</label>

              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              {errors.bloodGroup && (
                <span className="error">{errors.bloodGroup}</span>
              )}
            </div>

            {/* GENDER */}
            <div className="field-box mint">
              <label>⚥ Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {errors.gender && (
                <span className="error">{errors.gender}</span>
              )}
            </div>
          </div>

          <div className="two-column">

            {/* ADDRESS */}
            <div className="field-box peach">
              <label>🏠 Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
                rows={4}
              ></textarea>

              {errors.address && (
                <span className="error">{errors.address}</span>
              )}
            </div>

            {/* PIN CODE */}
            <div className="field-box pink-light">
              <label>📍 PIN Code</label>

              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^[0-9]*$/.test(value) && value.length <= 6) {
                    handleChange(e);
                  }
                }}
                placeholder="Enter 6-digit PIN"
                maxLength={6}
              />

              <div className="counter">
                {formData.pinCode.length}/6 digits
              </div>

              {errors.pinCode && (
                <span className="error">{errors.pinCode}</span>
              )}

              {formData.pinCode.length === 6 &&
                !errors.pinCode && (
                  <span className="valid">
                    ✓ Valid PIN code
                  </span>
                )}
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {success && (
            <div
              className={
                success.includes("successfully")
                  ? "success-message"
                  : "server-error"
              }
            >
              {success.includes("successfully") ? "✓ " : "⚠ "}
              {success}
            </div>
          )}

          {/* RED CONFIRMATION BUTTON */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Registering..." : "✓ Confirm Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;