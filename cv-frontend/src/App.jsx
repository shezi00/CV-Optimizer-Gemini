import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Target, AlertTriangle, CheckCircle, Edit3, Save, Download, Eye } from 'lucide-react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // New States for Editing
  const [editableBullets, setEditableBullets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleAnalyze = async () => {
    if (!file || !jobDesc) return alert("Upload CV and paste Job Description first!");
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDesc);

    try {
      const res = await axios.post('http://127.0.0.1:8000/analyze', formData);
      setResult(res.data);
      // Initialize editable bullets with AI response
      setEditableBullets(res.data.improved_bullets || []);
    } catch (err) {
      alert("Error: Check if FastAPI is running on port 8000");
    } finally {
      setLoading(false);
    }
  };

  const handleBulletChange = (index, newValue) => {
    const updated = [...editableBullets];
    updated[index] = newValue;
    setEditableBullets(updated);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/download-cv', 
        { improved_bullets: editableBullets }, // Sends your EDITED bullets
        { responseType: 'blob' } 
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Updated_CV.docx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Download failed!");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI CV Optimizer</h1>
        <p>Built with Gemini 3.0 - Personal AI Coach</p>
      </header>

      <div className="main-grid">
        <div className="card">
          <div className="input-group">
            <label><FileText size={18} /> Upload Resume (PDF)</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="input-group">
            <label><Target size={18} /> Job Description</label>
            <textarea rows="10" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>
          <button className="btn-analyze" onClick={handleAnalyze} disabled={loading}>
            {loading ? "AI is Thinking..." : "Analyze CV"}
          </button>
        </div>

        <div className="card">
          {!result ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '100px' }}>
              <Upload size={40} />
              <p>Upload data to see your score</p>
            </div>
          ) : (
            <div>
             <h3 className="score-title">ATS Score</h3>
<div 
  className="score-circle" 
  style={{
    background: `conic-gradient(#22c55e ${result.ats_score}%, #1e293b ${result.ats_score}%)`
  }}
>
  {result.ats_score}%
</div>
              
              <h3 style={{color: 'var(--danger)'}}><AlertTriangle size={18}/> Keyword Gaps</h3>
              <div style={{marginBottom: '20px'}}>
                {result.keyword_gaps.map((gap, i) => (
                  <span key={i} className="gap-tag">{gap}</span>
                ))}
              </div>

              <div className='texbtn' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{color: 'var(--success)'}}><CheckCircle size={18}/> Updated CV Content</h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  style={{ background: 'none', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {isEditing ? <><Save size={14}/> Save Changes</> : <><Edit3 size={14}/> Edit Text</>}
                </button>
              </div>

              <div style={{ marginTop: '15px' }}>
                {editableBullets.map((bullet, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    {isEditing ? (
                      <textarea 
                        className="edit-area"
                        value={bullet}
                        onChange={(e) => handleBulletChange(i, e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--primary)' }}
                      />
                    ) : (
                      <div className="bullet-item">"{bullet}"</div>
                    )}
                  </div>
                ))}
              </div>

              {!isEditing && (
                <button className="btn-analyze" style={{ marginTop: '20px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={handleDownload}>
                  <Download size={18} /> Download (.docx)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;