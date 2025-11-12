import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SigninPage({ onSignin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSignin(form); // mock signin
    navigate("/");  // redirect to gallery
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Sign In
        </h2>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange}
          className="w-full p-3 mb-6 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-md">
          Sign In
        </button>
        <p className="text-gray-400 text-sm mt-4 text-center">
          Don’t have an account? <span onClick={() => navigate("/signup")} className="text-purple-400 cursor-pointer hover:underline">Sign Up</span>
        </p>
      </form>
    </div>
  );
}
