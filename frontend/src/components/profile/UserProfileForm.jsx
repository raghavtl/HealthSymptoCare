import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * UserProfileForm – reusable profile creation form
 *
 * Props:
 *  - onSubmit: async (payload) => Promise<void>
 *      Called with validated data. payload includes the File object for the profile picture.
 *  - checkEmailUnique?: async (email: string) => Promise<boolean>
 *      Optional async uniqueness check. Default always resolves true (skip uniqueness check).
 *  - initialValues?: Partial<Fields>
 *      Optional initial values if you want to prefill.
 *
 * Behavior:
 *  - No persistence is performed here. Pass an onSubmit handler to send data to your backend.
 *  - Includes image preview for profile picture.
 *  - Dark mode friendly (Tailwind `dark:` variants).
 */
export default function UserProfileForm({ onSubmit, checkEmailUnique, initialValues = {}, mode = 'create' }) {
  const defaultCheck = async () => true;
  const checkUnique = checkEmailUnique || defaultCheck;

  const [form, setForm] = useState({
    fullName: initialValues.fullName || '',
    email: initialValues.email || '',
    password: initialValues.password || '',
    dob: initialValues.dob || '',
    gender: initialValues.gender || '',
    profilePictureFile: null,
    heightCm: initialValues.heightCm ?? '',
    weightKg: initialValues.weightKg ?? '',
    activityLevel: initialValues.activityLevel || '',
    dietaryPreference: initialValues.dietaryPreference || '',
    fitnessGoal: initialValues.fitnessGoal || '',
    location: initialValues.location || '',
    mobile: initialValues.mobile || '',
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailUnique, setEmailUnique] = useState(true);
  const fileInputRef = useRef(null);

  // Basic validators
  const validators = useMemo(() => ({
    fullName: (v) => (!v ? 'Full name is required' : undefined),
    email: (v) => {
      if (!v) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v)) return 'Enter a valid email address';
      return undefined;
    },
    password: (v) => {
      if (mode === 'create') {
        return !v ? 'Password is required' : v.length < 6 ? 'Password must be at least 6 characters' : undefined;
      }
      // update mode: optional
      if (!v) return undefined;
      return v.length < 6 ? 'Password must be at least 6 characters' : undefined;
    },
    dob: (v) => {
      if (!v) return 'Date of birth is required';
      const d = new Date(v);
      const now = new Date();
      if (Number.isNaN(d.getTime())) return 'Enter a valid date';
      if (d > now) return 'Date of birth cannot be in the future';
      return undefined;
    },
    gender: (_) => undefined, // optional
    profilePictureFile: (_) => undefined,
    heightCm: (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      const n = Number(v);
      if (Number.isNaN(n) || n <= 0) return 'Enter a valid positive height';
      if (n > 300) return 'Height seems too large';
      return undefined;
    },
    weightKg: (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      const n = Number(v);
      if (Number.isNaN(n) || n <= 0) return 'Enter a valid positive weight';
      if (n > 600) return 'Weight seems too large';
      return undefined;
    },
    activityLevel: (_) => undefined,
    dietaryPreference: (_) => undefined,
    fitnessGoal: (_) => undefined,
    location: (v) => (!v ? 'Location is required' : undefined),
    mobile: (v) => {
      if (!v) return undefined; // optional
      const digits = String(v).replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number';
      return undefined;
    },
  }), [mode]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const msg = validators[name] ? validators[name](value) : undefined;
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    if (validators[name]) {
      const msg = validators[name](value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
    if (name === 'email' && !errors.email && value) {
      setCheckingEmail(true);
      try {
        const ok = await checkUnique(value.trim());
        setEmailUnique(ok);
        if (!ok) setErrors((prev) => ({ ...prev, email: 'Email is already in use' }));
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setForm((f) => ({ ...f, profilePictureFile: null }));
      setPreviewUrl('');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, profilePictureFile: 'Please choose an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profilePictureFile: 'Image must be 5MB or less' }));
      return;
    }
    setErrors((prev) => ({ ...prev, profilePictureFile: undefined }));
    setForm((f) => ({ ...f, profilePictureFile: file }));
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, profilePictureFile: null }));
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateAll = async () => {
    const nextErrors = {};
    for (const key of Object.keys(validators)) {
      const fn = validators[key];
      if (fn) {
        const msg = fn(form[key]);
        if (msg) nextErrors[key] = msg;
      }
    }
    // Email uniqueness if no format error
    if (!nextErrors.email && form.email) {
      setCheckingEmail(true);
      try {
        const ok = await checkUnique(form.email.trim());
        setEmailUnique(ok);
        if (!ok) nextErrors.email = 'Email is already in use';
      } finally {
        setCheckingEmail(false);
      }
    }
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = await validateAll();
    if (Object.values(nextErrors).some(Boolean)) {
      // Focus first error
      const first = Object.keys(nextErrors)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.focus();
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        dob: form.dob,
        gender: form.gender || null,
        heightCm: form.heightCm === '' ? null : Number(form.heightCm),
        weightKg: form.weightKg === '' ? null : Number(form.weightKg),
        activityLevel: form.activityLevel || null,
        dietaryPreference: form.dietaryPreference || null,
        fitnessGoal: form.fitnessGoal || '',
        location: form.location.trim(),
        mobile: (form.mobile || '').trim(),
        profilePictureFile: form.profilePictureFile || null,
      };
      if (onSubmit) await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  // Tailwind helper for label+input spacing
  const fieldClass = 'space-y-1';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-white';
  const inputClass = 'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
  const selectClass = inputClass;
  const subTextClass = 'text-xs text-gray-500 dark:text-gray-300';
  const errorClass = 'text-sm text-red-600 mt-1';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{mode === 'update' ? 'Update Your Profile' : 'Create Your Profile'}</h2>
      <p className="mb-6 text-gray-600 dark:text-white/90">{mode === 'update' ? 'Update your details to keep your health profile current.' : 'Fill in your details to personalize your health experience.'}</p>

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={inputClass}
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            onBlur={handleBlur}
            required
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {errors.fullName && <div id="fullName-error" className={errorClass}>{errors.fullName}</div>}
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={handleBlur}
            required
            aria-invalid={!!errors.email}
            aria-describedby={(errors.email ? 'email-error ' : '') + (checkingEmail ? 'email-checking' : '')}
          />
          {checkingEmail && <div id="email-checking" className={subTextClass}>Checking email…</div>}
          {!emailUnique && !errors.email && <div className="text-xs text-red-600">Email is already in use</div>}
          {errors.email && <div id="email-error" className={errorClass}>{errors.email}</div>}
        </div>
      </div>

      {/* Password & DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            className={inputClass}
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            onBlur={handleBlur}
            required={mode === 'create'}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && <div id="password-error" className={errorClass}>{errors.password}</div>}
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="dob">Date of Birth *</label>
          <input
            id="dob"
            name="dob"
            type="date"
            className={inputClass}
            value={form.dob}
            onChange={(e) => setField('dob', e.target.value)}
            onBlur={handleBlur}
            required
            aria-invalid={!!errors.dob}
            aria-describedby={errors.dob ? 'dob-error' : undefined}
          />
          {errors.dob && <div id="dob-error" className={errorClass}>{errors.dob}</div>}
        </div>
      </div>

      {/* Gender & Profile Picture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            className={selectClass}
            value={form.gender}
            onChange={(e) => setField('gender', e.target.value)}
            onBlur={handleBlur}
          >
            <option value="">Select…</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="profilePicture">Profile Picture</label>
          <input
            id="profilePicture"
            name="profilePicture"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {errors.profilePictureFile && <div className={errorClass}>{errors.profilePictureFile}</div>}
          {previewUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-gray-200 dark:border-gray-700" />
              <button type="button" onClick={removeImage} className="text-sm px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600">Remove</button>
            </div>
          )}
          <div className={subTextClass}>Max 5MB. JPG/PNG.</div>
        </div>
      </div>

      {/* Height & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="heightCm">Height (cm)</label>
          <input
            id="heightCm"
            name="heightCm"
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={form.heightCm}
            onChange={(e) => setField('heightCm', e.target.value)}
            onBlur={handleBlur}
            aria-invalid={!!errors.heightCm}
            aria-describedby={errors.heightCm ? 'heightCm-error' : undefined}
          />
          {errors.heightCm && <div id="heightCm-error" className={errorClass}>{errors.heightCm}</div>}
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="weightKg">Weight (kg)</label>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={form.weightKg}
            onChange={(e) => setField('weightKg', e.target.value)}
            onBlur={handleBlur}
            aria-invalid={!!errors.weightKg}
            aria-describedby={errors.weightKg ? 'weightKg-error' : undefined}
          />
          {errors.weightKg && <div id="weightKg-error" className={errorClass}>{errors.weightKg}</div>}
        </div>
      </div>

      {/* Activity & Diet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="activityLevel">Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            className={selectClass}
            value={form.activityLevel}
            onChange={(e) => setField('activityLevel', e.target.value)}
            onBlur={handleBlur}
          >
            <option value="">Select…</option>
            <option>Sedentary</option>
            <option>Moderate</option>
            <option>Active</option>
          </select>
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="dietaryPreference">Dietary Preference</label>
          <select
            id="dietaryPreference"
            name="dietaryPreference"
            className={selectClass}
            value={form.dietaryPreference}
            onChange={(e) => setField('dietaryPreference', e.target.value)}
            onBlur={handleBlur}
          >
            <option value="">Select…</option>
            <option>Vegetarian</option>
            <option>Vegan</option>
            <option>Non-Vegetarian</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Fitness Goal & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="fitnessGoal">Fitness Goal</label>
          <input
            id="fitnessGoal"
            name="fitnessGoal"
            type="text"
            className={inputClass}
            value={form.fitnessGoal}
            onChange={(e) => setField('fitnessGoal', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., Lose weight, Build muscle, Improve stamina"
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="location">Location (City/Town) *</label>
          <input
            id="location"
            name="location"
            type="text"
            className={inputClass}
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            onBlur={handleBlur}
            required
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? 'location-error' : undefined}
          />
          {errors.location && <div id="location-error" className={errorClass}>{errors.location}</div>}
          <div className={subTextClass}>Required for the Nearby Care feature.</div>
        </div>
      </div>

      {/* Mobile Number (optional) */}
      <div className="grid grid-cols-1 mt-4">
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="mobile">Mobile Number (optional)</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            className={inputClass}
            value={form.mobile}
            onChange={(e) => setField('mobile', e.target.value)}
            onBlur={handleBlur}
            aria-invalid={!!errors.mobile}
            aria-describedby={errors.mobile ? 'mobile-error' : undefined}
            placeholder="e.g., +91 98765 43210"
          />
          {errors.mobile && <div id="mobile-error" className={errorClass}>{errors.mobile}</div>}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="submit"
          className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={submitting || checkingEmail}
        >
          {submitting ? (mode === 'update' ? 'Updating…' : 'Creating…') : (mode === 'update' ? 'Update Profile' : 'Create Profile')}
        </button>
      </div>
    </form>
  );
}
