export const CalendarPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-6">
      <div className="flex max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
          📅
        </div>

        <h1 className="mb-3 text-3xl font-semibold text-gray-900">
          Calendar is coming soon
        </h1>

        <p className="mb-2 text-base leading-6 text-gray-500">
          The Calendar feature will be available in the next update.
        </p>

        <p className="mb-7 text-base leading-6 text-gray-500">
          Follow us to stay up to date with the latest news and updates.
        </p>

        <a
          href="https://www.figma.com/design/u9xmRpnPqH9Xo3GqAUcWCN/CRM?node-id=302669-135973&t=emmMASgN786kEaaZ-0"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          View the design
        </a>
      </div>
    </div>
  );
};


