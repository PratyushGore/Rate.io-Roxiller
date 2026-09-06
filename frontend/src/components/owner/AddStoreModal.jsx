import React, { useState, useEffect, useRef } from "react";
import ownerApi from "../../api/ownerApi";

const CATEGORY_SUGGESTIONS = [
  "General",
  "Coffee & Bakery",
  "Fashion & Apparel",
  "Electronics & Tech",
  "Dining & Food",
  "Health & Beauty",
  "Home & Living",
  "Sports & Outdoors",
];

/**
 * Modal form for store owners to register a new store.
 * Supports drag-and-drop image upload with preview, category, and tags.
 * Created stores default to PENDING review status.
 */
export default function AddStoreModal({ isOpen = false, onClose, onStoreAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    category: "General",
    tags: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSubmitting, onClose]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;

    // Validate type: JPEG, PNG, WebP
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Only JPEG, PNG, and WebP image files are allowed.",
      }));
      return;
    }

    // Validate size: 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Image size exceeds 2MB limit.",
      }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) {
      errors.name = "Store name is required";
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      errors.name = "Store name must be between 20 and 60 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = "Contact email is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Please provide a valid email address";
    }

    if (!trimmedAddress) {
      errors.address = "Store address is required";
    } else if (trimmedAddress.length > 400) {
      errors.address = "Address cannot exceed 400 characters";
    }

    if (formData.category && formData.category.length > 50) {
      errors.category = "Category cannot exceed 50 characters";
    }

    if (formData.tags && formData.tags.length > 255) {
      errors.tags = "Tags cannot exceed 255 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGeneralError("");

      const submissionData = new FormData();
      submissionData.append("name", trimmedName);
      submissionData.append("email", trimmedEmail);
      submissionData.append("address", trimmedAddress);
      if (formData.category) {
        submissionData.append("category", formData.category.trim());
      }
      if (formData.tags) {
        submissionData.append("tags", formData.tags.trim());
      }
      if (imageFile) {
        submissionData.append("image", imageFile);
      }

      const res = await ownerApi.createStore(submissionData);

      if (res.success && res.data) {
        onStoreAdded(res.data);
        onClose();
        setFormData({
          name: "",
          email: "",
          address: "",
          category: "General",
          tags: "",
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      const msg = err.message || "Failed to register store";
      const lower = msg.toLowerCase();
      if (lower.includes("name") || lower.includes("already exists")) {
        setFieldErrors({ name: msg });
      } else if (lower.includes("email")) {
        setFieldErrors({ email: msg });
      } else if (lower.includes("address")) {
        setFieldErrors({ address: msg });
      } else if (lower.includes("image")) {
        setFieldErrors({ image: msg });
      } else {
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl border border-surface-border p-6 sm:p-8 shadow-2xl max-w-lg w-full z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Register New Store</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your store details. New stores are placed under admin review before appearing in the catalog.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          {/* Store Image Upload Dropzone */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Storefront Image <span className="text-slate-400 font-normal">(JPEG, PNG, WebP ≤ 2MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-white group">
                <img
                  src={imagePreview}
                  alt="Store Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white text-xs transition-colors shadow-sm"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                  isDragOver
                    ? "border-brand-gold bg-brand-gold-light"
                    : "border-slate-300 hover:border-brand-gold bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelection(e.target.files[0]);
                    }
                  }}
                />
                <span className="text-2xl">📸</span>
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Click to upload</span> or drag and drop image
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, or WebP up to 2MB</p>
              </div>
            )}
            {fieldErrors.image && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.image}</p>
            )}
          </div>

          {/* Store Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Store Name <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(20–60 chars)</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Artisanal Roastery & Cafe Seattle"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-xs ${
                fieldErrors.name ? "border-red-400 bg-red-50/30" : "border-slate-300"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@store.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-xs ${
                fieldErrors.email ? "border-red-400 bg-red-50/30" : "border-slate-300"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Category Dropdown / Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-xs bg-white cursor-pointer"
              >
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. coffee, wifi, organic"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-xs"
              />
            </div>
          </div>

          {/* Store Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Store Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, City, State, ZIP"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-xs ${
                fieldErrors.address ? "border-red-400 bg-red-50/30" : "border-slate-300"
              }`}
            />
            {fieldErrors.address && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.address}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Submit Store Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
