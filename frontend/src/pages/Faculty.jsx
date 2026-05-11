import React, { useState, useEffect } from 'react';
import { facultyApi } from '../services/api';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2,
  X,
  Filter
} from 'lucide-react';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    maxDuties: 99,
    availability: 'ANY',
    leaveDates: ''
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await facultyApi.getAll();
      setFaculty(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await facultyApi.create(formData);
      setIsModalOpen(false);
      fetchFaculty();
      // Reset form
      setFormData({
        name: '',
        department: '',
        designation: '',
        maxDuties: 99,
        availability: 'ANY',
        leaveDates: ''
      });
    } catch (error) {
      console.error('Error creating faculty:', error);
      alert('Error creating faculty. Check backend connection.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await facultyApi.delete(id);
        fetchFaculty();
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert('Error deleting faculty. Check backend connection.');
      }
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Faculty Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Manage your invigilator database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Faculty
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-xs font-bold uppercase tracking-wider transition-colors">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {f.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white transition-colors">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">{f.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">{f.designation}</td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-700 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Add New Faculty</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 transition-colors">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 transition-colors">Department</label>
                    <select 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="">Select Dept</option>
                      <option value="CCE">CCE</option>
                      <option value="ECE">ECE</option>
                      <option value="CSE">CSE</option>
                      <option value="AIML">AIML</option>
                      <option value="VLSI">VLSI</option>
                      <option value="MECH">MECH</option>
                      <option value="AIDS">AIDS</option>
                      <option value="CSBS">CSBS</option>
                      <option value="BT">BT</option>
                      <option value="H&S">H&S</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 transition-colors">Designation</label>
                    <select 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    >
                      <option value="">Select Designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
