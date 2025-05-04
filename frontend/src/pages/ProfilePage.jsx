import React, { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, CircleDot, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [tempImage, setTempImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select an image to upload");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WEBP image");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 5 * 1024 * 1024) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-200 mt-20">
      <div className="max-w-md w-full mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-white animate-pulse-slow">Your Profile</h1>

        {/* Avatar Section */}
        <div className="flex justify-center mb-8 relative">
          <div className="relative group">
            <div className="relative">
              <img
                src={getImageSource()}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 transition-all duration-300 group-hover:border-blue-700"
                onError={(e) => {
                  console.error("Image load error, falling back to default");
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/avatar.png";
                }}
              />
              {(isUploading || isUpdatingProfile) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0
                bg-blue-600 text-white p-2 rounded-full
                cursor-pointer transition-all duration-300
                group-hover:bg-blue-700 hover:scale-105
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
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-1">Full Name</span>
            <p className="text-xl font-semibold text-white bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 transition-all duration-200 hover:bg-gray-600">
              {authUser?.fullName || "Not set"}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-1">Email</span>
            <p className="text-xl font-semibold text-white bg-gray-700 px-4 py-2 rounded-lg border border-gray-600 transition-all duration-200 hover:bg-gray-600">
              {authUser?.email || "Not set"}
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-300 mb-4 border-b border-gray-600 pb-2">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-sm">Member Since</span>
              <span className="text-sm font-medium">{formatDate(authUser?.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-sm">Account Status</span>
              <div className="flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom animation
const styles = `
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.9; }
  }
  .animate-pulse-slow {
    animation: pulse-slow 2s infinite;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ProfilePage;