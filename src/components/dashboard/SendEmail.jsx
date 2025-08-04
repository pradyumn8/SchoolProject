import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const SendEmail = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    // initialize once with your public key
    emailjs.init('6nvOsDTvLaT3WdEDm');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();


 const serviceId = 'service_p51k9zs';
    // const publicKey = '6nvOsDTvLaT3WdEDm';
    // const templateId = 'template_yms7e1u';
    const templateId = 'template_uomt3ee';

    const templateParams = {
      from_name: name,
      title:     title,
    };

    emailjs
      .send(serviceId, templateId, templateParams)
      .then((response) => {
        console.log('Email sent successfully:', response);
        alert('Email sent successfully!');
        setName('');
        setTitle('');
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again later.');
      });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Send Us a Message
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition transform"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default SendEmail;
