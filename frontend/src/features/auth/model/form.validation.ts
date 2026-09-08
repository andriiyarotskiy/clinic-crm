
export const formValidation = {
   requireField: {
    required: "required field",
  },
  email: {
    required: "email is required",
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: "email not correct!",
    },
  },

  password: {
    required: "password is required",
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\\/]).{8,}$/,
      message:
        "The password must consist of at least 8 characters and contain letters, numbers, and special characters.",
    },
  },
  phoneNumber: {
    required: "Phone number is required",
    pattern: {
      value: /^\+[0-9]{10,15}$/,
      message: "Enter a valid phone number",
    },
  },
  name: {
    required: "First name is required",
    pattern: {
      value: /^[A-Za-zА-Яа-яІіЇїЄєҐґ]+(?:['’-][A-Za-zА-Яа-яІіЇїЄєҐґ]+)*$/,
      message: "Name can contain only letters, hyphens, and apostrophes",
    },
  },
  specialization: {
    required: "Specialization is required",
  },
  yearsExperience: {
    required: "Experience is required",
    min: {
      value: 1,
      message: "Experience cannot be zero",
    },
    max: {
      value: 60,
      message: "Experience cannot exceed 60 years",
    },
    valueAsNumber: true,
  },
  workingDays: {
    validate: (value:string[]) => value.length > 0 || "Select at least one working day",
  },

  employmentType: {
    required: "Please select employment type",
  },
  gender: {
    required: "Please select a gender",
  },

  birthDate: {
    required: "Date of birth is required",
    validate: {
      notInFuture: (value: string | number) => {
        const birth = new Date(String(value));

        return birth <= new Date() || "Date of birth cannot be in the future";
      },

      validAge: (value: string | number) => {
        const birth = new Date(String(value));
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();

        const monthDiff = today.getMonth() - birth.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
          age--;
        }

        return age >= 6 || "Patient must be at least 6 years old";
      },

      maxAge: (value: string | number) => {
        const birth = new Date(String(value));
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();

        const monthDiff = today.getMonth() - birth.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
          age--;
        }

        return age <= 120 || "Invalid date of birth";
      },
    },
  },
  address: {
    required: "Address is required",
    minLength: {
      value: 5,
      message: "Address must be at least 5 characters",
    },
    maxLength: {
      value: 255,
      message: "Address cannot exceed 255 characters",
    },
    pattern: {
      value: /^[A-Za-zА-Яа-яІіЇїЄєҐґ0-9\s.,'’"/\-№]+$/,
      message: "Address contains invalid characters",
    },
  },
  doctor: {
    required: "Select a doctor",
  },
  treatments: {
    required: "Treatments is required",
  },
  date: {
    required: "Select a time",
  },
  notes: {
    maxLength: {
      value: 255,
      message: "Notes cannot exceed 255 characters",
    },
  },
   tooth:{
    required: "Tooth is required",
    min: {
      value: 1,
      message: "Enter a valid tooth number",
    },
    max: {
      value: 36,
      message: "Enter a valid tooth number",
    },
  }
};
