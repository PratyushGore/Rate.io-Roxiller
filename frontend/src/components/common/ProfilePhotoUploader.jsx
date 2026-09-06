import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import authApi from "../../api/authApi";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Interactive profile photo uploader component.
 * Allows Customers, Store Owners, and Admins to upload, preview, and remove their profile photo.
 */
export default function ProfilePhotoUploader({ size = "lg", onPhotoUpdated }) {
  const { user, updateUserData } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef(null);

  // Reset imageError whenever profilePhoto changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profilePhoto]);

  // Dimension classes
  const sizeClasses = {
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-24 h-24 text-4xl",
  }[size] || "w-20 h-20 text-3xl";

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const hasPhoto = Boolean(user?.profilePhoto);

  const handleOpenModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (loading) return;
    setIsModalOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError("");
    setSuccess("");
  };

  const validateAndSetFile = (file) => {
    setError("");
    setSuccess("");

    if (!file) return;

    // Check MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    // Check max size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("photo", selectedFile);

      const res = await authApi.uploadProfilePhoto(formData);

      if (res.success && res.data?.user) {
        updateUserData(res.data.user);
        setSuccess("Profile photo updated successfully!");
        if (onPhotoUpdated) onPhotoUpdated(res.data.user);

        setTimeout(() => {
          handleCloseModal();
        }, 800);
      } else {
        setError(res.message || "Failed to upload profile photo.");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to upload profile photo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!hasPhoto) return;

    if (!window.confirm("Are you sure you want to remove your profile photo?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await authApi.removeProfilePhoto();

      if (res.success && res.data?.user) {
        updateUserData(res.data.user);
        setSuccess("Profile photo removed.");
        if (onPhotoUpdated) onPhotoUpdated(res.data.user);

        setTimeout(() => {
          handleCloseModal();
        }, 600);
      } else {
        setError(res.message || "Failed to remove profile photo.");
      }
    } catch (err) {
      console.error("Photo remove error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to remove profile photo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Avatar Display with Camera Button */}
      <div className="relative inline-block group">
        <div
          className={`${sizeClasses} rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-900 text-brand-gold flex items-center justify-center font-black select-none shrink-0`}
        >
          {hasPhoto && !imageError ? (
            <img
              src={getImageUrl(user.profilePhoto)}
              alt={user?.name || "User Avatar"}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Change Photo Overlay Button */}
        <button
          type="button"
          onClick={handleOpenModal}
          title="Change profile photo"
          aria-label="Change profile photo"
          className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-brand-gold hover:text-slate-950 border-2 border-white shadow-sm transition-all duration-200 transform hover:scale-110"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Update Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                {success}
              </div>
            )}

            {/* Drag & Drop Upload Zone / Preview */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                isDragging
                  ? "border-brand-gold bg-brand-gold-light/40"
                  : "border-slate-300 hover:border-brand-gold hover:bg-slate-50/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {selectedFile?.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Click or drag another image to replace
                  </p>
                </div>
              ) : hasPhoto ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                    <img
                      src={getImageUrl(user.profilePhoto)}
                      alt="Current Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose a new photo
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, or WebP up to 2MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold-light flex items-center justify-center text-2xl mb-1 text-brand-gold">
                    📷
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop photo here
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WebP (Max 2MB)
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
              <div>
                {hasPhoto && !previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Remove Current Photo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading || !selectedFile}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-slate-950 bg-brand-gold hover:bg-brand-gold-hover rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {loading && (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Save Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
