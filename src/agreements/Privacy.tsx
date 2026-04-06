export const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 dark:text-gray-300">
      <h1 className="text-4xl font-medium text-center mb-10">
        Privacy Policy
      </h1>

      <p className="text-lg mb-8 leading-8">
        This Privacy Policy explains how this educational RAG chatbot application collects, uses, and handles user data.
      </p>

      <ol className="list-decimal pl-6 space-y-8 text-lg leading-8">
        <li>
          <span className="font-semibold text-xl">Purpose</span>
          <p className="mt-2">
            This application is developed for educational purposes only and is not intended for commercial use.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">Information We Collect</span>
          <p className="mt-2">
            We may collect the following types of data:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Files uploaded by users (e.g., PYQs, notes, study materials)</li>
            <li>Basic usage data (such as queries entered into the chatbot)</li>
          </ul>
          <p className="mt-2">We do not intentionally collect sensitive personal information.</p>
        </li>

        <li>
          <span className="font-semibold text-xl">How We Use Data</span>
          <p className="mt-2">
            The collected data is used to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Process and retrieve relevant information for chatbot responses</li>
            <li>Improve the functionality and performance of the system</li>
          </ul>
        </li>

        <li>
          <span className="font-semibold text-xl">Data Storage and Security</span>
          <p className="mt-2">
            Uploaded files and user inputs may be temporarily stored for processing. While reasonable efforts are made to protect data, we do not guarantee complete security.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">Data Sharing</span>
          <p className="mt-2">
            We do not sell, trade, or share user data with third parties. Data is used only within the scope of this project.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">User Responsibility</span>
          <p className="mt-2">
            Users should avoid uploading:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Personal or sensitive information</li>
            <li>Copyrighted material without permission</li>
          </ul>
        </li>

        <li>
          <span className="font-semibold text-xl">Data Retention</span>
          <p className="mt-2">
            Data may be deleted periodically and is not guaranteed to be stored permanently.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">Changes to This Policy</span>
          <p className="mt-2">
            This Privacy Policy may be updated as the project evolves.
          </p>
        </li>
      </ol>

      <p className="mt-10 text-lg font-semibold leading-8">
        By using this application, you agree to this Privacy Policy.
      </p>
    </div>
  );
};