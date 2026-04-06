import React from "react";

export const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24
     dark:text-gray-300">
      <h1 className="text-4xl font-medium text-center mb-10">
        Terms of Service
      </h1>

      <p className="text-lg mb-8 leading-8">
        This application is a Retrieval-Augmented Generation (RAG) chatbot developed
        for educational purposes. By using this service, you agree to the following terms:
      </p>

      <ol className="list-decimal pl-6 space-y-8 text-lg leading-8">
        <li>
          <span className="font-semibold text-xl">
            Educational Use Only
          </span>
          <p className="mt-2">
            This project is intended solely for academic and learning purposes.
            It should not be used for any commercial or unauthorized activities.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">
            User-Provided Content
          </span>
          <p className="mt-2">
            Users may upload files such as previous year questions (PYQs) or study materials.
            You are responsible for ensuring that the content you upload:
          </p>

          <ol className="list-[lower-alpha] pl-6 mt-3 space-y-2">
            <li>Does not violate copyright laws</li>
            <li>Does not contain harmful, offensive, or illegal material</li>
          </ol>
        </li>

        <li>
          <span className="font-semibold text-xl">
            Data Usage
          </span>
          <p className="mt-2">
            Uploaded files may be processed by the chatbot to generate responses.
            The system does not guarantee permanent storage or complete security
            of uploaded data.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">
            AI Limitations
          </span>
          <p className="mt-2">
            The chatbot generates responses based on available data and may produce
            incorrect or incomplete answers. Users should verify important information
            independently.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">
            No Liability
          </span>
          <p className="mt-2">
            The developers are not responsible for any loss, damage, or misuse
            resulting from the use of this application.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">
            Access and Termination
          </span>
          <p className="mt-2">
            Access to the application may be limited, modified, or terminated at any
            time without notice.
          </p>
        </li>

        <li>
          <span className="font-semibold text-xl">
            Changes to Terms
          </span>
          <p className="mt-2">
            These terms may be updated as the project evolves.
          </p>
        </li>
      </ol>

      <p className="mt-10 text-lg font-semibold leading-8">
        By using this application, you acknowledge that you have read and agreed to these terms.
      </p>
    </div>
  );
};