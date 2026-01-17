import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, usersApi } from '../services/api';
import UserProfileForm from '../components/profile/UserProfileForm';

// Safely persist extra profile fields locally to avoid impacting other pages/backend.
// Keyed per-user to prevent collisions.
const extrasKey = (userId) => `userProfileExtras:${userId}`;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) return resolve(null);
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const UserProfile = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialValues, setInitialValues] = useState({});
  const [extrasSnapshot, setExtrasSnapshot] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarWrapperRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Resolve user id and basic identity from either context or localStorage
        const storedUser = (() => {
          try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
        })();
        const userId = currentUser?.id || storedUser?.id || null;

        // Fetch base profile only if we have an id
        let data = null;
        if (userId) {
          try {
            const resp = await usersApi.getProfile(userId);
            data = resp?.data || null;
          } catch { /* non-fatal */ }
        }

        // Load extras safely (if userId missing, treat as empty)
        const extras = userId ? (JSON.parse(localStorage.getItem(extrasKey(userId)) || '{}')) : {};

        setInitialValues({
          fullName: data?.username || currentUser?.username || storedUser?.username || '',
          email: data?.email || currentUser?.email || storedUser?.email || '',
          dob: extras.dob || extras.dateOfBirth || '',
          gender: extras.gender || '',
          heightCm: extras.heightCm ?? '',
          weightKg: extras.weightKg ?? '',
          activityLevel: extras.activityLevel || '',
          dietaryPreference: extras.dietaryPreference || '',
          fitnessGoal: extras.fitnessGoal || '',
          location: extras.location || '',
          mobile: extras.mobile || '',
        });
        setExtrasSnapshot(extras);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  // Optional email uniqueness check – attempts a safe GET, falls back to true
  const checkEmailUnique = async (email) => {
    try {
      const res = await api.get('/users/check-email', { params: { email } });
      // expecting { unique: boolean }
      if (typeof res?.data?.unique === 'boolean') return res.data.unique;
      return true;
    } catch {
      // If endpoint not available, do not block user
      return true;
    }
  };

  const computeBmi = (heightCm, weightKg) => {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!h || !w) return null;
    const bmi = w / Math.pow(h / 100, 2);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 24.9) category = 'Normal';
    else if (bmi < 29.9) category = 'Overweight';
    else category = 'Obese';
    return { bmi: Number(bmi.toFixed(1)), category };
  };

  const computeAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age >= 0 && age < 150 ? age : null;
  };

  const uploadAvatar = async (file) => {
    if (!currentUser || !file) return null;
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or less');
      return null;
    }
    // Try backend upload, fallback to data URL
    let finalUrl = await fileToDataUrl(file);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post(`/users/profile/${currentUser.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.data?.avatarUrl) finalUrl = res.data.avatarUrl;
    } catch (e) {
      console.warn('Avatar upload failed or endpoint missing. Using local data URL.', e);
    }
    // Persist to local extras
    try {
      const raw = localStorage.getItem(extrasKey(currentUser.id));
      const extras = raw ? JSON.parse(raw) : {};
      const next = { ...extras, avatarDataUrl: finalUrl };
      localStorage.setItem(extrasKey(currentUser.id), JSON.stringify(next));
      setExtrasSnapshot(next);
      setSuccess('Profile picture updated.');
      setError('');
    } catch (e) {
      console.error('Failed saving avatar to localStorage', e);
    }
    return finalUrl;
  };

  const removeAvatar = () => {
    if (!currentUser) return;
    try {
      const raw = localStorage.getItem(extrasKey(currentUser.id));
      const extras = raw ? JSON.parse(raw) : {};
      const { avatarDataUrl, ...rest } = extras;
      localStorage.setItem(extrasKey(currentUser.id), JSON.stringify(rest));
      setExtrasSnapshot(rest);
      setSuccess('Profile picture removed.');
      setError('');
    } catch (e) {
      console.error('Failed removing avatar', e);
    }
  };

  const handleSubmit = async (payload) => {
    if (!currentUser) return;
    setError('');
    setSuccess('');

    // Split payload into backend-friendly and local extras
    const { fullName, email, password, profilePictureFile, ...extras } = payload;

    try {
      // 1) Update minimal account fields to avoid breaking other pages
      await usersApi.updateProfile(currentUser.id, {
        username: fullName,
        email,
        ...(password ? { password } : {})
      });

      // 2) Persist extras locally (and store avatar as data URL)
      const avatarDataUrl = await fileToDataUrl(profilePictureFile);

      // 2a) Try uploading avatar to backend if supported; fall back gracefully
      let finalAvatarUrl = avatarDataUrl;
      if (profilePictureFile) {
        try {
          const formData = new FormData();
          formData.append('avatar', profilePictureFile);
          const res = await api.post(`/users/profile/${currentUser.id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res?.data?.avatarUrl) {
            finalAvatarUrl = res.data.avatarUrl;
          }
        } catch (e) {
          console.warn('Avatar upload failed or endpoint missing. Using local data URL.', e);
        }
      }

      localStorage.setItem(
        extrasKey(currentUser.id),
        JSON.stringify({ ...extras, avatarDataUrl: finalAvatarUrl })
      );

      // Update snapshot for summary panel
      setExtrasSnapshot({ ...extras, avatarDataUrl: finalAvatarUrl });

      // Notify other pages of location changes
      try {
        window.dispatchEvent(new CustomEvent('profile:location-updated', {
          detail: { userId: currentUser.id, location: extras.location }
        }));
      } catch {}

      // 3) Update AuthContext
      updateCurrentUser((prev) => ({ ...prev, username: fullName, email }));

      setSuccess('Profile saved successfully.');

      // Keep form in sync and exit edit mode
      setInitialValues({
        fullName,
        email,
        dob: extras.dob || '',
        gender: extras.gender || '',
        heightCm: extras.heightCm ?? '',
        weightKg: extras.weightKg ?? '',
        activityLevel: extras.activityLevel || '',
        dietaryPreference: extras.dietaryPreference || '',
        fitnessGoal: extras.fitnessGoal || '',
        location: extras.location || '',
        mobile: extras.mobile || '',
      });
      setEditMode(false);
    } catch (err) {
      console.error('UserProfile save error:', err);
      setError(err?.response?.data?.message || 'Failed to save profile');
    }
  };

  const profileCreated = !!(extrasSnapshot && extrasSnapshot.location);

  // Close avatar menu on outside click or Escape
  useEffect(() => {
    if (!showAvatarMenu) return;
    const onDown = (e) => {
      const menuEl = avatarMenuRef.current;
      const wrapEl = avatarWrapperRef.current;
      if (!menuEl || !wrapEl) return;
      if (menuEl.contains(e.target) || wrapEl.contains(e.target)) return;
      setShowAvatarMenu(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setShowAvatarMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [showAvatarMenu]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary text-white px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {(initialValues.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <div className="text-white/85 text-sm">Manage your account and health preferences</div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Summary section */}
          {profileCreated && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Clickable Avatar */}
                <div className="relative" ref={avatarWrapperRef}>
                  {extrasSnapshot.avatarDataUrl ? (
                    <img
                      src={extrasSnapshot.avatarDataUrl}
                      alt="Avatar"
                      title="Click to change photo"
                      className="h-16 w-16 rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90"
                      onClick={() => setShowAvatarMenu((s) => !s)}
                    />
                  ) : (
                    <div
                      className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold cursor-pointer"
                      title="Click to add photo"
                      onClick={() => setShowAvatarMenu((s) => !s)}
                    >
                      {(initialValues.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    ref={avatarInputRef}
                    onChange={async (e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      await uploadAvatar(f);
                      setShowAvatarMenu(false);
                      if (e.target) e.target.value = '';
                    }}
                  />

                  {showAvatarMenu && (
                    <div
                      ref={avatarMenuRef}
                      className="absolute z-20 mt-2 left-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex flex-col items-stretch"
                      style={{ width: '5cm', height: '5cm' }}
                    >
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Profile Photo</div>
                      <button
                        className="text-sm px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        Update Photo
                      </button>
                      {extrasSnapshot.avatarDataUrl && (
                        <button
                          className="mt-2 text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => { removeAvatar(); setShowAvatarMenu(false); }}
                        >
                          Remove Photo
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:underline self-end"
                        onClick={() => setShowAvatarMenu(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary identity */}
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-white font-semibold text-lg">{initialValues.fullName || currentUser?.username}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{initialValues.email || currentUser?.email}</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    {extrasSnapshot.location && (
                      <div className="text-gray-700 dark:text-gray-300">📍 {extrasSnapshot.location}</div>
                    )}
                    {extrasSnapshot.mobile && (
                      <div className="text-gray-700 dark:text-gray-300">📞 {extrasSnapshot.mobile}</div>
                    )}
                    {(() => {
                      const age = computeAge(extrasSnapshot.dob || extrasSnapshot.dateOfBirth);
                      return age ? <div className="text-gray-700 dark:text-gray-300">🎂 Age: {age}</div> : null;
                    })()}
                    {extrasSnapshot.gender && (
                      <div className="text-gray-700 dark:text-gray-300">⚧ {extrasSnapshot.gender}</div>
                    )}
                    {extrasSnapshot.heightCm && (
                      <div className="text-gray-700 dark:text-gray-300">📏 Height: {extrasSnapshot.heightCm} cm</div>
                    )}
                    {extrasSnapshot.weightKg && (
                      <div className="text-gray-700 dark:text-gray-300">⚖️ Weight: {extrasSnapshot.weightKg} kg</div>
                    )}
                    {extrasSnapshot.activityLevel && (
                      <div className="text-gray-700 dark:text-gray-300">🏃 Activity: {extrasSnapshot.activityLevel}</div>
                    )}
                    {extrasSnapshot.dietaryPreference && (
                      <div className="text-gray-700 dark:text-gray-300">🥗 Diet: {extrasSnapshot.dietaryPreference}</div>
                    )}
                    {extrasSnapshot.fitnessGoal && (
                      <div className="text-gray-700 dark:text-gray-300">🎯 Goal: {extrasSnapshot.fitnessGoal}</div>
                    )}
                  </div>
                </div>

                {/* BMI block */}
                <div className="text-right">
                  {(extrasSnapshot.heightCm && extrasSnapshot.weightKg) ? (
                    (() => {
                      const info = computeBmi(extrasSnapshot.heightCm, extrasSnapshot.weightKg);
                      return info ? (
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          BMI: <span className="font-semibold">{info.bmi}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{info.category}</div>
                        </div>
                      ) : null;
                    })()
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Add height and weight to see BMI</div>
                  )}
                </div>
              </div>

              {/* Update button only when not editing */}
              {!editMode && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                  onClick={() => setEditMode(true)}
                >
                  Update Profile
                </button>
              </div>
              )}
            </div>
          )}

          {/* Show form only if creating OR editing */}
          {(!profileCreated || editMode) && (
            <div>
              {editMode && (
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <UserProfileForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                checkEmailUnique={checkEmailUnique}
                mode={profileCreated && editMode ? 'update' : 'create'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
