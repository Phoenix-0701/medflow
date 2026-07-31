"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";

export default function PatientProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [modalMessage, setModalMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);
  
  // Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Tính tuổi (wrapped in useMemo to prevent impure render errors, placed before conditional returns)
  const age = useMemo(() => {
    if (!user?.patientProfile?.dateOfBirth) return "--";
    const dob = new Date(user.patientProfile.dateOfBirth);
    const diff = new Date().getTime() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
  }, [user?.patientProfile?.dateOfBirth]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json; // Handle NestJS Interceptor wrapping
        setUser(data);
        
        // Cập nhật State cho Form
        setFullName(data.fullName || "");
        setAvatarUrl(data.avatarUrl || "");
        
        const pInfo = data.patientProfile;
        if (pInfo) {
          setDateOfBirth(pInfo.dateOfBirth ? new Date(pInfo.dateOfBirth).toISOString().split('T')[0] : "");
          setGender(pInfo.gender || "");
          setBloodType(pInfo.bloodType || "");
          setAllergies(pInfo.allergies || "");
          setMedicalHistory(pInfo.medicalHistory || "");
          
          // Ép người dùng điền thông tin nếu thiếu thông tin quan trọng
          if (!pInfo.dateOfBirth || !pInfo.gender) {
            setIsEditing(true);
          }
        } else {
          // Bệnh nhân hoàn toàn mới (chưa có patientProfile)
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dateOfBirth || !gender) {
      setModalMessage({ title: "Thiếu thông tin", message: "Vui lòng điền đầy đủ Tên, Ngày sinh và Giới tính!", type: "error" });
      setTimeout(() => setModalMessage(null), 3000);
      return;
    }
    
    // Kiểm tra định dạng ngày hợp lệ (ISO 8601) cho class-validator
    let formattedDate = dateOfBirth;
    if (dateOfBirth.length === 10) { // YYYY-MM-DD
       formattedDate = `${dateOfBirth}T00:00:00.000Z`;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          dateOfBirth: formattedDate,
          gender,
          bloodType,
          allergies,
          medicalHistory,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const updatedUser = json.data || json;
        setUser(updatedUser);
        setModalMessage({ title: "Thành công!", message: "Hồ sơ cá nhân của bạn đã được lưu an toàn.", type: "success" });
        setTimeout(() => {
          setModalMessage(null);
          setIsEditing(false);
        }, 1500); // 1.5s sau tắt popup và chuyển sang trang view
      } else {
        const err = await res.json();
        setModalMessage({ title: "Lỗi lưu hồ sơ", message: err.message || "Lưu thất bại", type: "error" });
        setTimeout(() => setModalMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
      setModalMessage({ title: "Lỗi kết nối", message: "Không thể kết nối đến máy chủ.", type: "error" });
      setTimeout(() => setModalMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("accessToken");
      
      // 1. Xin Presigned URL từ Backend
      const urlRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me/avatar-upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!urlRes.ok) {
        const errData = await urlRes.json().catch(() => ({}));
        throw new Error("Lỗi Backend: " + (errData.message || "Không thể lấy đường dẫn upload S3"));
      }
      const json = await urlRes.json();
      const { uploadUrl, objectUrl } = json.data || json;

      // 2. Upload file trực tiếp lên S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("AWS S3 Error Response:", errorText);
        throw new Error(`Upload S3 thất bại. Lỗi từ AWS: ${uploadRes.status} ${uploadRes.statusText}`);
      }
      
      // 3. Cập nhật URL mới vào Backend
      const patchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarUrl: objectUrl }),
      });

      if (patchRes.ok) {
        setAvatarUrl(objectUrl);
        fetchProfile(); // Tải lại thông tin
      } else {
        throw new Error("Lỗi cập nhật URL ảnh vào hồ sơ");
      }
    } catch (error: any) {
      console.error(error);
      setModalMessage({ title: "Lỗi tải ảnh lên", message: error.message || "Vui lòng thử lại.", type: "error" });
      setTimeout(() => setModalMessage(null), 5000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setModalMessage({ title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới.", type: "error" });
      setTimeout(() => setModalMessage(null), 3000);
      return;
    }
    
    try {
      setChangingPassword(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (res.ok) {
        setShowChangePassword(false);
        setOldPassword("");
        setNewPassword("");
        setModalMessage({ title: "Thành công!", message: "Đổi mật khẩu thành công.", type: "success" });
        setTimeout(() => setModalMessage(null), 2000);
      } else {
        const err = await res.json();
        setModalMessage({ title: "Lỗi đổi mật khẩu", message: err.message || "Thất bại", type: "error" });
        setTimeout(() => setModalMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
      setModalMessage({ title: "Lỗi kết nối", message: "Không thể kết nối đến máy chủ.", type: "error" });
      setTimeout(() => setModalMessage(null), 3000);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải hồ sơ...</div>;
  }

  const renderModal = () => {
    if (!modalMessage) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 transform animate-bounce-short">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modalMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className="text-3xl">{modalMessage.type === 'success' ? '✅' : '❌'}</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{modalMessage.title}</h3>
          <p className="text-gray-500 text-center font-medium">
            {modalMessage.message}
          </p>
        </div>
      </div>
    );
  };

  // --- GIAO DIỆN CHỈNH SỬA (Hoặc bắt buộc điền mới) ---
  if (isEditing) {
    const isNewUser = !user?.patientProfile?.dateOfBirth;
    return (
      <div className="max-w-2xl mx-auto pb-10 relative">
        {renderModal()}

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isNewUser ? "Hoàn thiện Hồ sơ" : "Chỉnh sửa Hồ sơ"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isNewUser
              ? "Vui lòng cung cấp các thông tin cơ bản trước khi bắt đầu sử dụng hệ thống."
              : "Cập nhật thông tin cá nhân và y tế của bạn."}
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giới tính <span className="text-red-500">*</span></label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nhóm máu</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="">Chưa rõ</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tiền sử dị ứng</label>
              <input
                type="text"
                placeholder="VD: Hải sản, Penicillin..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tiền sử bệnh (Tóm tắt)</label>
            <textarea
              rows={4}
              placeholder="Nhập tiền sử bệnh lý, các phẫu thuật đã từng thực hiện..."
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            {!isNewUser && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- GIAO DIỆN XEM (PROFILE VIEW) ---
  
  const genderDisplay = user?.patientProfile?.gender === 'MALE' ? 'Nam' : user?.patientProfile?.gender === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <div className="max-w-5xl mx-auto pb-10 relative">
      {renderModal()}
      
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span>🔒</span> Đổi mật khẩu
            </h3>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu cũ</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Đang lưu..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Hồ sơ Bệnh nhân</h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý và xem xét dữ liệu sức khỏe cá nhân của bạn.</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>✏️</span> Chỉnh sửa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI (Thông tin cơ bản) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Card Avatar & Tên */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center shadow-sm relative group overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
            />
            
            <div 
              className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-5 cursor-pointer relative overflow-hidden ring-4 ring-white shadow-md hover:ring-blue-100 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" layout="fill" objectFit="cover" />
              ) : (
                <span className="text-gray-400 font-medium">img</span>
              )}
              
              {/* Overlay Upload */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Thay ảnh</span>
              </div>
              
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 text-center leading-tight mb-1">
              {user?.fullName}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {age} tuổi • {genderDisplay}
            </p>
            
            <div className="mt-5 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
              <p className="text-xs font-bold text-indigo-700 tracking-wider">
                <span className="mr-1">🆔</span> ID: MRN-{user?.id?.substring(0,6).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Card Nhóm máu */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">🩸 Nhóm máu</p>
              <h3 className="text-xl font-black text-gray-900">
                {user?.patientProfile?.bloodType || "Chưa rõ"}
              </h3>
            </div>
            {user?.patientProfile?.bloodType && (
              <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100">
                Đã xác minh
              </span>
            )}
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Card Tiền sử bệnh */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🩺</span> Tiền sử bệnh lý
              </h3>
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <span>✨</span> AI Summarized
              </span>
            </div>
            
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-6">
              
              {/* Dị ứng */}
              <div className="relative">
                <div className="absolute w-3 h-3 bg-white border-2 border-amber-400 rounded-full -left-[27px] top-1"></div>
                <h4 className="text-sm font-black text-gray-900">Tiền sử dị ứng</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {user?.patientProfile?.allergies || "Không ghi nhận."}
                </p>
              </div>

              {/* Bệnh nền */}
              <div className="relative">
                <div className="absolute w-3 h-3 bg-white border-2 border-gray-300 rounded-full -left-[27px] top-1"></div>
                <h4 className="text-sm font-black text-gray-900">Tiền sử bệnh lý & Phẫu thuật</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {user?.patientProfile?.medicalHistory || "Không có tiền sử bệnh lý nghiêm trọng được ghi nhận."}
                </p>
              </div>

            </div>
          </div>

          {/* Card Account Settings */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>⚙️</span> Cài đặt tài khoản
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Change Password Block */}
              <div onClick={() => setShowChangePassword(true)} className="block border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="text-2xl mt-1 group-hover:scale-110 transition-transform">🔒</div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-700">Đổi mật khẩu</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Cập nhật thông tin đăng nhập và tăng cường bảo mật tài khoản.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
