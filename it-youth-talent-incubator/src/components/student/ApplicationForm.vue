<script setup>
  import { ref } from 'vue'

  // Personal Information
  const lastName = ref('')
  const firstName = ref('')
  const email = ref('')
  const phone = ref('')
  const address = ref('')
  const city = ref('')
  const zipCode = ref('')
  const birthDate = ref('')
  
  // Education
  const university = ref('')
  const degree = ref('')
  const fieldOfStudy = ref('')
  const graduationYear = ref('')
  const currentSemester = ref('')
  const gpa = ref('')
  
  // Experience
  const hasWorkExperience = ref('')
  const workExperience = ref('')
  const skills = ref('')
  const languages = ref('')
  
  // Application specific
  const motivation = ref('')
  const availableFrom = ref('')
  const expectedSalary = ref('')
  const workHours = ref('')
  const resume = ref(null)
  
  const handleFileChange = (event) => {
    resume.value = event.target.files[0]
  }
  const coverLetter = ref('')
  </script>

<template>
    <h1>Application for this Job</h1>
    
    <!-- Personal Information Section -->
    <div class="section-container">
      <h2>Personal Information</h2>
      <div class="form-row">
        <div class="form-field">
          <label for="firstName" class="form-label">First Name:</label>
          <input id="firstName" v-model="firstName" type="text" class="form-input" required>
        </div>
        
        <div class="form-field">
          <label for="lastName" class="form-label">Last Name:</label>
          <input id="lastName" v-model="lastName" type="text" class="form-input" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field">
          <label for="email" class="form-label">Email:</label>
          <input id="email" v-model="email" type="email" class="form-input" required>
        </div>
        
        <div class="form-field">
          <label for="phone" class="form-label">Phone:</label>
          <input id="phone" v-model="phone" type="tel" class="form-input" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="address" class="form-label">Address:</label>
          <input id="address" v-model="address" type="text" class="form-input">
        </div>
        
        <div class="form-field">
          <label for="birthDate" class="form-label">Date of Birth:</label>
          <input id="birthDate" v-model="birthDate" type="date" class="form-input">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="city" class="form-label">City:</label>
          <input id="city" v-model="city" type="text" class="form-input">
        </div>
        
        <div class="form-field">
          <label for="zipCode" class="form-label">ZIP Code:</label>
          <input id="zipCode" v-model="zipCode" type="text" class="form-input">
        </div>
      </div>
    </div>
    
    <!-- Education Section -->
    <div class="section-container">
      <h2>Education</h2>
      <div class="form-row">
        <div class="form-field">
          <label for="university" class="form-label">University/School:</label>
          <input id="university" v-model="university" type="text" class="form-input" required>
        </div>
        
        <div class="form-field">
          <label for="degree" class="form-label">Degree/Program:</label>
          <input id="degree" v-model="degree" type="text" class="form-input" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="fieldOfStudy" class="form-label">Field of Study:</label>
          <input id="fieldOfStudy" v-model="fieldOfStudy" type="text" class="form-input">
        </div>
        
        <div class="form-field">
          <label for="graduationYear" class="form-label">Graduation Year:</label>
          <input id="graduationYear" v-model="graduationYear" type="number" class="form-input" min="2020" max="2030">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="currentSemester" class="form-label">Current Semester:</label>
          <input id="currentSemester" v-model="currentSemester" type="number" class="form-input" min="1" max="12">
        </div>
        
        <div class="form-field">
          <label for="gpa" class="form-label">GPA (if applicable):</label>
          <input id="gpa" v-model="gpa" type="number" class="form-input" min="1.0" max="4.0" step="0.1">
        </div>
      </div>
    </div>

    <!-- Experience Section -->
    <div class="section-container">
      <h2>Experience & Skills</h2>
      
      <div class="form-row">
        <div class="form-field">
          <label for="hasWorkExperience" class="form-label">Do you have work experience?</label>
          <select id="hasWorkExperience" v-model="hasWorkExperience" class="form-input">
            <option value="">Please select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        
        <div class="form-field">
          <label for="languages" class="form-label">Languages (comma separated):</label>
          <input id="languages" v-model="languages" type="text" class="form-input" placeholder="English, German, Spanish">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field full-width">
          <label for="workExperience" class="form-label">Previous Work Experience:</label>
          <textarea id="workExperience" v-model="workExperience" class="form-textarea" rows="4" 
                   placeholder="Describe your relevant work experience, internships, or projects..."></textarea>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field full-width">
          <label for="skills" class="form-label">Skills & Technologies:</label>
          <textarea id="skills" v-model="skills" class="form-textarea" rows="3" 
                   placeholder="List your technical skills, programming languages, tools, etc..."></textarea>
        </div>
      </div>
    </div>

    <!-- Application Details Section -->
    <div class="section-container">
      <h2>Application Details</h2>
      
      <div class="form-row">
        <div class="form-field">
          <label for="availableFrom" class="form-label">Available From:</label>
          <input id="availableFrom" v-model="availableFrom" type="date" class="form-input">
        </div>
        
        <div class="form-field">
          <label for="workHours" class="form-label">Preferred Work Hours:</label>
          <select id="workHours" v-model="workHours" class="form-input">
            <option value="">Please select</option>
            <option value="full-time">Full-time (40h/week)</option>
            <option value="part-time">Part-time (20h/week)</option>
            <option value="flexible">Flexible</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="expectedSalary" class="form-label">Expected Salary (optional):</label>
          <input id="expectedSalary" v-model="expectedSalary" type="text" class="form-input" placeholder="e.g. 2000€/month">
        </div>
        
        <div class="form-field">
          <label for="resume" class="form-label">Upload Resume (PDF):</label>
          <input id="resume" @change="handleFileChange" type="file" class="form-input" accept=".pdf">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field full-width">
          <label for="motivation" class="form-label">Motivation Letter:</label>
          <textarea id="motivation" v-model="motivation" class="form-textarea" rows="6" required
                   placeholder="Why are you interested in this position? What makes you a good fit?"></textarea>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field full-width">
          <label for="coverLetter" class="form-label">Additional Comments:</label>
          <textarea id="coverLetter" v-model="coverLetter" class="form-textarea" rows="3" 
                   placeholder="Any additional information you'd like to share..."></textarea>
        </div>
      </div>
    </div>

    <div class="buttons">
      <button type="submit" class="btn-primary">
        Submit Application &rarr;
      </button>
      <button type="button" class="btn-secondary">
        Withdraw Application
      </button>
    </div>
    
  </template>



  <style scoped>

  /* Section Container - für jede große Sektion */
  .section-container {
    background-color: #ffffff; /* Weißer Hintergrund */
    padding: 24px;
    margin-bottom: 32px; /* Mehr Abstand zwischen Sektionen */
    border-radius: 12px;
    border: 1px solid rgba(0, 77, 197, 0.1); /* Subtile blaue Umrandung */
    box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08); /* Leicht blauer Schatten */
  }

  /* Button Container */
  .buttons {
    display: flex;
    gap: 16px;
    justify-content: flex-end; /* Buttons rechts ausrichten */
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid rgba(0, 77, 197, 0.15); /* Blauer Trennstrich */
  }

  /* Primary Button - Submit */
  .btn-primary {
    background-color: #004dc5; /* Dein Hauptblau */
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary:hover {
    background-color: #003a9b; /* Dunkleres Blau beim Hover */
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 77, 197, 0.3);
  }

  .btn-primary:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 77, 197, 0.3);
  }

  .btn-primary:focus {
    outline: none;
    ring: 2px solid rgba(0, 77, 197, 0.4);
    box-shadow: 0 0 0 3px rgba(0, 77, 197, 0.1);
  }

  /* Secondary Button - Withdraw */
  .btn-secondary {
    background-color: white;
    color: #003a9b; /* Dunkleres Blau für Text */
    border: 2px solid rgba(0, 77, 197, 0.3); /* Blauer Rand */
    padding: 10px 24px; /* Etwas weniger padding wegen border */
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background-color: rgba(0, 77, 197, 0.05); /* Sehr helles Blau */
    border-color: rgba(0, 77, 197, 0.5);
    color: #004dc5; /* Hauptblau für Text */
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 77, 197, 0.15);
  }

  .btn-secondary:active {
    transform: translateY(0);
    background-color: rgba(0, 77, 197, 0.1);
  }

  .btn-secondary:focus {
    outline: none;
    border-color: #004dc5;
    box-shadow: 0 0 0 3px rgba(0, 77, 197, 0.1);
  }

  /* Mobile: Buttons untereinander */
  @media (max-width: 768px) {
    .buttons {
      flex-direction: column;
      align-items: stretch;
    }
    
    .btn-primary,
    .btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }

  /* Form Row - für responsive 2-Spalten Layout */
  .form-row {
    display: flex;
    gap: 24px; /* Mehr Abstand zwischen den Feldern für minimalistischen Look */
    margin-bottom: 20px; /* Mehr vertikaler Abstand */
  }

  /* Mobile: Eine Spalte */
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column; /* Stapelt Felder vertikal */
      gap: 16px; /* Auch auf Mobile mehr Abstand */
    }
    
    .section-container {
      padding: 20px; /* Weniger Padding auf Mobile */
      margin-bottom: 24px;
    }
  }

  /* Desktop: Zwei Spalten */
  @media (min-width: 769px) {
    .form-row {
      flex-direction: row; /* Nebeneinander */
    }
  }

  /* Form Field - für jedes Input + Label */
  .form-field {
    flex: 1; /* Nimmt gleichen Platz ein */
  }

  /* Label Styling */
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 600; /* Etwas fetter für bessere Lesbarkeit */
    color: #003a9b; /* Dunkleres Blau für Labels */
    margin-bottom: 6px; /* Label ÜBER dem Input */
  }

  /* Input Styling */
  .form-input {
    width: 100%; /* Volle Breite des form-field Containers */
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 16px;
    background-color: white;
  }

  /* Textarea Styling */
  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 16px;
    background-color: white;
    resize: vertical;
    font-family: inherit;
  }

  .form-textarea:focus {
    outline: none;
    border-color: #004dc5;
    box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
  }

  /* Full width field for textareas */
  .full-width {
    flex: 1 1 100%;
  }

  /* Focus State - angepasst an deine Farben */
  .form-input:focus {
    outline: none;
    border-color: #004dc5; /* Dein Hauptblau */
    box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
  }

  /* Titel Styling - mit deinen Farben */
  h1 {
    color: white; /* Weiß für besseren Kontrast auf blauem Hintergrund */
    margin-bottom: 24px;
    font-size: 28px;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Subtiler Schatten für bessere Lesbarkeit */
  }

  h2 {
    color: #003a9b; /* Dunkleres Blau für Untertitel */
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    border-bottom: 2px solid #004dc5; /* Blauer Unterstrich */
    padding-bottom: 8px;
  }

  </style>
