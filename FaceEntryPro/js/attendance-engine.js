/* =========================================================
   FaceEntryPro — Attendance Engine
   A tiny localStorage-backed data layer that simulates the
   backend a real deployment would have (Flask/OpenCV/SQLite).
   Every function is written so it can be swapped for a real
   fetch() call later without changing the calling code.
   ========================================================= */

const FEP = (function(){

  const KEYS = {
    students: 'fep_students',
    log:      'fep_attendance_log',
    events:   'fep_events'
  };

  function read(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function write(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* storage unavailable */ }
  }
  function uid(){ return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function fmtDate(d){ return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
  function fmtTime(d){ return d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }); }

  function seed(){
    if(!localStorage.getItem(KEYS.students)){
      write(KEYS.students, [
        {
          id: '242-35-601', name: 'Sheikh Redwan Ahad', department: 'CSE', semester: '7th',
          course: 'Operating System', email: 'redwan242-35-601@diu.edu.bd',
          photos: ['img/students/redwan-1.jpg','img/students/redwan-2.jpg'],
          enrolledAt: '2026-01-14T10:22:00'
        },
        { id:'242-35-403', name:'Addri Podder', department:'CSE', semester:'7th', course:'Operating System', email:'addri242-35-403@diu.edu.bd', photos:['img/students/addri.jpg'], enrolledAt:'2026-01-15T09:10:00' },
        { id:'241-35-541', name:'Umma Habiba', department:'CSE', semester:'7th', course:'Operating System', email:'umma241-35-541@diu.edu.bd', photos:['img/students/habiba.jpg'], enrolledAt:'2026-01-15T09:12:00' }
      ]);
    }
    if(!localStorage.getItem(KEYS.log)){
      const now = new Date();
      write(KEYS.log, [{
        id: uid(), studentId:'242-35-601', name:'Sheikh Redwan Ahad', department:'CSE',
        course:'Operating System', date: fmtDate(now), time: fmtTime(new Date(now-3600*1000)),
        status:'Present', confidence: 96.4, method:'Face+Liveness', ts: Date.now()-3600*1000
      }]);
    }
    if(!localStorage.getItem(KEYS.events)) write(KEYS.events, []);
  }
  seed();

  // --- students ---
  function getStudents(){ return read(KEYS.students, []); }
  function saveStudent(student){
    const list = getStudents();
    student.id = student.id || uid();
    list.unshift(student);
    write(KEYS.students, list);
    return student;
  }
  function findStudent(id){ return getStudents().find(s => s.id === id) || null; }
  function randomStudent(){
    const list = getStudents();
    return list.length ? list[Math.floor(Math.random()*list.length)] : null;
  }
  function deleteStudent(id){
    write(KEYS.students, getStudents().filter(s => s.id !== id));
  }

  // --- attendance log ---
  function getLog(){ return read(KEYS.log, []); }
  function addAttendance(entry){
    const list = getLog();
    entry.id = entry.id || uid();
    entry.ts = entry.ts || Date.now();
    list.unshift(entry);
    write(KEYS.log, list);
    return entry;
  }
  function todayCount(){
    const today = fmtDate(new Date());
    return getLog().filter(e => e.date === today && e.status === 'Present').length;
  }
  function latestAttendance(){ const l = getLog(); return l.length ? l[0] : null; }

  // --- security / anomaly events ---
  function getEvents(){ return read(KEYS.events, []); }
  function addEvent(evt){
    const list = getEvents();
    evt.id = evt.id || uid();
    evt.ts = evt.ts || Date.now();
    list.unshift(evt);
    write(KEYS.events, list);
    return evt;
  }
  function latestEvent(){ const l = getEvents(); return l.length ? l[0] : null; }

  // --- per-page "have I already shown this?" tracking ---
  // Each consuming page passes its own name so multiple pages can
  // independently notice the same new item without racing each other.
  function isNew(pageKey, item){
    if(!item) return false;
    const seenKey = 'fep_seen_' + pageKey;
    const lastSeenId = localStorage.getItem(seenKey);
    return item.id !== lastSeenId;
  }
  function markSeen(pageKey, item){
    if(!item) return;
    localStorage.setItem('fep_seen_' + pageKey, item.id);
  }

  return {
    getStudents, saveStudent, findStudent, randomStudent, deleteStudent,
    getLog, addAttendance, todayCount, latestAttendance,
    getEvents, addEvent, latestEvent,
    isNew, markSeen,
    fmtDate, fmtTime
  };
})();
