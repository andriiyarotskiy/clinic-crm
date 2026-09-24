export const errorPageConfig = {
  401: {
    title: "You need to sign in",
    description:
      "Your session has expired or you are not authorized to access this page.",
  },

  403: {
    title: "This smile is protected",
    description:
      "You don't have permission to access this page. Please contact your administrator.",
  },

  404: {
    title: "This page doesn't exist",
    description:
      "The page you are looking for may have been moved, deleted, or never existed.",
  },
} as const;