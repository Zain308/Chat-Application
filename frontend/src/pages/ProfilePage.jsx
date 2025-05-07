import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, CircleDot, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [tempImage, setTempImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [theme, setTheme] = useState("dark"); // Default theme
  const fileInputRef = useRef(null);

  // Sync theme with DaisyUI
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select an image to upload");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WEBP image");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        setTempImage(base64Image);
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error.response?.data?.message || "Failed to update profile picture");
        setTempImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read the image file");
      setTempImage(null);
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getImageSource = () => {
    // Priority order: temp image -> stored profile pic -> default avatar
    return tempImage || authUser?.profilePic || "/avatar.png";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4 pt-16">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl rounded-2xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-primary text-primary-content p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-ghost"
            title="Toggle Theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex justify-center relative">
            <div className="relative group">
              <img
                src={getImageSource()}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-md transition-all duration-300 group-hover:border-primary-focus"
                onError={(e) => {
                  console.error("Image load error, falling back to default");
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/avatar.png";
                }}
              />
              {(isUploading || isUpdatingProfile) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-primary text-primary-content p-2 rounded-full
                  cursor-pointer transition-all duration-300
                  hover:bg-primary-focus hover:scale-105
                  ${(isUploading || isUpdatingProfile) ? "opacity-50 pointer-events-none" : ""}
                `}
                title="Change profile picture"
              >
                <Camera className="w-5 h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading || isUpdatingProfile}
                />
              </label>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <span className="text-sm text-base-content/70 mb-1">Full Name</span>
              <p className="text-lg font-semibold bg-base-200 px-4 py-2 rounded-lg w-full text-center">
                {authUser?.fullName || "Not set"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-base-content/70 mb-1">Email</span>
              <p className="text-lg font-semibold bg-base-200 px-4 py-2 rounded-lg w-full text-center">
                {authUser?.email || "Not set"}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h2 className="text-lg font-medium text-base-content/80 mb-4 border-b border-base-300 pb-2">
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-base-content/70">Member Since</span>
                <span className="text-sm font-medium">{formatDate(authUser?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-base-content/70">Account Status</span>
                <div className="flex items-center gap-2">
                  <CircleDot className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;