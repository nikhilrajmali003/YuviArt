import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Trash2, Check, X, Menu, Search, AlertCircle, Loader, Image, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const AdminPanel = () => {
  const [artworks, setArtworks] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTab, setActiveTab] = useState('artworks');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'portraits',
    price: '',
    rating: 5,
    stockQuantity: 1
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchArtworks();
    fetchTestimonials();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/artworks`);
      if (response.ok) {
        const data = await response.json();
        setArtworks(data);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/all`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }
      
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!selectedImage && !imagePreview) newErrors.image = 'Please select an image';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('stockQuantity', formData.stockQuantity);
      formDataToSend.append('image', selectedImage);

      const response = await fetch(`${API_BASE_URL}/artworks/with-image`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        showSuccess('✅ Artwork uploaded successfully!');
        setFormData({
          title: '',
          description: '',
          category: 'portraits',
          price: '',
          rating: 5,
          stockQuantity: 1
        });
        setSelectedImage(null);
        setImagePreview(null);
        setErrors({});
        fetchArtworks();
      } else {
        alert('❌ Failed to upload artwork');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('⚠️ Error uploading artwork');
    } finally {
      setUploading(false);
    }
  };

  const deleteArtwork = async (id) => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/artworks/${id}`, { method: 'DELETE' });
        if (response.ok) {
          showSuccess('✅ Artwork deleted successfully!');
          fetchArtworks();
        }
      } catch (error) {
        console.error('Error deleting artwork:', error);
        alert('⚠️ Failed to delete artwork');
      }
    }
  };

  const approveTestimonial = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}/approve`, { method: 'PUT' });
      if (response.ok) {
        showSuccess('✅ Testimonial approved!');
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error approving testimonial:', error);
      alert('⚠️ Failed to approve testimonial');
    }
  };

  const deleteTestimonial = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, { method: 'DELETE' });
        if (response.ok) {
          showSuccess('✅ Testimonial deleted!');
          fetchTestimonials();
        }
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert('⚠️ Failed to delete testimonial');
      }
    }
  };

  // Memoized filtered artworks for better performance
  const filteredArtworks = useMemo(() => {
    return artworks.filter(artwork => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artwork.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || artwork.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [artworks, searchQuery, filterCategory]);

  const pendingTestimonials = useMemo(() => testimonials.filter(t => !t.approved), [testimonials]);
  const approvedTestimonials = useMemo(() => testimonials.filter(t => t.approved), [testimonials]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-xl shadow-lg">
                A
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs - Desktop */}
        <div className="hidden lg:flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('artworks')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'artworks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700'
            }`}
          >
            Manage Artworks ({artworks.length})
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'testimonials'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700'
            }`}
          >
            Manage Testimonials 
            {pendingTestimonials.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingTestimonials.length} pending
              </span>
            )}
          </button>
        </div>

        {/* Tabs - Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden mb-6 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('artworks');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'artworks'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              Manage Artworks ({artworks.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('testimonials');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'testimonials'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              Manage Testimonials ({testimonials.length})
              {pendingTestimonials.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                  {pendingTestimonials.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Artwork Management */}
        {activeTab === 'artworks' && (
          <div className="space-y-6">
            {/* Upload Form */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload New Artwork
              </h2>
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block mb-2 font-semibold text-sm sm:text-base">Artwork Image *</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 sm:p-6 text-center hover:border-purple-400 transition cursor-pointer bg-gray-900/30">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-lg" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-400 text-sm sm:text-base font-medium">Click to upload image</p>
                          <p className="text-gray-500 text-xs mt-1">Max 5MB • JPG, PNG, GIF</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.image && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.image}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                </div>

                <div>
                  <textarea
                    placeholder="Description *"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
                    rows="3"
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
                </div>

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="portraits">Portraits</option>
                  <option value="sketches">Sketches</option>
                  <option value="paintings">Paintings</option>
                  <option value="custom">Custom Art</option>
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <input 
                      type="number" 
                      placeholder="Price (₹) *" 
                      value={formData.price} 
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                      className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.price ? 'border-red-500' : 'border-gray-600'}`} 
                      min="0" 
                      step="0.01" 
                    />
                    {errors.price && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  <input type="number" placeholder="Rating (1-5)" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" min="1" max="5" />
                  <input type="number" placeholder="Stock" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })} className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" min="1" />
                </div>

                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={uploading} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Artwork
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search artworks..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 sm:w-48"
              >
                <option value="all">All Categories</option>
                <option value="portraits">Portraits</option>
                <option value="sketches">Sketches</option>
                <option value="paintings">Paintings</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Artworks Grid */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Current Artworks ({filteredArtworks.length})
              </h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : filteredArtworks.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No artworks found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArtworks.map((artwork) => (
                    <div key={artwork.id} className="bg-gray-700/50 rounded-xl overflow-hidden border border-gray-600 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/20">
                      <div className="relative aspect-square">
                        <img 
                          src={artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : `http://localhost:8080${artwork.imageUrl}`} 
                          alt={artwork.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                        <button 
                          onClick={() => deleteArtwork(artwork.id)} 
                          className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg transition opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 truncate">{artwork.title}</h3>
                        <p className="text-gray-400 text-sm mb-2 capitalize">{artwork.category}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-semibold text-lg">₹{artwork.price}</span>
                          <span className="text-gray-400 text-sm">Stock: {artwork.stockQuantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Testimonials Management */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            {/* Pending Testimonials */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Pending Testimonials ({pendingTestimonials.length})
              </h2>
              {pendingTestimonials.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No pending testimonials</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pendingTestimonials.map((t) => (
                    <div key={t.id} className="bg-yellow-900/10 border border-yellow-500/30 p-4 sm:p-5 rounded-xl hover:border-yellow-500/50 transition">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="font-bold">{t.name}</h3>
                          <p className="text-sm text-gray-400">{t.email}</p>
                        </div>
                        <div className="flex">{[...Array(t.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}</div>
                      </div>
                      <p className="text-gray-300 mb-4 text-sm leading-relaxed">"{t.text}"</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => approveTestimonial(t.id)} 
                          className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition font-semibold transform hover:scale-105"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button 
                          onClick={() => deleteTestimonial(t.id)} 
                          className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition font-semibold transform hover:scale-105"
                        >
                          <X className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Testimonials */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-green-400 flex items-center gap-2">
                <Check className="w-6 h-6" />
                Approved Testimonials ({approvedTestimonials.length})
              </h2>
              {approvedTestimonials.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No approved testimonials yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {approvedTestimonials.map((t) => (
                    <div key={t.id} className="bg-green-900/10 border border-green-500/30 p-4 sm:p-5 rounded-xl hover:border-green-500/50 transition">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="font-bold">{t.name}</h3>
                          <p className="text-sm text-gray-400">{t.email}</p>
                        </div>
                        <div className="flex">{[...Array(t.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}</div>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed">"{t.text}"</p>
                      <button 
                        onClick={() => deleteTestimonial(t.id)} 
                        className="w-full bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition font-semibold transform hover:scale-105"
                      >
                        <X className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;