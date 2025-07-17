// Indonesian translations for Dentalization App
export const id = {
  // Authentication
  auth: {
    login: "Masuk",
    register: "Daftar Baru",
    forgotPassword: "Lupa Password?",
    email: "Email",
    password: "Kata Sandi",
    confirmPassword: "Konfirmasi Kata Sandi",
    fullName: "Nama Lengkap",
    phoneNumber: "Nomor Telepon",
    username: "Nama Pengguna",
    welcomeBack: "Selamat Datang Kembali",
    newAccount: "Akun Baru",
    alreadyHaveAccount: "Sudah punya akun?",
    noAccount: "Belum punya akun?",
    loginInstead: "Masuk di sini",
    registerInstead: "Daftar di sini",
    resetPassword: "Atur Ulang Kata Sandi",
    resetPasswordInstructions: "Masukkan email Anda, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.",
    resetPasswordSent: "Email pengaturan ulang kata sandi telah dikirim. Silakan periksa kotak masuk Anda.",
    requiresPasswordReset: "Akun Anda membutuhkan pengaturan ulang kata sandi.",
  },
  
  // Validation
  validation: {
    required: "harus diisi",
    email: "harus berupa email yang valid",
    passwordLength: "harus minimal 8 karakter",
    passwordMatch: "kata sandi harus sama",
    passwordRequirements: "harus mengandung minimal 8 karakter, termasuk huruf kapital, huruf kecil, angka, dan simbol",
    phoneNumber: "harus berupa nomor telepon yang valid",
    invalidCredentials: "Email atau kata sandi tidak valid",
    usernameExists: "Nama pengguna sudah digunakan",
    emailExists: "Email sudah digunakan",
    generalError: "Terjadi kesalahan. Silakan coba lagi.",
  },

  // User types
  userTypes: {
    patient: "Pasien",
    doctor: "Dokter",
    admin: "Admin",
  },

  // Registration specific
  registration: {
    chooseType: "Pilih Jenis Pengguna",
    patientRegistration: "Pendaftaran Pasien",
    doctorRegistration: "Pendaftaran Dokter",
    personalInfo: "Informasi Pribadi",
    medicalInfo: "Informasi Medis",
    professionalInfo: "Informasi Profesional",
    profileDetails: "Detail Profil",
    accountCreationSuccess: "Akun berhasil dibuat!",
    termsConditions: "Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi kami",
    acceptTerms: "Saya menyetujui Syarat & Ketentuan",
    acceptPrivacy: "Saya menyetujui Kebijakan Privasi",
    loginToUse: "Silakan masuk untuk menggunakan aplikasi"
  },

  // Doctor registration fields
  doctorFields: {
    specialization: "Spesialisasi",
    licenseNumber: "Nomor Lisensi",
    experience: "Pengalaman (tahun)",
    education: "Pendidikan",
    hospital: "Rumah Sakit/Klinik",
    acceptsInsurance: "Menerima Asuransi",
    acceptsBPJS: "Menerima BPJS",
    emergencyAvailability: "Tersedia untuk Keadaan Darurat",
    consultationTypes: "Jenis Konsultasi",
    inPerson: "Tatap Muka",
    online: "Online",
    languages: "Bahasa",
    bio: "Biografi",
    bioPlaceholder: "Ceritakan sedikit tentang diri Anda, spesialisasi, dan pengalaman Anda...",
  },

  // Patient registration fields
  patientFields: {
    birthDate: "Tanggal Lahir",
    gender: "Jenis Kelamin",
    male: "Laki-laki",
    female: "Perempuan",
    preferNotToSay: "Lebih Memilih Tidak Mengatakan",
    bloodType: "Golongan Darah",
    allergies: "Alergi",
    allergiesPlaceholder: "Sebutkan alergi (jika ada), dipisahkan dengan koma",
    chronicConditions: "Kondisi Kronis",
    chronicConditionsPlaceholder: "Sebutkan kondisi kronis (jika ada), dipisahkan dengan koma",
    emergencyContact: "Kontak Darurat",
    emergencyContactName: "Nama Kontak Darurat",
    emergencyContactPhone: "Telepon Kontak Darurat",
    emergencyContactRelation: "Hubungan dengan Kontak Darurat",
    insuranceInfo: "Informasi Asuransi",
    insuranceProvider: "Penyedia Asuransi",
    insuranceNumber: "Nomor Asuransi",
    bpjsNumber: "Nomor BPJS",
  },

  // Common form fields
  form: {
    next: "Lanjut",
    previous: "Sebelumnya",
    submit: "Kirim",
    save: "Simpan",
    cancel: "Batal",
    select: "Pilih",
    search: "Cari",
    upload: "Unggah",
    delete: "Hapus",
    edit: "Edit",
    add: "Tambah",
    remove: "Hapus",
    clear: "Bersihkan",
    filter: "Filter",
    sort: "Urutkan",
    loading: "Memuat...",
    yes: "Ya",
    no: "Tidak",
    continue: "Lanjutkan",
    verify: "Verifikasi",
    resend: "Kirim Ulang",
    pleaseWait: "Harap tunggu...",
    checkData: "Periksa Data",
    fix: "Perbaiki",
  },

  // Error messages
  errors: {
    general: "Terjadi kesalahan",
    connection: "Masalah koneksi jaringan",
    serverError: "Kesalahan server",
    pageNotFound: "Halaman tidak ditemukan",
    unauthorized: "Tidak diizinkan",
    sessionExpired: "Sesi Anda telah berakhir",
    rateLimited: "Terlalu banyak percobaan, silakan coba lagi nanti",
    userAlreadyExists: "Pengguna dengan email ini sudah terdaftar",
    invalidData: "Data tidak valid",
    missingFields: "Beberapa kolom wajib diisi tidak terisi",
    tryAgainLater: "Silakan coba lagi nanti",
    emailInUse: "Email sudah digunakan",
    phoneInUse: "Nomor telepon sudah digunakan",
  },
  
  // Success messages
  success: {
    registered: "Pendaftaran berhasil!",
    profileUpdated: "Profil berhasil diperbarui",
    passwordReset: "Kata sandi berhasil diatur ulang",
    emailSent: "Email telah dikirim",
    dataSaved: "Data berhasil disimpan",
  }
};

export default id;
