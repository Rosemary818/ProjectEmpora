const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDBmZTRmNTMxMTIzNjE2OGExMDljYSIsInJvbGUiOiJIUkFkbWluIiwiaWF0IjoxNzg1NTY1OTYxLCJleHAiOjE3ODU1Njk1NjF9.6KRNbtB9O4f16QENNSJEDanwH4dUaIz0ZuWrJr_Uazg";
fetch('http://localhost:5000/api/admin/hr-dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json().then(data => console.log('Status:', res.status, 'Data:', data)))
  .catch(err => console.error(err));
