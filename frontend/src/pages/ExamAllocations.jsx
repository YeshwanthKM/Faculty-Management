import React, { useState, useEffect } from 'react';
import { allocationApi, examApi, facultyApi } from '../services/api';
import { 
  Wand2, 
  Download, 
  Plus,
  Trash2,
  CheckCircle,
  CalendarRange,
  Users,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const bHalls = Array.from({length: 4}, (_, i) => Array.from({length: 5}, (_, j) => `B-${i}0${j+1}`)).flat();
const cHalls = Array.from({length: 8}, (_, i) => Array.from({length: 5}, (_, j) => `C-${i}0${j+1}`)).flat();
const predefinedHalls = [...bHalls, ...cHalls];

const ExamAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [scheduleName, setScheduleName] = useState('');
  const [requiredHallCount, setRequiredHallCount] = useState('');
  const [selectedHalls, setSelectedHalls] = useState([]);
  const [examsList, setExamsList] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [allocRes, facRes] = await Promise.all([
        allocationApi.getAll(),
        facultyApi.getAll()
      ]);
      setAllocations(allocRes.data || []);
      setAllFaculty(facRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await allocationApi.getAll();
      setAllocations(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleHall = (hall) => {
    if (selectedHalls.includes(hall)) {
      setSelectedHalls(selectedHalls.filter(h => h !== hall));
    } else {
      if (requiredHallCount && selectedHalls.length >= parseInt(requiredHallCount)) {
        alert(`You can only select up to ${requiredHallCount} halls.`);
        return;
      }
      setSelectedHalls([...selectedHalls, hall]);
    }
  };

  const addExamField = () => {
    setExamsList([...examsList, {
      id: Date.now(),
      exam_date: '',
      session: ''
    }]);
  };

  const removeExamField = (id) => {
    setExamsList(examsList.filter(e => e.id !== id));
  };

  const updateExamField = (id, field, value) => {
    setExamsList(examsList.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!scheduleName) return alert('Enter a Schedule Name.');
    if (!requiredHallCount || parseInt(requiredHallCount) <= 0) return alert('Enter Required Hall Count.');
    if (selectedHalls.length !== parseInt(requiredHallCount)) return alert(`Please select exactly ${requiredHallCount} halls.`);
    if (examsList.length === 0) return alert('Add at least one exam to the schedule.');

    // Validate exams
    for (let exam of examsList) {
      if (!exam.exam_date || !exam.session) {
        return alert('Please select Date and Session for every exam.');
      }
    }

    setIsGenerating(true);
    try {
      const payload = {
        schedule_name: scheduleName,
        hall_numbers: selectedHalls,
        exams: examsList.map(e => ({
          exam_date: e.exam_date,
          session: e.session,
          department_conducting: 'COMMON',
          student_count: 60,
          required_invigilators: 1
        }))
      };
      await examApi.bulkCreateWithAllocations(payload);
      await fetchInitialData();
      
      setScheduleName('');
      setRequiredHallCount('');
      setSelectedHalls([]);
      setExamsList([]);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Error generating allocations. Check backend connection.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Group allocations for Time Table
  const groupedAllocations = allocations.reduce((acc, a) => {
    const date = a.exam_schedule.exam_date;
    const session = a.exam_schedule.session.toUpperCase();
    if (!acc[date]) acc[date] = { FN: [], AN: [] };
    if (!acc[date][session]) acc[date][session] = [];
    acc[date][session].push(a);
    return acc;
  }, {});

  const getSubstitutes = (date, session, allocatedFacultyIds) => {
    return allFaculty.filter(f => {
      if (allocatedFacultyIds.includes(f.id)) return false;
      // Also filter by leave dates if any
      if (f.leave_dates && f.leave_dates.includes(date)) return false;
      return true;
    });
  };

  const handleDeleteSession = async (date, session) => {
    if (window.confirm(`Are you sure you want to delete all allocations for ${date} (${session})?`)) {
      try {
        await examApi.deleteBySession(date, session);
        await fetchInitialData();
      } catch (error) {
        alert('Error deleting session.');
      }
    }
  };

  const exportToPDF = () => {
    try {
      if (allocations.length === 0) return alert('No allocations to export.');
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text(`Exam Invigilation Master Schedule`, 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      
      let currentY = 35;

      const sortedDates = Object.keys(groupedAllocations).sort();
      
      sortedDates.forEach((date, dateIdx) => {
        // New page for each date if not the first one
        if (dateIdx > 0) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40);
        
        // Use parseISO for more robust date parsing
        const dateObj = parseISO(date);
        doc.text(`Date: ${format(dateObj, 'EEEE, MMMM do, yyyy')}`, 14, currentY);
        currentY += 10;
        
        ['FN', 'AN'].forEach(session => {
          const sessionData = groupedAllocations[date] ? groupedAllocations[date][session] : [];
          if (sessionData && sessionData.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(session === 'FN' ? 99 : 244, session === 'FN' ? 102 : 63, session === 'FN' ? 241 : 94);
            doc.text(`${session === 'FN' ? 'Forenoon' : 'Afternoon'} Session`, 14, currentY);
            currentY += 5;

            autoTable(doc, {
              startY: currentY,
              head: [['No', 'Hall Number', 'Faculty Name', 'Department']],
              body: sessionData.map((a, i) => [
                i + 1,
                a.exam_schedule.hall_number, 
                a.faculty.name, 
                a.faculty.department
              ]),
              theme: 'grid',
              headStyles: { fillColor: session === 'FN' ? [99, 102, 241] : [244, 63, 94], textColor: 255, fontStyle: 'bold' },
              styles: { fontSize: 9, cellPadding: 3 },
              margin: { left: 14, right: 14 }
            });
            
            currentY = doc.lastAutoTable.finalY + 15;
            
            // Add substitutes
            const allocatedFacultyIds = sessionData.map(a => a.faculty.id);
            const subs = getSubstitutes(date, session, allocatedFacultyIds);
            if (subs.length > 0) {
              doc.setFontSize(9);
              doc.setTextColor(100);
              doc.text(`Standby/Substitute Faculty: ${subs.map(s => s.name).join(', ')}`, 14, currentY - 5);
              currentY += 5;
            }
          }
        });
      });

      doc.save(`${scheduleName.replace(/\s+/g, '_') || 'Exam'}_Allocations.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Schedule & Allocations</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Unified South Indian Faculty Allocation Dashboard</p>
        </div>
      </div>

      {/* Top Section: Builder */}
      <div className="card p-6 border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Schedule Builder</h2>
        
        <form onSubmit={handleGenerate} className="space-y-8">
          {/* Master Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Schedule Name</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. BTech Mid Terms 2024" 
                className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                value={scheduleName} 
                onChange={(e) => setScheduleName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Halls Needed</label>
              <input 
                required 
                type="number" 
                min="1"
                placeholder="Total halls per exam" 
                className="w-full bg-slate-50 dark:bg-slate-900/50 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                value={requiredHallCount} 
                onChange={(e) => setRequiredHallCount(e.target.value)} 
              />
            </div>
          </div>

          {/* Dynamic Exams List */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Exams List</h3>
              <button 
                type="button" 
                onClick={addExamField}
                className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
              >
                <Plus size={16} /> Add Exam Date
              </button>
            </div>
            
            {examsList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                No exams added. Click "Add Exam Date" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {examsList.map((exam, index) => (
                  <div key={exam.id} className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="col-span-1 text-center font-bold text-slate-400">#{index + 1}</div>
                    <div className="col-span-5">
                      <input required type="date" className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none dark:text-white" value={exam.exam_date} onChange={(e) => updateExamField(exam.id, 'exam_date', e.target.value)} />
                    </div>
                    <div className="col-span-5">
                      <select required className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none dark:text-white" value={exam.session} onChange={(e) => updateExamField(exam.id, 'session', e.target.value)}>
                        <option value="">Select Session</option>
                        <option value="FN">FN (Forenoon)</option>
                        <option value="AN">AN (Afternoon)</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => removeExamField(exam.id)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hall Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
              <span>Select {requiredHallCount || 0} Halls</span>
              <span className={`text-xs font-bold ${selectedHalls.length == requiredHallCount && requiredHallCount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {selectedHalls.length} / {requiredHallCount || 0} selected
              </span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 gap-2 max-h-[200px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700">
              {predefinedHalls.map(hall => (
                <button
                  key={hall}
                  type="button"
                  onClick={() => toggleHall(hall)}
                  className={`py-2 px-1 text-[10px] font-mono font-bold rounded-lg border transition-all ${
                    selectedHalls.includes(hall)
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }`}
                >
                  {hall}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={isGenerating}
              className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              {isGenerating ? 'Generating...' : <><Wand2 size={18} /> Generate Master Allocations</>}
            </button>
          </div>
        </form>
      </div>

      {/* Time Table View */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarRange className="text-primary" size={24} /> Allocation Time Table
          </h2>
          <div className="flex gap-3">
            <button onClick={exportToPDF} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-rose-500/20">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {Object.keys(groupedAllocations).length === 0 ? (
          <div className="card py-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed">
            <Clock size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
            <p className="font-medium text-lg">No allocations generated.</p>
            <p className="text-sm mt-1">Fill the builder above to generate your exam schedule.</p>
          </div>
        ) : (
          Object.keys(groupedAllocations).sort().map((date) => (
            <div key={date} className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarRange size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {['FN', 'AN'].map((session) => {
                  const sessionData = groupedAllocations[date][session] || [];
                  const allocatedIds = sessionData.map(a => a.faculty.id);
                  const subs = getSubstitutes(date, session, allocatedIds);

                  return (
                    <div key={session} className="card !p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div className={`p-4 flex items-center justify-between ${session === 'FN' ? 'bg-indigo-500' : 'bg-rose-500'} text-white`}>
                        <h4 className="font-black text-sm uppercase tracking-widest">{session === 'FN' ? 'Forenoon Session (10:00 AM)' : 'Afternoon Session (02:00 PM)'}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-md font-bold">{sessionData.length} Halls</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900">
                        {sessionData.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs font-medium italic">
                            No exams scheduled for this session.
                          </div>
                        ) : (
                          <>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-tighter border-b border-slate-100 dark:border-slate-800">
                                  <th className="py-2 text-left">Hall No</th>
                                  <th className="py-2 text-left">Faculty Name</th>
                                  <th className="py-2 text-left">Dept</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {sessionData.map((a) => (
                                  <tr key={a.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 font-mono font-black text-primary">{a.exam_schedule.hall_number}</td>
                                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{a.faculty.name}</td>
                                    <td className="py-3 text-xs text-slate-500">{a.faculty.department}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Substitutes Section */}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Users size={12} /> Standby / Substitute Faculty
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {subs.map(f => (
                                  <div key={f.id} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {f.name} ({f.department})
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExamAllocations;
