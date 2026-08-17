import React, { useState, useEffect } from 'react';
import { documentService } from '../../utils/documentService';
import './DocumentManagement.css';

const DocumentManagement = ({ user, viewType }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  
  // Internal tab state for Employee
  const [employeeTab, setEmployeeTab] = useState('Personal'); // 'Personal' or 'Company'
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    visibility: (viewType === 'Employee' && employeeTab === 'Personal') ? 'Private' : 'Company'
  });
  
  const [certificateMetadata, setCertificateMetadata] = useState({
    certificateName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    certificateUrl: '',
    credentialId: ''
  });

  const [file, setFile] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data.data.documents || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isCertificate = ['Education Certificate', 'Experience Certificate', 'Training Certificate'].includes(formData.category);

    if (!isCertificate && !file) {
      alert("Please select a file to upload");
      return;
    }
    
    if (isCertificate && !file && !certificateMetadata.certificateUrl) {
      alert("Please provide a Certificate URL or select a file");
      return;
    }
    
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('description', formData.description);
    formPayload.append('category', formData.category);
    formPayload.append('visibility', formData.visibility);
    
    if (file) {
      formPayload.append('file', file);
    }
    
    if (isCertificate) {
      formPayload.append('certificateMetadata', JSON.stringify(certificateMetadata));
    }
    
    try {
      await documentService.uploadDocument(formPayload);
      setShowModal(false);
      setFormData({
         name: '',
         description: '',
         category: '',
         visibility: viewType === 'Employee' ? 'Private' : 'Company'
      });
      setCertificateMetadata({
        certificateName: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        certificateUrl: '',
        credentialId: ''
      });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Upload failed');
    }
  };

  const handleDownload = async (doc) => {
    try {
      await documentService.downloadDocument(doc._id, doc.fileName);
    } catch (err) {
      alert(err.message || 'Download failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await documentService.deleteDocument(id);
        fetchDocuments();
      } catch (err) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? doc.category === categoryFilter : true;
    
    let matchesVisibility = true;
    if (viewType === 'Employee') {
        if (employeeTab === 'Personal') {
            matchesVisibility = doc.visibility === 'Private';
        } else {
            matchesVisibility = doc.visibility !== 'Private';
        }
    }
    
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const categories = (viewType === 'HR' || viewType === 'Manager' || (viewType === 'Employee' && employeeTab === 'Company'))
    ? ['Company Policy', 'HR Policy', 'Employee Handbook', 'Leave Policy', 'Attendance Policy', 'Salary Policy', 'Other Company Documents']
    : ['Resume', 'ID Proof', 'Education Certificate', 'Experience Certificate', 'Training Certificate', 'Other Personal Documents'];

  return (
    <div className="doc-management">
      {viewType === 'Employee' && (
        <div className="doc-tabs">
          <button className={`doc-tab ${employeeTab === 'Personal' ? 'active' : ''}`} onClick={() => setEmployeeTab('Personal')}>My Documents</button>
          <button className={`doc-tab ${employeeTab === 'Company' ? 'active' : ''}`} onClick={() => setEmployeeTab('Company')}>Company Documents</button>
        </div>
      )}

      <div className="doc-header">
        <h2>{viewType === 'HR' ? 'Company Documents' : viewType === 'Employee' ? (employeeTab === 'Personal' ? 'My Documents' : 'Company Documents') : 'Company Documents'}</h2>
        {(viewType === 'HR' || (viewType === 'Employee' && employeeTab === 'Personal')) && (
          <button className="btn-primary" onClick={() => {
              setFormData({ ...formData, visibility: viewType === 'Employee' ? 'Private' : 'Company' });
              setShowModal(true);
          }}>
            Upload Document
          </button>
        )}
      </div>

      <div className="doc-filters">
        <input 
          type="text" 
          placeholder="Search documents..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="doc-input"
        />
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="doc-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {loading ? (
        <div>Loading documents...</div>
      ) : error ? (
        <div className="doc-error">{error}</div>
      ) : (
        <div className="doc-table-container">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Visibility</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                <tr key={doc._id}>
                  <td>{doc.name}</td>
                  <td>{doc.category}</td>
                  <td>
                     <span className={`visibility-badge ${doc.visibility.toLowerCase()}`}>
                       {doc.visibility}
                     </span>
                  </td>
                  <td>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                  <td>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td>
                    {doc.certificateMetadata?.certificateUrl ? (
                      <a href={doc.certificateMetadata.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn-text">View Certificate</a>
                    ) : (
                      <button className="btn-text" onClick={() => handleDownload(doc)}>Download</button>
                    )}
                    {((user.role === 'HRAdmin' || user.role === 'SuperAdmin') || 
                      (doc.ownerId && doc.ownerId._id === user._id) || 
                      (doc.ownerId === user._id)) && (
                      <button className="btn-text-danger" onClick={() => handleDelete(doc._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center">No documents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="doc-modal-overlay">
          <div className="doc-modal">
            <h3>Upload Document</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Document Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="doc-input" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="doc-input"></textarea>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="doc-select">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              {viewType === 'HR' && (
                <div className="form-group">
                  <label>Visibility</label>
                  <select required value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value})} className="doc-select">
                    <option value="Company">Company (All Employees)</option>
                    <option value="Team">Team / Specific</option>
                  </select>
                </div>
              )}

              {['Education Certificate', 'Experience Certificate', 'Training Certificate'].includes(formData.category) && (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Certificate Details</h4>
                  <div className="form-group">
                    <label>Certificate Name *</label>
                    <input required type="text" value={certificateMetadata.certificateName} onChange={e => setCertificateMetadata({...certificateMetadata, certificateName: e.target.value})} className="doc-input" />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization *</label>
                    <input required type="text" value={certificateMetadata.issuingOrganization} onChange={e => setCertificateMetadata({...certificateMetadata, issuingOrganization: e.target.value})} className="doc-input" />
                  </div>
                  <div className="form-group">
                    <label>Issue Date *</label>
                    <input required type="date" value={certificateMetadata.issueDate} onChange={e => setCertificateMetadata({...certificateMetadata, issueDate: e.target.value})} className="doc-input" />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date (Optional)</label>
                    <input type="date" value={certificateMetadata.expiryDate} onChange={e => setCertificateMetadata({...certificateMetadata, expiryDate: e.target.value})} className="doc-input" />
                  </div>
                  <div className="form-group">
                    <label>Certificate URL *</label>
                    <input required type="url" placeholder="https://" value={certificateMetadata.certificateUrl} onChange={e => setCertificateMetadata({...certificateMetadata, certificateUrl: e.target.value})} className="doc-input" />
                  </div>
                  <div className="form-group">
                    <label>Credential ID (Optional)</label>
                    <input type="text" value={certificateMetadata.credentialId} onChange={e => setCertificateMetadata({...certificateMetadata, credentialId: e.target.value})} className="doc-input" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>File (PDF, DOCX, XLSX, JPG, PNG) {['Education Certificate', 'Experience Certificate', 'Training Certificate'].includes(formData.category) ? '(Optional for Certificates)' : ''}</label>
                <input required={!['Education Certificate', 'Experience Certificate', 'Training Certificate'].includes(formData.category)} type="file" onChange={handleFileChange} className="doc-file-input" />
              </div>
              
              <div className="doc-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
