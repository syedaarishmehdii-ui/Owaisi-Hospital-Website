(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Footer year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar + cursor glow ---------- */
  var progress = document.createElement('div');
  progress.className = 'progress';
  document.body.appendChild(progress);

  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  }

  /* ---------- Header, progress, back-to-top ---------- */
  var header = $('header');
  var toTop = $('.to-top');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 30);
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', y > 500);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var nav = $('#navlinks');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) toggle.click();
    });
  }

  /* ---------- Scroll reveal animations ---------- */
  var revealEls = $$('.slide-l,.slide-r,.slide-up,.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Number counters ---------- */
  var counters = $$('[data-count]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var plain = el.getAttribute('data-plain') === '1';
    var dur = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = (plain ? String(val) : val.toLocaleString('en-IN')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          runCounter(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- Card spotlight glow ---------- */
  document.addEventListener('mousemove', function (e) {
    var card = e.target.closest && e.target.closest('.card');
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
  });

  /* ---------- Hero slider ---------- */
  var slides = $$('.hs');
  var dots = $$('.hero-dots button');

  if (slides.length > 1) {
    var hi = 0;
    var htimer;

    var showSlide = function (i) {
      hi = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('active', n === hi); });
      dots.forEach(function (d, n) { d.classList.toggle('active', n === hi); });
    };

    var startHero = function () {
      clearInterval(htimer);
      htimer = setInterval(function () { showSlide(hi + 1); }, 6000);
    };

    dots.forEach(function (d, n) {
      d.addEventListener('click', function () {
        showSlide(n);
        startHero();
      });
    });

    startHero();
  }

  /* ---------- Enquiry form (opens email app) ---------- */
  var form = $('#enquiry-form');
  var note = $('#form-note');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();

      if (!name || !phone || !msg) {
        note.textContent = 'Please fill in your name, phone number and message.';
        return;
      }
      if ((phone.match(/\d/g) || []).length < 7) {
        note.textContent = 'Please enter a valid phone number.';
        return;
      }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = 'Please enter a valid email address or leave it blank.';
        return;
      }

      var body = 'Name: ' + name + '\nPhone: ' + phone +
        (email ? '\nEmail: ' + email : '') + '\n\nMessage:\n' + msg;

      var url = 'mailto:info@owaisihospital.com?subject=' +
        encodeURIComponent('Website enquiry from ' + name) +
        '&body=' + encodeURIComponent(body);

      note.textContent = 'Opening your email app… If nothing opens, please email info@owaisihospital.com directly.';
      window.location.href = url;
    });
  }

  /* ---------- Virtual tour ---------- */
  var vt = $('#vt');

  if (vt) {

    /* ===== ADD / EDIT YOUR TOUR PHOTOS HERE =====
       One line per photo. Upload images to assets/tour/
       "fallback" is optional (shown only if your photo is missing). */
    var scenes = [
      { title: 'Campus Exterior', text: 'Approach the hospital and see the main building.',  local: 'assets/tour/campus.jpg',    fallback: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=2400&q=80' },
      { title: 'Main Entrance',   text: 'The welcoming entrance for patients and visitors.', local: 'assets/tour/entrance.jpg',  fallback: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=2400&q=80' },
      { title: 'Emergency Wing',  text: 'Open around the clock for urgent care.',            local: 'assets/tour/emergency.jpg', fallback: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=2400&q=80' },
      { title: 'Reception',       text: 'Registration and guidance from our front desk.',    local: 'assets/tour/reception.jpg', fallback: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2400&q=80' },
      { title: 'Patient Ward',    text: 'Calm, clean rooms where patients recover.',         local: 'assets/tour/ward.jpg',      fallback: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=2400&q=80' }
    ];

    var stage = $('#vtStage');
    var pan = $('#vtPan');
    var img = $('#vtImg');
    var cap = $('.vt-cap', vt);
    var vTitle = $('#vtTitle');
    var vText = $('#vtText');
    var vCount = $('#vtCount');
    var bar = $('#vtBar');
    var playBtn = $('#vtPlay');
    var fsBtn = $('#vtFs');

    /* build thumbnails automatically from the scenes list */
    var thumbWrap = $('#vtThumbs');
    thumbWrap.innerHTML = '';
    scenes.forEach(function (s, n) {
      var b = document.createElement('button');
      b.className = 'thumb';
      b.innerHTML = '<span class="thumb-img"></span><b>' +
        String(n + 1).padStart(2, '0') + '</b><em></em>';
      $('em', b).textContent = s.title;
      thumbWrap.appendChild(b);
    });
    var thumbs = $$('.thumb', vt);

    var cur = 0, x = 0, minX = 0;
    var playing = false, dragging = false, needCenter = true;
    var startX = 0, startOff = 0, t0 = 0, dir = -1, token = 0;
    var DUR = 7000;

    var apply = function () {
      pan.style.transform = 'translate3d(' + x + 'px,0,0)';
    };

    var bounds = function () {
      var sw = stage.clientWidth;
      if (!sw) return;
      img.style.minWidth = sw + 'px';   /* photo always fills the frame */
      var iw = img.clientWidth;
      if (!iw) return;

      minX = Math.min(0, sw - iw);
      if (needCenter) {
        x = minX / 2;
        needCenter = false;
      }
      x = Math.max(minX, Math.min(0, x));
      apply();
    };

    var go = function (i) {
      if (!scenes.length) return;

      cur = (i + scenes.length) % scenes.length;
      var s = scenes[cur];
      var my = ++token;

      img.classList.remove('in');
      img.alt = s.title;

      img.onerror = function () {
        img.onerror = null;
        if (s.fallback) img.src = s.fallback;
      };

      img.onload = function () {
        if (my !== token) return;
        needCenter = true;
        bounds();
        requestAnimationFrame(function () { img.classList.add('in'); });
      };

      img.src = s.local;

      vTitle.textContent = s.title;
      vText.textContent = s.text;
      vCount.textContent =
        String(cur + 1).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');

      cap.classList.remove('swap');
      void cap.offsetWidth;
      cap.classList.add('swap');

      thumbs.forEach(function (t, n) { t.classList.toggle('active', n === cur); });

      t0 = performance.now();
      bar.style.width = '0%';
    };

    /* thumbnail images + clicks */
    thumbs.forEach(function (t, n) {
      var ti = $('.thumb-img', t);
      var s = scenes[n];
      if (s && ti) {
        var bg = 'url("' + s.local + '")';
        if (s.fallback) bg += ',url("' + s.fallback.replace('w=2400', 'w=500') + '")';
        ti.style.backgroundImage = bg;
      }
      t.addEventListener('click', function () { go(n); });
    });

    $('#vtPrev').addEventListener('click', function () { go(cur - 1); });
    $('#vtNext').addEventListener('click', function () { go(cur + 1); });

    /* drag to look around */
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      dragging = true;
      startX = e.clientX;
      startOff = x;
      stage.classList.add('drag');
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      x = Math.max(minX, Math.min(0, startOff + (e.clientX - startX)));
      apply();
    });

    var endDrag = function () {
      dragging = false;
      stage.classList.remove('drag');
    };

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* keyboard */
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        x = Math.min(0, x + 80);
        apply();
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        x = Math.max(minX, x - 80);
        apply();
        e.preventDefault();
      }
    });

    /* auto tour */
    playBtn.addEventListener('click', function () {
      playing = !playing;
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      $('span', playBtn).textContent = playing ? 'Pause' : 'Auto tour';
      t0 = performance.now();
      if (!playing) bar.style.width = '0%';
    });

    /* full screen */
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (stage.requestFullscreen) {
        stage.requestFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', function () {
      needCenter = true;
      $('span', fsBtn).textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
      setTimeout(bounds, 80);
    });

    /* animation loop */
    var loop = function (now) {
      if (!vt.offsetParent) {
        t0 = now;
      } else if (playing && !dragging) {
        var p = (now - t0) / DUR;
        bar.style.width = Math.min(100, p * 100) + '%';

        if (p >= 1) {
          go(cur + 1);
        } else if (minX < 0) {
          x += dir * 0.3;
          if (x <= minX) { x = minX; dir = 1; }
          if (x >= 0) { x = 0; dir = -1; }
          apply();
        }
      }
      requestAnimationFrame(loop);
    };

    window.addEventListener('resize', bounds);
    go(0);
    requestAnimationFrame(loop);
  }

  /* =====================================================
     SPECIALTIES DATA
     To add a doctor: add the name to "doctors".
     To add a service: add a line to "services".
     Keep a comma between items.
     ===================================================== */
  var DEPTS = {
    emergency: {
      icon: "🚑", name: "Accident & Emergency",
      intro: "The first point of contact for medical and surgical emergencies, a 24/7 service.",
      about: [
        "The emergency department is the first point of contact in cases of any medical and surgical emergencies, and has been a 24/7 service for over 26 years. It is a well equipped division with highly competent emergency physicians and nurses who deal with all kinds of emergency cases including poisoning, polytraumas, paediatric and obstetric conditions with state of the art facilities.",
        "The emergency doctors along with the surgical team are available round the clock to attend to any surgical procedure, along with urgent blood or radiological investigations done on bedside, saving time and life. It is an advantage having 24 hours CT scan and MRI facilities. Care starts from the place of the accident or an emergency with highly trained, experienced and compassionate para medical staff, emergency technicians and ambulance. Depending on the condition, intensive care is provided with incessant availability of expert staff.",
        "The department is equipped with a 30 bedded setup in accordance with recent guidelines, with dedicated triage areas, operation theatres, labour room and emergency ICU. It is equipped with all important point-of-contact tests like arterial blood gas, complete blood count, cardiac troponin, X-ray and ultrasound, so that most work-up is done within minutes in the department itself, enabling us to start critical and life saving treatment immediately."
      ],
      services: ["Medical & Surgical emergencies", "Cardiac emergencies", "Polytrauma", "Burns", "Dressing room", "Dialysis", "Bedside Lab & Radiological investigations", "24X7 availability of General Physician & Surgeon", "Round the clock Cardiologist", "Labour rooms"],
      doctors: ["Dr. Susheel Kumar", "Dr. Mohd. Saleem", "Dr. Sushma", "Dr. Karreh Ashwini"]
    },
    cardiology: {
      icon: "❤️", name: "Cardiology",
      intro: "Advanced diagnostic and interventional care for heart conditions.",
      about: [
        "The department of Cardiology has been functioning for more than 12 years. It has the latest equipment for diagnostic and interventional services like 2D Echo, 4D Echo, TEE, TMT, Holter, Catheterisation lab and electrophysiological studies. Three full time experienced cardiologists (DM) provide round the clock emergency and routine cardiac services including intensive care, cardiac imaging, percutaneous coronary interventions, peripheral interventions, balloon valvuloplasty (mitral and pulmonary) and pacemaker implantation. The hospital is a part of Deccan College of Medical Sciences and has been offering DM cardiology courses for more than 6 years.",
        "The department has been providing trusted care with state of the art equipment and competent, experienced cardiologists. Open heart surgery, coronary angiogram, coronary angioplasty, 4 vessel intervention, bypass surgery, valve replacement surgery, minimally invasive cardiac surgeries, coronary angiography, heart valve surgery and surgeries for paediatric and adult cardiac conditions are performed. The institute is well known for both research work and regular academics.",
        "The surgeries are undertaken with the latest technology, on par with eminent institutes, at affordable prices."
      ],
      services: ["All cardiac emergencies", "Cardiologist available round the clock", "Cath lab", "Emergency PTCA", "Bypass facilities", "State of the art operation room for Bypass and other cardiac procedures", "Cardiac ICUs", "Advanced investigative procedures"],
      doctors: ["Dr. Rajashekar Reddy G", "Dr. Parvaiz Kadloor", "Dr. Mohammed Hidayathulla"]
    },
    neurology: {
      icon: "🧠", name: "Neurology",
      intro: "Round-the-clock care for disorders of the brain, spine and nerves.",
      about: [
        "The department of neurology has highly competent neurologists available round the clock who contribute their services to the patients with global standard equipment and technology. The department provides clinical care and research activities in various sub-specialties like stroke, epilepsy and epilepsy surgery, movement disorders, Alzheimer's disease, ataxia, headache, multiple sclerosis, neurobehavioral and neuromuscular disorders, stroke and pain management. The department has a state of the art neurocritical care unit catering to the management of acute neurological care and emergencies.",
        "The department has state of art facilities and advanced equipment. Services are provided round the clock, which includes neurological emergencies, critical care and interventional procedures. We have a team of highly competent, qualified and experienced neurologists, neurocritical care staff and rehabilitative services."
      ],
      services: ["Round the clock services", "State of art neurocritical care unit", "Epilepsy surgery, Alzheimer's disease, ataxia, headache, multiple sclerosis, neurobehavioral and neuromuscular disorders, stroke", "Pain management", "Rehabilitative services"],
      doctors: ["Dr. Mohammed Zoheb"]
    },
    nephrology: {
      icon: "💧", name: "Nephrology",
      intro: "24/7 dialysis and complete care for kidney-related ailments.",
      about: [
        "Any patient with kidney related ailments is followed up in the Nephrology Department. State of the art equipment with a wide range of services makes the Nephrology Department one of the best among the twin cities. A team of highly qualified and committed experts specialising in management of renal failure, hypertension, electrolyte disturbance and kidney damage works alongside a highly experienced and dedicated technical staff. The department has a 24/7 dialysis service, ensuring a multi disciplinary approach towards the patient in the process of treatment."
      ],
      services: ["24X7 dialysis facility", "State of the art equipment", "Emergency dialysis in ER", "Day care", "Renal failure management", "All kidney related ailments"],
      doctors: ["Dr. Nazma", "Dr. Syed Mohd Azhar Hassan"]
    },
    gastro: {
      icon: "🩺", name: "Gastroenterology",
      intro: "Gastroenterology and hepatology with advanced endoscopic procedures.",
      about: [
        "The Department of Gastroenterology & Hepatology at Deccan College of Medical Sciences, Owaisi Hospital & Research Centre is a flourishing department that caters to patients with therapeutic endoscopy, colonoscopy, enteroscopy, ERCP, endoscopic ultrasound and advanced liver therapy. Areas of clinical expertise include diagnostic and therapeutic upper GI and lower GI procedures.",
        "Services include endoscopic sclerotherapy, variceal banding, fundal variceal glue injection, achalasia pneumatic dilatation, oesophageal stricture dilatation, endoscopic cystogastrostomy, foreign body removal, diagnostic and therapeutic ERCP procedures (CBD and pancreatic stenting, stone extraction), EUS guided pancreatic pseudo cyst drainage, EUS guided lymph node biopsies and biopsies from pancreatic SOL, EUS guided coeliac plexus block, double balloon enteroscopy to evaluate the small bowel in patients with obscure GI bleed and small bowel evaluation in Crohn's disease, percutaneous endoscopic liver biopsies, and motility studies (manometry, oesophageal, ano-rectal)."
      ],
      services: ["Diagnostic and therapeutic upper GI and lower GI procedures", "Endoscopic sclerotherapy, variceal banding, fundal variceal glue injection, achalasia pneumatic dilatation", "Oesophageal stricture dilatation, endoscopic cystogastrostomy, foreign body removal", "Diagnostic and therapeutic ERCP procedures: CBD and pancreatic stenting, stone extraction, EUS guided pancreatic pseudo cyst drainage", "Double balloon enteroscopy for obscure GI bleed and Crohn's disease", "Percutaneous endoscopic liver biopsies, motility studies, ano-rectal studies", "High-definition laparoscopy, harmonic scalpel, ligature, CUSA excel, image intensifiers", "Intraoperative ultrasound for high-precision procedures like endoscopy, colonoscopy and endoscopic variceal sclerotherapy (EVS)"],
      doctors: ["Dr. Mohammed Aejaz Habeeb"]
    },
    pulmonology: {
      icon: "🫁", name: "Pulmonology",
      intro: "Respiratory medicine for asthma, COPD, TB, sleep disorders and more.",
      about: [
        "The Department of Respiratory Medicine (Pulmonary Medicine) at Deccan College of Medical Sciences is a flourishing department that caters to patients with a wide variety of respiratory ailments including asthma, COPD (smoker's lung), interstitial fibrosis, tuberculosis, pleural effusions (fluid in the chest), pneumothorax (air leaking from the lungs), sleep disorders (pathological snoring), respiratory failure, pneumonias and all kinds of respiratory infections. All the faculty are updated with the latest developments in the field, and have major publications to their names. The department has played a lead role in the Continuing Medical Education scene of the twin cities by conducting workshops on mechanical ventilation, advanced lung function testing and COPD, in association with the Public Health Foundation of India.",
        "The department plays a major role in the TB eradication programmes in the country by working closely with organizations such as TB-ALERT India, Joint Effort towards Elimination of Tuberculosis (JEET) and Tuberculosis Health Action Learning Initiative (THALI). It has also collaborated with the Chest Research Foundation (CRF) at Pune in two major clinical projects, EMBARC and TOPO. It has also done significant social work in active TB surveillance in old-age homes and orphanages."
      ],
      services: ["Thoracoscopy", "Bronchoscopy", "CT guided lung biopsy", "Ultrasound guided lung biopsy", "ICT", "Pleural tap", "Thoracocentesis", "Pleurodesis", "Smoking cessation clinic", "Sleep clinic", "PFT", "DLCO"],
      doctors: ["Dr. Ashfaq Hassan", "Dr. Fahad Abdullah"]
    },
    urology: {
      icon: "🩸", name: "Urology",
      intro: "Care for urinary disorders and conditions of the male genital tract.",
      about: [
        "The Urology department provides services for urinary disorders of the male and female urinary tracts, as well as conditions of the male genital tract or reproductive system. Our department is known for the vast number of surgeries done in paediatric urology (in children) like hypospadias surgeries and surgeries for reflux and undescended testes.",
        "Our results in urolithiasis (urinary stone surgeries) are commendable, with excellent clearance rates in PCNL for staghorn stones and large stones in the urinary tract. We work with patients to develop individualized treatment plans that include both medical and surgical approaches to a wide range of urological problems. We provide holistic care to patients for the best possible results and satisfaction. The department is well equipped to perform endoscopic as well as open surgeries: cystoscopies, nephrectomies, ileal conduit procedures and more. We perform both endourological, laparoscopic and open urological cancer procedures on a regular basis."
      ],
      services: ["Endourological procedures", "Laparoscopic and open urological cancer procedures", "PCNL for staghorn stones and large stones in the urinary tract", "Urinary disorders of the male and female urinary tracts", "Conditions of the male genital tract or reproductive system", "Paediatric urology (hypospadias surgeries, surgeries for reflux, undescended testes)", "Endoscopic and open surgeries", "Cystoscopies, nephrectomies, ileal conduit procedures"],
      doctors: ["Dr. M. A. Majid Adil", "Dr. B. Sourabh Chandra Reddy"]
    },
    general: {
      icon: "🩺", name: "General Medicine",
      intro: "Non-surgical treatment of diseases, from children to geriatrics.",
      about: [
        "The Department of General Medicine is one of the crucial centers of the hospital. It deals with non surgical treatment for diseases starting with prevention and diagnosis. All general issues and ailments from children to geriatrics are served in the department. We also deal with emergencies and serve critically ill patients collaboratively with many other departments.",
        "The department has expert, qualified, dedicated doctors and support staff handling cases which have more in patient flow, comparatively that too at very economic prices. There is a diversified team of doctors dedicated towards holistic care of the patients, with dedicated and hardworking support staff. The general medicine department is formed by 2 units, each with a formidable set of doctors."
      ],
      services: ["Complicated medical cases", "Medical intensive care unit", "Bedside procedures, radiology", "Multi disciplinary team", "Round the clock services", "Specialized care", "Dedicated nursing staff"],
      doctors: ["Dr. Suhail Bin Ahmed", "Dr. Anjum Sultana Khatoon", "Dr. Pramod Kumar KR"]
    },
    paediatrics: {
      icon: "👶", name: "Paediatrics",
      intro: "Overall health and well-being of children from birth to 18 years.",
      about: [
        "Paediatrics is the specialty that focuses on the overall health and well-being of children from birth through their adolescence (18 years of age). Children, right from birth till 5 years, are more vulnerable to several infections and diseases. We take utmost care of our patients right from immunization to treatment of simple to complex ailments. We have skilled and experienced experts in the department along with the technical staff. The ambience is also child friendly and spacious, with child friendly staff. As they develop immunity in this age and cope with diseases, treatment is provided with utmost care. Emergency services, NICU and PICU are available to provide critical and intensive care for the children."
      ],
      services: ["Immunization", "Treatment of simple to complex ailments", "Child friendly and spacious ambience", "Emergency services", "NICU", "PICU"],
      doctors: ["Dr. Habib Pathan", "Dr. Ahmedullah", "Dr. M. Pavan Reddy", "Dr. Syed Mohammed Nusrath Qurram", "Dr. Shreya Tanneru"]
    },
    gynecology: {
      icon: "🤰", name: "Gynecology",
      intro: "Maternity and women's health care, including high-risk pregnancies.",
      about: [
        "The Department of Obstetrics and Gynecology is one of the topmost maternity segments in Hyderabad and Telangana, providing antenatal, intranatal and postnatal care round the clock. The hospital specializes in handling high risk and critical cases round the clock. We provide care for women of all ages, addressing their concerns in areas of adolescence, pre-marital counseling, menstrual disturbances, early pregnancy, sexual health care, breast care and gynecological surgeries including common gynecological problems. With the available specialist services in neurology, nephrology, endocrinology etc., specialist care in interrelated conditions is provided."
      ],
      services: ["Antenatal, intranatal and postnatal care", "High risk and critical cases round the clock", "Care for women of all ages", "Pre-marital counseling, menstrual disturbances", "Early pregnancy, sexual health care, breast care", "Specialist care in interrelated conditions (neurology, nephrology, endocrinology etc.)"],
      doctors: ["Dr. Pabberaju Padmaja", "Dr. Zareena Sultana", "Dr. Surayya Tahseen", "Dr. Thajammul Samrin", "Dr. K. Archana", "Dr. Amtul Suroor", "Dr. Sadula Shravya"]
    },
    dermatology: {
      icon: "🧴", name: "Dermatology, Venereology & Leprosy",
      intro: "Advanced care for all types of skin, hair and nail disorders.",
      about: [
        "The Department of Dermatology, Venereology & Leprosy (DVL) is one of the important clinical specialty departments offering patient care. It is headed by Professor Dr. Nayeem Sadath Haneef. The department has highly qualified, experienced and renowned faculty members providing clinical services in the form of outpatient care, inpatient care and procedural services for all types of skin, hair and nail diseases. The DVL unit has earned a special reputation in the state as a competent intensive and critical care set up for treating patients with life threatening skin diseases, drawing referrals from senior practitioners, corporate hospitals and various other medical college hospitals.",
        "The department offers advanced biologic treatments such as Rituximab and Secukinumab for threatening diseases like Pemphigus and Psoriasis, and is equipped with cosmetic and dermato-surgical equipment. It provides all types of diagnostic and therapeutic procedures including skin biopsy, patch testing, Wood's lamp, laser hair reduction, QS-ND YAG laser pigment and tattoo removal, CO2 laser, radiofrequency, electrocautery, cryosurgery, whole body / hand-foot phototherapy (both NBUVB & PUVA), microdermabrasion, dermaroller, chemical peels, pigmentation treatment, comedone extraction, acne surgery, vitiligo surgery, nail surgery, mole removal, wart removal, keloid treatment, hair growth treatment with PRP (platelet rich plasma), intralesional therapies, iontophoresis and chemical cautery. The department also offers undergraduate education for students and postgraduate MD degree course in DVL."
      ],
      services: ["Advanced biologic treatments like Rituximab and Secukinumab for Pemphigus and Psoriasis, cosmetic and dermato-surgical equipment", "Diagnostic and therapeutic procedures, including skin biopsy, patch testing, Wood's lamp, laser hair reduction, QS-ND YAG laser pigment", "Tattoo removal, CO2 laser, radiofrequency, electrocautery, cryosurgery, whole body / hand-foot phototherapy (both NBUVB & PUVA)", "Microdermabrasion, dermaroller, chemical peels, pigmentation treatment, comedone extraction", "Acne surgery, vitiligo surgery, nail surgery, mole removal, wart removal, keloid treatment, hair growth treatment with PRP (platelet rich plasma)", "Intralesional therapies, iontophoresis, chemical cautery"],
      doctors: ["Dr. Nayeem Sadath Haneef", "Dr. Fatima Razvi", "Dr. P. Arun Raghav", "Dr. Ruhi Haqqani", "Dr. Fatima Ummul Hasnaat"]
    },
    dentistry: {
      icon: "🦷", name: "Dentistry",
      intro: "Complete dental care with modern equipment and strict infection control.",
      about: [
        "The Dental Care Department includes a devoted team of dentists, experienced assistants and efficient laboratory personnel who ensure that patients receive thorough care and the finest treatment possible. We can treat a wide range of oral, dental and jaw-related issues, from basic tooth decay to major mouth deformities that might need surgery. We also treat trauma-related disorders, congenital abnormalities and cosmetic makeovers. The department is highly equipped with advanced technology machines and has a very pleasant ambience. Cosmetic dentistry treatments are also provided. The department adheres to world class cleanliness and infection control by maintaining hygiene."
      ],
      services: ["A team of well experienced doctors with 20 years of clinical experience", "A modern clinical set up with the latest equipment and dental laboratory", "Single sitting root canal", "Treatment and crowns with modern material like Zirconia", "Surgical removal of wisdom teeth and minor surgical procedures", "Gum surgery for swollen gums (flap surgery performed)", "Full mouth teeth replacement", "Dental implants", "Dental OPG, full mouth X-ray, RVG digital X-ray available", "Orthodontic treatment for alignment of teeth", "Removal of dentures", "Facial trauma and dental trauma management"],
      doctors: ["Dr. K. Padma Rayalu", "Dr. Juwaria Jabeen", "Dr. Lakshmi Radhika"]
    },
    ent: {
      icon: "👂", name: "E.N.T",
      intro: "Super-specialty ear, nose and throat care with audiology and vertigo clinic.",
      about: [
        "Deccan College of Medical Sciences is a super-specialty hospital and teaching institute with a Department of ENT providing service to the people for more than 30 years. The department has grown exceptionally with the intention of providing the best and highest standard of care. It is a well equipped department with sub-specialties like audiology, allergy clinic and vertigo clinic. We have a well equipped operation theatre with all the new advanced surgical equipment and instruments.",
        "We also have a minor OT where all the minor surgeries are done on a daily basis, equipped with instruments and endoscopes for performing Video Laryngoscopy (VLS), Diagnostic Nasal Endoscopy (DNE) and all other minor surgeries. In the main theatre we do surgeries like microsurgeries, Micro Laryngeal Surgery (MLS), mastoid surgeries, Functional Endoscopic Sinus Surgery (FESS), surgeries of thyroid, parotid and routine surgeries like septoplasty, tonsillectomy, adenoidectomy, nasal bone fracture reduction, etc. In the audiology department we have all services like Pure Tone Audiometry (PTA), Impedance Audiometry (IA), Oto-Acoustic Emissions (OAE) and Brainstem Evoked Response Audiometry (BERA) with hearing aid facilities. We have a temporal bone dissection lab for postgraduates training."
      ],
      services: ["Audiology, Allergy Clinic, Vertigo clinic", "Video Laryngoscopy (VLS), Diagnostic Nasal Endoscopy (DNE)", "Micro Laryngeal Surgery (MLS)", "Mastoid surgeries", "Functional Endoscopic Sinus Surgery (FESS)", "Thyroid surgeries", "Dacryocystorhinostomy", "Pure Tone Audiometry (PTA), Impedance Audiometry (IA)", "Oto-Acoustic Emissions (OAE)", "Brainstem Evoked Response Audiometry (BERA) with hearing aid facilities"],
      doctors: ["Dr. Nabil Abdul Samad Mulla", "Dr. Waseem Ahmed", "Dr. Zahida Begum"]
    },
    ophthalmology: {
      icon: "👁️", name: "Ophthalmology",
      intro: "Outstanding eye care through expert ophthalmologists and advanced technology.",
      about: [
        "Eye Care at Owaisi Hospital Center provides outstanding ophthalmic care through expert, qualified ophthalmologists. The department has advanced technological equipment to serve our patients for screening, surgery, treatment etc. World class services, both examinations and procedures, are provided to patients of all ages in a smooth manner. Cataracts, glaucoma, all types of retinal diseases like diabetic retinopathy, macular degenerations, uveitis, Retinopathy of Prematurity (ROP), cornea and eye surface disorders, and neurological eye diseases are a few services offered at the department. It is also complemented with an in-house optometry center for developing eye glasses and corrections."
      ],
      services: ["Retinal diseases", "Retinopathy of Prematurity (ROP)", "Cornea and eye surface disorders", "Screening", "Complex surgeries", "Emergency services", "Highly experienced faculty"],
      doctors: ["Dr. Siddharth Karan", "Dr. Arshia Mohd"]
    },
    orthopedics: {
      icon: "🦴", name: "Orthopedics",
      intro: "Comprehensive care of bones, joints, ligaments, tendons and muscles.",
      about: [
        "Orthopedics is a discipline of surgery related to all the injuries of the musculoskeletal system. It deals with the treatment of bones, joints, ligaments, tendons, muscles, nerves, etc. using surgical as well as non-surgical practices. The department provides comprehensive care in all areas of orthopedics ranging from sports injuries, hand, foot, spine procedures, hip, knee, arthroscopy, trauma and joint replacement. Our surgeons combine surgical expertise with pioneering clinical and basic research in areas such as stimulation of bone and tissue repair and total joint reconstruction, hip, shoulder and knee management, fracture and pain management. Complicated surgeries are performed from paediatrics to geriatrics. The department has witnessed complicated joint replacement surgeries for the old aged patients that have been successful with 99% ambulation within a few months.",
        "The department is a tertiary referral center for primary revision orthopedic surgeries, focused on preventive orthopedics and regenerative orthopedics. It provides physiotherapy, occupational therapy, orthotics and prosthetics, with the aim to get the patient back to injury free level of activities. The motto of the department is 'Do it right the first time'."
      ],
      services: ["Polytrauma cases", "Spine surgeries", "Joint replacement surgeries", "Corrective procedures", "Total joint reconstruction", "Active research", "International publications", "Pain management"],
      doctors: ["Dr. Shaik Vazeeruddin", "Dr. T. Venu Gopal"]
    },
    plastic: {
      icon: "✨", name: "Plastic Surgery",
      intro: "Reconstructive, craniofacial, microvascular and cosmetic surgeries.",
      about: [
        "The department of Plastic Surgery has dynamic, dedicated, highly skilled and experienced doctors who have taught in eminent medical institutes and government hospitals. Specialized services in craniofacial, cleft lip and palate, reconstructive, microvascular, cosmetic surgeries and burns are provided. The department also has PGs who are getting trained in the speciality as part of the post graduation. Complicated surgeries as a result of congenital deformities, burns and accidents are performed and give the best results. Cosmetic and reconstructive surgeries are also performed, like maxillofacial, craniofacial, brow lift, cleft and palate repairs, post traumatic defects, fat removal and contouring.",
        "Special features: facio-maxillary injuries, rhinoplasty, post burn construction, skin malignancies, liposuction, vascular trauma / aneurysm, tendon & nerve injuries, body contouring (abdominoplasty, thigh, reduction surgery)."
      ],
      services: ["Rhinoplasty", "Post burn construction", "Skin malignancies", "Liposuction", "Vascular trauma / Aneurysm", "Tendon & nerve injuries", "Body contouring: abdominoplasty, thigh, reduction surgery"],
      doctors: ["Dr. N. Sudershan Rao", "Dr. M. Prabhakar"]
    },
    psychiatry: {
      icon: "🧘", name: "Psychiatry",
      intro: "Compassionate care for mental illness and behavioral disorders.",
      about: [
        "The Department undertakes all available modalities for mental illnesses, emotional disturbances and abnormal behaviors. A highly skilled, compassionate team treats patients for a wide range of psychiatric disorders like schizophrenia, personality disorders, sleep disorders, depression, anxiety, stress, PTSD, substance abuse, behavioral issues, mood disorders, ADHD, autism and childhood and adolescents' mental health issues. We also take care of behavioral issues in the elderly, delirium, dementia, depression and psychosis."
      ],
      services: ["Schizophrenia", "Personality disorders", "Sleep disorders", "Depression", "Anxiety", "Stress", "Behavioral issues", "Mood disorders"],
      doctors: ["Dr. Minhajzafar Nasirabadi", "Dr. Arifuddin Ahmed", "Dr. Mazhar Ali"]
    },
    physiotherapy: {
      icon: "🏃", name: "Physiotherapy",
      intro: "Specialized rehabilitation for musculoskeletal and neurological conditions.",
      about: [
        "The Physiotherapy department is a vast field associated with a teaching institute, with highly qualified staff providing highly specialized care and advanced treatment for musculoskeletal conditions, orthopaedic conditions, neurological conditions, post operative conditions, stroke, brain injuries, spinal cord injuries, amputations and cardio thoracic conditions.",
        "Services are provided to patients of all ages and gender. We have patients visiting from the outskirts and out stations along with local ones. Muscular cramps, joint pain, cartilage injury, patellar dislocation, peri-arthritis and spondylosis are a few conditions frequently treated through physiotherapy. We have trained and qualified staff along with the latest technology equipment."
      ],
      services: ["Musculoskeletal conditions", "Orthopaedic conditions", "Neurological conditions", "Post operative conditions", "Stroke", "Brain injuries", "Spinal cord injuries", "Amputations", "Cardio thoracic conditions"],
      doctors: ["Dr. Imaduddin Ahmed", "Dr. Harris Abid", "Dr. Venugopal Pawar"]
    },
    pathology: {
      icon: "🔬", name: "Pathology",
      intro: "Optimal laboratory services supporting diagnosis across the hospital.",
      about: [
        "The department of pathology is strategically situated between the pre clinical basic medical sciences and the clinical medical departments to cater to the needs of medical students as well as to offer optimal laboratory services to the patients attending the Owaisi group of hospitals. The department has eminent and dedicated faculty members contributing to the knowledge building in the medical fraternity at international medical standards.",
        "Every year the department chalks out a comprehensive undergraduate medical curriculum encompassing theory lectures, self directed learning, topic seminars, short group discussions and practical demonstration, along with attitude, ethics and communication modules. Automated cell counters for hematology, cytospin with conventional centrifuges, automated urine analyzers and cryostat for frozen sections and reporting are available in the department. Side labs are attached to all the clinical departments. The service labs of pathology respond to the different clinical requisitions of hematology, clinical pathology, cytopathology diagnosis and histopathology reporting and interpretation."
      ],
      services: ["Automated cell counters for hematology", "Cytospin with conventional centrifuges", "Automated urine analyzers and cryostat for frozen sections and reporting", "Hematology", "Clinical pathology", "Cytopathology diagnosis and histopathology reporting and interpretation"],
      doctors: ["Dr. Atiya Begum", "Dr. T.S. Shamshuddin"]
    },
    microbiology: {
      icon: "🧫", name: "Microbiology",
      intro: "State of the art clinical microbiology for accurate and timely diagnosis.",
      about: [
        "State of the art clinical microbiology with the latest technology equipment and qualified manpower to meet the clinicians' needs for accurate and timely confirmation of presumptive clinical diagnosis. The department was established in the year 1984-1985. The journey has subsequently strived to balance an efficient output with advancing technology. The collective efforts of the department's faculties are imparting the best knowledge to the students. We are the first among all the private medical colleges in Andhra Pradesh / Telangana.",
        "The department is equipped with automated machines BACTEC for blood culture and MGIT for tuberculosis. In the year 2020 a NABL accredited molecular lab was established to tackle the pandemic of COVID 19. The lab is equipped with fully automated nucleic acid extraction machines and RTPCR apart from COVID 19 tests; it can also detect hepatitis viruses, herpes virus and papilloma viruses which cause dreaded diseases such as liver cancer and genital cancers. The microbiology department lab also runs services under national programs like DOTS, HIV and molecular diagnosis of TB by CBNAAT."
      ],
      services: ["Automated machines BACTEC for blood culture", "MGIT for tuberculosis", "Fully automated nucleic acid extraction machines and RTPCR", "Detection of hepatitis viruses, herpes virus and papilloma viruses", "Molecular diagnosis of TB by CBNAAT"],
      doctors: ["Dr. Maimoona Mustafa"]
    }
  };

  /* =====================================================
     MANAGEMENT PEOPLE
     Add/edit here. "role" is optional.
     If the same name is also in a specialty, it is the SAME profile.
     ===================================================== */
  var MGMT = [
    { name: "Dr. Col. G.K.N. Prasad", role: "Chief Administrator" },
    { name: "Dr. Syeda Amtul Yafe", role: "Assistant Administrator" },
    { name: "Dr. Ashfaq Hassan" },
    { name: "Dr. M. A. Majid Adil" },
    { name: "Dr. C. Sham Sunder", role: "Medical Superintendent" },
    { name: "Dr. Mohammed Zoheb", role: "Additional Medical Superintendent" },
    { name: "Dr. Abdul Rafeek" },
    { name: "Dr. Syad Asrar Hussain" },
    { name: "Dr. Mohd. Asraruddin" },
    { name: "Dr. Maheshwar Singh. T" },
    { name: "Dr. Syad Riyaz Ahmed" },
    { name: "Dr. MD. Irfan Aziz" }
  ];

  /* =====================================================
     DOCTOR DETAILS (optional, one entry per person)
     Key = name without "Dr.", lowercase, hyphens
       e.g. "Dr. Fatima Razvi" -> 'fatima-razvi'
     Fields (all optional): role, exp, url, photo, edu[], skills[], awards[], pubs[]
     "photo" = file name (no extension) inside assets/doctors/ if it differs from the key.
     Copy details only from the hospital's own pages.
     Open yoursite/#photos to see every expected photo file name.
     ===================================================== */
  var DOCTORS = {
    'susheel-kumar': { role: 'Associate Professor & Incharge, Accident and Emergency', exp: '10 years',
      edu: ['MBBS - Taishan Medical University', 'DEM - National Board of Examinations', 'IDCCM - Indian Society of Critical Care', 'Diploma in Diabetology - Indian Medical Association'],
      skills: ['BLS - Basic Life Support', 'ACLS - Advanced Cardiac Life Support'] },
    'mohd-saleem': { role: 'Associate Professor, Accident and Emergency', exp: '24 years',
      edu: ['MBBS - Kurnool Medical College (NTR University of Health Sciences, Vijayawada)', 'DEM - Diploma in Emergency Medicine'],
      skills: ['BLS - Basic Life Support', 'ACLS - Advanced Cardiac Life Support'] },
    'sushma': { role: 'Assistant Professor, Accident and Emergency', exp: '24 years',
      edu: ['MBBS - Vydehi Institute of Medical Sciences', 'MEM - Masters in Emergency Medicine'],
      skills: ['BLS - Basic Life Support', 'ACLS - Advanced Cardiac Life Support'] },
    'karreh-ashwini': { role: 'Assistant Professor, Accident and Emergency', exp: '10 years',
      edu: ['MBBS - Kathmandu Medical University', 'DEM - Diploma in Emergency', 'UKMEM - Masters in Emergency Medicine', 'MRCEM - Membership of Royal College of Emergency Medicine, UK'],
      skills: ['BLS', 'ACLS', 'ATLS - Advanced Trauma Life Support', 'PALS - Pediatric Advanced Life Support', 'BDLS - Basic Disaster Life Support', 'ALSO - Advanced Life Support in Obstetrics'] },

    'habib-pathan': { role: 'HOD, Paediatrics', exp: '24 years',
      edu: ['MBBS - Indira Gandhi Medical Institute, Nagpur', 'MD Paediatrics - IG, GMI, Nagpur', 'FIPN - Fellowship in Paediatric Neurology'],
      skills: ['Paediatric epilepsy, autism, ADHD, headache'] },
    'ahmedullah': { role: 'Associate Professor, Consultant Paediatrician & Neonatologist', exp: '12 years',
      edu: ['MBBS, MD Paediatrics'], skills: ['Managing paediatric and neonatal sick children'] },
    'm-pavan-reddy': { role: 'Assistant Professor, Dept. of Paediatrics', exp: '6 years',
      edu: ['MBBS - Gandhi Medical College', 'DNB - Jaslok Hospital & Research Center'],
      skills: ['Managing paediatric ICU children'] },
    'syed-mohammed-nusrath-qurram': { role: 'Assistant Professor, Paediatrics', exp: '1-2 years',
      edu: ['MBBS - Kamineni Medical College', 'MD - Deccan College of Medical Sciences'],
      skills: ['Immunization, paediatric and neonatal care', 'Paediatric trauma and emergencies'],
      pubs: ['MISC in children case series (PEDICON, Hyderabad, 2021) - gold medal poster', 'A rare case of Congenital Rubella Syndrome - case report (OSMECON 2021)'] },
    'shreya-tanneru': { role: 'Assistant Professor, Paediatrics', exp: '1-2 years',
      edu: ['MBBS - Manipal University', 'MD Paediatrics - Dr. D.Y. Patil University, Pune', 'Fellowship in Neonatology - Paramitha Hospital, Hyderabad'],
      skills: ['Management of complex and critically ill neonatal cases, paediatric emergencies and outpatient cases'] },

    'nayeem-sadath-haneef': { role: 'Professor & HOD, DVL', exp: '21 years',
      url: 'https://owaisihospital.com/dr-nayeem-sadath-haneef/',
      edu: ['MBBS', 'MD (DVL)'],
      skills: ['Nationally renowned for biological drug (rituximab) therapy and DCP/DAP pulse therapy of vesiculobullous diseases', 'Critical care in DVL', 'Cosmetic therapy and dermatosurgery: chemical peels, acne scars, vitiligo surgery, nail surgery, mesotherapy, PRP', 'Lasers: hair removal (diode), pigment removal (QS-Nd YAG), excimer, acne scar (CO2/MNRF)', 'PUVA / NBUVB / excimer phototherapy'],
      awards: ['Contributed chapter on Code of Medical Ethics in a textbook on Medico-legal Aspects of Dermatology & Plastic Surgery (2019)', 'Contributed chapter on Alopecia areata in IADVL Textbook of Dermatology (5th Edition)', 'Invited speaker, moderator and chairperson at international, national and state DVL conferences', 'Member: IADVL, IAL, IMA'],
      pubs: ['Leprosy masquerading as Melkersson-Rosenthal syndrome (Ind J Lepr 2005)', 'Nail changes and disorders among the elderly (Ind J Dermatol Venereol Leprol 2005)', 'Salivary electrolytes in psoriasis, a preliminary study (Indian J Dermatol 2006)'] },
    'fatima-razvi': { role: 'Professor, DVL', exp: '29 years',
      edu: ['MBBS', 'DDVL', 'DNB'],
      skills: ['DCP/DAP pulse therapy / biological (rituximab) therapy of vesiculobullous diseases', 'Cosmetic therapy and dermatosurgery: chemical peels, acne scars, PRP therapy', 'CO2 LASER', 'PUVA / NBUVB phototherapy'],
      awards: ['Fellowship - MNAMS', 'Vaidya Ratna Award', 'Member: IADVL, IAL, IMA'],
      pubs: ['Retrospective study of duration of phase I of dexamethasone-cyclophosphamide pulse therapy in pemphigus patients (J Evolution Med Dent Sci 2017)', 'Report of three rare cases of Dowling Degos disease (J Med Allied Sci 2017)'] },
    'p-arun-raghav': { role: 'Assistant Professor, DVL', exp: '6 years',
      edu: ['MBBS', 'MD (DVL)'],
      skills: ['Cosmetic therapy and dermatosurgery: chemical peels, acne scars', 'Hair removal LASER (diode)', 'PUVA / NBUVB phototherapy'],
      awards: ['Member: IADVL, IAL'],
      pubs: ['Etiological prevalence and antifungal sensitivity patterns of dermatophytosis in India, a multicentric study (Indian J Dermatol Venereol Leprol 2021)'] },
    'ruhi-haqqani': { role: 'Assistant Professor, DVL', exp: '5 years',
      edu: ['MBBS', 'MD (DVL)', 'DNB'],
      skills: ['Dermoscopy', 'Cosmetic therapy and dermatosurgery: chemical peels, acne scars, PRP therapy', 'PUVA / NBUVB phototherapy'],
      awards: ['Maria Duran Award - International Society of Dermatology, 2021 (paper on intralesional BCG immunotherapy in extensive warts)', 'Fellowship - MRCP-SCE', 'Fellowship - MNAMS', 'Member: IADVL, ACSI, IMA, ISD'] },
    'fatima-ummul-hasnaat': { role: 'Senior Resident, DVL', exp: '10 years',
      edu: ['MBBS', 'MD (DVL)'],
      skills: ['Cosmetic therapy and dermatosurgery: chemical peels, acne scars, PRP therapy', 'CO2 LASER', 'PUVA / NBUVB phototherapy'],
      awards: ['Member: IADVL, ACSI, IMA, Deccan Alumni'],
      pubs: ['Non-randomised control trial of glycolic acid 12% cream versus azelaic acid 10% cream in melasma (J Evolution Med Dent Sci 2017)'] },

    'k-padma-rayalu': { role: 'Professor & HOD, Dentistry', exp: '24 years',
      edu: ['BDS - Bapuji Dental College and Hospital, Davangere', 'MDS - SDM Dental College and Hospital, Dharwad', 'AAID - American Academy of Implant Dentistry, USA', 'MDHM - Deccan School of Hospital Management'],
      skills: ['Oral and maxillofacial surgeon: orthognathic surgery and correction of facial deformities', 'Maxillofacial trauma management with neurosurgery and orthopaedics', 'Dental implantology / full mouth rehabilitation'],
      awards: ['Awardee of 1st prize for poster on implantology', 'Conducted training programmes for dental implantology'] },
    'juwaria-jabeen': { role: 'Tutor, Dentistry', exp: '1-2 years',
      edu: ['BDS - Al-Ameen Dental College and Hospital, Bijapur, Karnataka', 'MDHM - Deccan School of Hospital Management, Hyderabad'],
      skills: ['Effective pain management', 'Oral surgery: total, orthodontic, geriatric and paediatric extractions', 'Prosthodontics: fixed and partial dentures, full mouth rehabilitation', 'Restorative dentistry and root canal treatment; pulpectomy in paediatric patients', 'Periodontics and periodontal therapies'] },
    'lakshmi-radhika': { role: 'Assistant Professor, Dentistry', exp: '8 years',
      edu: ['BDS - Sibar Institute, Guntur (2005-2010)', 'MDS Periodontology - Panineeya Institute of Dental Association, Hyderabad (2011-2014)', 'Fellowship in Endodontics - Indian Dental Association (2014)'],
      skills: ['Flap surgery', 'Dental jewellery', 'Gingival depigmentation', 'Root canal', 'Laser periodontal therapy', 'Curettage', 'Gummy smile correction', 'Splinting'],
      awards: ['Recipient, Indian Dental Association (IDA)', 'Essay contest 2011', 'First prize winner, South Zone'],
      pubs: ['Periodontal disease and diabetes: how causal is the association? (Intl J of Clinical Cases and Investigation, 2011)'] },

    'atiya-begum': { role: 'Professor & HOD, Pathology', exp: '31 years',
      edu: ['M.D. (1980-1984) - JJM Medical College, Davangere, Mysore University', 'M.B.B.S. (1975-1980) - M.R. Medical College, Gulbarga, Dharwad University'],
      skills: ['Conducted Zonal CME at Deccan College of Medical Sciences', 'IAPM AP state chapter conference, Khammam (2015)', 'TSIAPM conferences: Osmania Medical College (2016), Mediciti (2017)'],
      pubs: ['Dowling Degos disease: a clinicopathological study (Indian J Pathology Research and Practice, 2017)', 'Abnormal uterine bleeding: role of sonography and histopathology (2018)'] },
    't-s-shamshuddin': { role: 'Assistant Professor, Pathology & Blood Bank',
      edu: ['MBBS', 'MD (Pathology)'], skills: ['Cyto techniques'],
      pubs: ['A hospital based critical study of prevalence and morphological patterns of anemia in adult and geriatric population'] },

    'rajashekar-reddy-g': { role: 'Professor & HOD, Cardiology', exp: '25 years',
      edu: ['MBBS - JIPMER, Pondicherry (1992-1997)', 'MD Internal Medicine - PGIMER, Chandigarh (1998-2001)', 'DM Cardiology - NIMS, Hyderabad (2002-2005)'],
      skills: ['Interventional cardiology (ESC Heart Failure Association)', 'Percutaneous coronary interventions, including complex PCI and primary PCI', 'Pacemakers', 'Balloon valvuloplasty'],
      awards: ['JIPMER nationwide MBBS entrance 1992 - 6th rank', 'PGIMER nationwide MD/MS entrance 1998 - 4th rank', 'AIIMS Delhi nationwide MD/MS entrance 1998 - 7th rank', 'NIMS Hyderabad DM entrance (Cardiology) 2001 - 1st rank'] },
    'parvaiz-kadloor': { role: 'Associate Professor, Cardiology', exp: '17 years',
      edu: ['MBBS - M.R. Medical College, Gulbarga, Karnataka', 'MD Internal Medicine - M.R. Medical College, Gulbarga', 'DM Cardiology - Deccan College of Medical Sciences, Hyderabad'],
      skills: ['Interventional cardiology (ESC Heart Failure Association)'],
      pubs: ['Study of acute coronary syndrome in a specific ethnic Muslim population in the old city of Hyderabad', 'Reduced left ventricular ejection fraction in patients with ACS as a risk factor for mortality (IJRMS 2020)'] },
    'mohammed-hidayathulla': { role: 'Associate Professor, Cardiology', exp: '20 years',
      edu: ['MBBS - Vijayanagar Institute of Medical Sciences, Bellary', 'MD Paediatrics - Karnataka Institute of Medical Sciences, Hubli', 'DM Cardiology - Sri Jayadeva Institute of Cardiovascular Sciences and Research, Bangalore'],
      skills: ['Interventional cardiology (ESC Heart Failure Association)'],
      pubs: ['Efficacy and safety of paclitaxel drug eluting balloons in femoropopliteal artery disease (Int J Res Med Sci 2021)', 'Reduced LVEF in acute coronary syndrome as a risk factor for mortality (IJRMS 2020)'] },

    'nabil-abdul-samad-mulla': { role: 'Assistant Professor, ENT', exp: '8 years',
      edu: ['MBBS - Kamineni Institute of Medical Sciences', 'MS - Deccan College of Medical Sciences, Hyderabad'],
      skills: ['Endoscopic nose surgeries', 'Endoscopic and microscopic ear surgeries', 'Micro laryngeal surgeries', 'Skull base, head and neck surgeries'] },
    'waseem-ahmed': { role: 'Assistant Professor, ENT', exp: '2 years',
      edu: ['MBBS - KBN Institute of Medical Sciences', 'DLO - Shadan Institute of Medical Sciences, Hyderabad'],
      skills: ['Septoplasty', 'Functional endoscopic sinus surgeries', 'Tympanoplasty', 'Mastoidectomy', 'Micro laryngeal surgeries'] },
    'zahida-begum': { role: 'Assistant Professor, ENT', exp: '2 years',
      edu: ['MBBS - Mediciti Institute of Medical Sciences', 'DLO - Deccan College of Medical Sciences, Hyderabad'],
      skills: ['Tonsillectomy', 'Septoplasty', 'Turbinoplasty'] },

    'minhajzafar-nasirabadi': { role: 'Professor', exp: '22 years',
      edu: ['MBBS - Grant Medical College, Mumbai', 'DPM - Mumbai', 'MD - Mumbai University'],
      skills: ['De-addiction psychiatry', 'Consultation liaison psychiatry', 'General psychiatry'],
      awards: ['Vice President and President-elect, Indian Psychiatric Society Telangana state branch', 'Recipient, National President Award, IMA 2017-18', 'IMA Telangana state president award 2020-21', 'Peer reviewer for national and international journals'] },
    'arifuddin-ahmed': { role: 'Associate Professor, Psychiatry', exp: '25 years',
      edu: ['MBBS - NTR University of Health Sciences, Andhra Pradesh', 'Internship - Princess Esra Hospital, Deccan College of Medical Sciences', 'MD - NTR University of Health Sciences, Andhra Pradesh'],
      skills: ['Managed stress, adjustment disorder, depression, anxiety, OCD, psychosomatic problems, drug problems, psychosis, schizophrenia, bipolar disorder and delirium', 'Child psychiatry disorders', 'Psychopharmacology and psychotherapy (counselling)', 'Consultation liaison psychiatry'],
      pubs: ['Psychiatric morbidity in postpartum women in Hyderabad (2017)', 'Mental health conditions: a mini review (2014)'] },
    'mazhar-ali': { role: 'Associate Professor, Psychiatry', exp: '24 years',
      edu: ['MBBS - Kakatiya Medical College', 'MD - Deccan College of Medical Sciences', 'Diploma in Diabetes'],
      skills: ['De-addiction psychiatry', 'Consultation liaison psychiatry', 'General psychiatry'] },

    'mohammed-aejaz-habeeb': { role: 'Professor & HOD, Gastroenterology & Hepatology', exp: '28 years',
      edu: ['MBBS - Osmania Medical College, Hyderabad', 'MD - AIIMS, New Delhi', 'DM - AIIMS, New Delhi', 'PhD in Biotechnology - JNTU, Hyderabad', 'F.R.C.P. (Glasg.)'],
      skills: ['Therapeutic endoscopy, ERCP and endoscopic ultrasound', 'Inflammatory bowel diseases, GERD, colon polyps, hepatitis, peptic ulcers, colitis, gallbladder and biliary tract diseases', 'Endoscopic sclerotherapy, variceal banding, fundal variceal glue injection, achalasia pneumatic dilatation', 'Double balloon enteroscopy; percutaneous endoscopic liver biopsies; motility studies', 'Completed 25 clinical trials; undertaking 8 more as principal investigator'],
      awards: ['Best poster/paper award, INASL 2014', 'Best poster/paper awards, ISGCON 2013 and ISGCON 2014', 'Best poster/paper, Indian Society of Gastroenterology Hyderabad conference 2010'],
      pubs: ['More than 90 publications in national and international peer reviewed journals'] }
  };

  /* ---------- helpers ---------- */
  var EXT = ['jpg', 'jpeg', 'webp', 'png'];

  /* tries base.jpg, base.jpeg, base.webp, base.png; calls onFail if none, onOk if found */
  function loadImg(im, basePath, onFail, onOk) {
    var i = 0;
    im.onload = function () { if (onOk) onOk(im); };
    im.onerror = function () {
      i++;
      if (i < EXT.length) {
        im.src = basePath + '.' + EXT[i];
      } else {
        im.onerror = null;
        if (onFail) onFail(im);
      }
    };
    im.src = basePath + '.' + EXT[0];
  }

  function slug(name) {
    return name.replace(/^dr\.?\s*/i, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function initials(name) {
    return name.replace(/^Dr\.?\s*/i, '').split(/\s+/)
      .map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase() || 'DR';
  }

  /* photo file base for a person (assets/doctors/<slug> or the "photo" override) */
  function photoBase(name) {
    var s = slug(name);
    return 'assets/doctors/' + ((DOCTORS[s] && DOCTORS[s].photo) || s);
  }

  function loadPhotos(root) {
    $$('.doc-img img', root).forEach(function (im) {
      loadImg(im, im.getAttribute('data-base'), function (x) { x.remove(); });
    });
  }

  /* one clickable golden doctor card (used everywhere) */
  function docCard(name, role) {
    return '<a class="doc-card" href="#doctor-' + slug(name) + '"><div class="doc-img">' +
      '<span class="mono">' + initials(name) + '</span>' +
      '<img alt="' + name + '" data-base="' + photoBase(name) + '"></div>' +
      '<div class="doc-name">' + name + '<span class="doc-role">' + (role || 'View profile') + '</span></div></a>';
  }

  /* every unique person (management + all specialties) */
  function allPeople() {
    var seen = {}, out = [];
    function add(n) { var s = slug(n); if (!seen[s]) { seen[s] = 1; out.push(n); } }
    MGMT.forEach(function (m) { add(m.name); });
    Object.keys(DEPTS).forEach(function (k) { DEPTS[k].doctors.forEach(add); });
    return out;
  }

  /* find a person by slug in management and/or specialties */
  function findPerson(s) {
    var hit = null;
    MGMT.forEach(function (m) {
      if (slug(m.name) === s) hit = { name: m.name, mg: m, key: null };
    });
    Object.keys(DEPTS).forEach(function (k) {
      DEPTS[k].doctors.forEach(function (n) {
        if (slug(n) === s) {
          if (!hit) hit = { name: n, mg: null, key: k };
          else if (!hit.key) hit.key = k;
        }
      });
    });
    return hit;
  }

  function dList(title, arr) {
    return (arr && arr.length)
      ? '<div class="dr-sec"><h3>' + title + '</h3><ul>' +
        arr.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>'
      : '';
  }

  /* ---------- Specialties grid (built from DEPTS) ---------- */
  var deptGrid = $('#deptGrid');
  if (deptGrid) {
    deptGrid.innerHTML = Object.keys(DEPTS).map(function (k) {
      var d = DEPTS[k];
      return '<article class="card svc">' +
        '<div class="iconbox"><span aria-hidden="true" style="font-size:28px">' + d.icon + '</span></div>' +
        '<h3>' + d.name + '</h3><p>' + d.intro + '</p>' +
        '<a class="textlink" href="#dept-' + k + '">View details &amp; doctors ' +
        '<svg class="ic" aria-hidden="true"><use href="#i-arrow" /></svg></a></article>';
    }).join('');
  }

  /* ---------- Specialty page ---------- */
  function renderDept(key) {
    var d = DEPTS[key];
    $('#dBread').textContent = d.name;
    $('#dName').textContent = d.name;
    $('#dIntro').textContent = d.intro;

    var about = d.about.map(function (p) { return '<p class="dept-about">' + p + '</p>'; }).join('');
    var services = d.services.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    var docs = d.doctors.map(function (n) { return docCard(n); }).join('');

    var body = $('#dBody');
    body.innerHTML =
      '<div class="dept-top" id="dTop"><div><div class="eyebrow dk">About the specialty</div>' +
      '<h2>' + d.name + '</h2>' + about + '</div>' +
      '<div class="dept-photo"><img alt="' + d.name + '" data-base="assets/departments/' + key + '"></div></div>' +
      '<div class="dept-block"><div class="eyebrow dk">What we offer</div><h2>Our Best Services Included</h2>' +
      '<ul class="dept-services">' + services + '</ul></div>' +
      '<div class="dept-block"><div class="eyebrow dk">Our doctors</div><h2>Meet the Doctors</h2>' +
      '<div class="doc-grid">' + docs + '</div>' +
      '<p class="dept-note">Select a doctor to read the full profile. Availability and timings can change, so please call reception to confirm before visiting.</p></div>';

    /* specialty photo: hide the box if there is none */
    var dp = $('.dept-photo img', body);
    loadImg(dp, dp.getAttribute('data-base'), function (im) {
      im.parentNode.classList.add('empty');
      $('#dTop').classList.add('no-photo');
    });

    loadPhotos(body);
  }

  /* ---------- Doctor profile page ---------- */
  function renderDoctor(s) {
    var hit = findPerson(s);
    if (!hit) return null;

    var d = hit.key ? DEPTS[hit.key] : null;
    var info = DOCTORS[s] || {};
    var role = info.role || (hit.mg && hit.mg.role) || (d ? d.name : 'Owaisi Hospital & Research Centre');

    var crumbs = '<a href="#home">Home</a><span>/</span>';
    crumbs += d ? '<a href="#specialties">Specialties</a><span>/</span><a href="#dept-' + hit.key + '">' + d.name + '</a>'
                : '<a href="#management">Management</a>';
    crumbs += '<span>/</span><b>' + hit.name + '</b>';

    $('#drCrumbs').innerHTML = crumbs;
    $('#drDept').textContent = d ? d.name : 'Hospital Management';
    $('#drName').textContent = hit.name;
    $('#drRole').textContent = role;

    var facts = '<li><b>Role</b><span>' + role + '</span></li>';
    if (hit.mg && hit.mg.role && hit.mg.role !== role) facts += '<li><b>Management</b><span>' + hit.mg.role + '</span></li>';
    if (info.exp) facts += '<li><b>Experience</b><span>' + info.exp + '</span></li>';
    if (d) facts += '<li><b>Specialty</b><a href="#dept-' + hit.key + '">' + d.name + '</a></li>';
    facts += '<li><b>Hospital</b><span>Owaisi Hospital &amp; Research Centre, Kanchan Bagh</span></li>';

    var detail = dList('Education', info.edu) + dList('Skills', info.skills) +
      dList('Awards', info.awards) + dList('Publications', info.pubs);
    if (!detail) detail = '<p class="dept-about" style="margin-top:20px">Detailed profile coming soon. Please call reception to confirm this doctor\'s timings and availability.</p>';

    var official = info.url
      ? '<a class="btn dark" href="' + info.url + '" target="_blank" rel="noopener">Official profile ' +
        '<svg class="ic" aria-hidden="true"><use href="#i-ext" /></svg></a>' : '';

    var others, othersTitle;
    if (d) {
      others = d.doctors.filter(function (n) { return n !== hit.name; }).map(function (n) { return docCard(n); }).join('');
      othersTitle = 'Other doctors in this specialty';
    } else {
      others = MGMT.filter(function (m) { return m.name !== hit.name; }).map(function (m) { return docCard(m.name, m.role); }).join('');
      othersTitle = 'Hospital management';
    }

    var body = $('#drBody');
    body.innerHTML =
      '<div class="dr-top">' +
        '<article class="doc-card dr-photo"><div class="doc-img"><span class="mono">' + initials(hit.name) + '</span>' +
        '<img alt="' + hit.name + '" data-base="' + photoBase(hit.name) + '"></div>' +
        '<div class="doc-name">' + hit.name + '</div></article>' +
        '<div><div class="eyebrow dk">About the doctor</div><h2>' + hit.name + '</h2>' +
        '<ul class="dr-facts">' + facts + '</ul>' + detail +
        '<div class="dr-actions"><a class="btn" href="tel:+914024342754">' +
        '<svg class="ic" aria-hidden="true"><use href="#i-phone" /></svg> Call reception</a>' + official + '</div></div>' +
      '</div>' +
      (others ? '<div class="dept-block"><h2>' + othersTitle + '</h2><div class="doc-grid">' + others + '</div></div>' : '');

    loadPhotos(body);
    return { title: hit.name, nav: d ? 'specialties' : 'management' };
  }

  /* ---------- Management page (built when first opened) ---------- */
  var mgmtBuilt = false;
  function buildMgmt() {
    if (mgmtBuilt) return;
    mgmtBuilt = true;

    var grid = $('#mgmtGrid');
    grid.innerHTML = MGMT.map(function (m) { return docCard(m.name, m.role); }).join('');
    loadPhotos(grid);

    var wrap = $('#mgmtDocs');
    wrap.innerHTML = Object.keys(DEPTS).map(function (k) {
      var d = DEPTS[k];
      return '<div class="mgmt-dept"><h3><a href="#dept-' + k + '">' + d.name + '</a></h3>' +
        '<div class="doc-grid">' + d.doctors.map(function (n) { return docCard(n); }).join('') + '</div></div>';
    }).join('');
    loadPhotos(wrap);
  }

  /* ---------- Photo checklist (open site/#photos) ---------- */
  function renderPhotos() {
    var list = $('#photoList');
    var people = allPeople();
    var found = 0, done = 0;
    var sum = $('#photoSum');
    sum.textContent = 'Checking ' + people.length + ' photos…';
    list.innerHTML = '';

    people.forEach(function (n) {
      var row = document.createElement('div');
      row.className = 'photo-row';
      row.innerHTML = '<span class="pr-name"></span><code></code><span class="pr-st">checking…</span>';
      $('.pr-name', row).textContent = n;
      $('code', row).textContent = photoBase(n) + '.jpg  (or .jpeg / .webp / .png)';
      list.appendChild(row);

      function finish(ok) {
        done++;
        if (ok) { found++; row.classList.add('ok'); }
        $('.pr-st', row).textContent = ok ? 'found' : 'missing';
        sum.textContent = found + ' of ' + people.length + ' photos uploaded' + (done < people.length ? ' (checking…)' : '');
      }
      loadImg(new Image(), photoBase(n), function () { finish(false); }, function () { finish(true); });
    });
  }

  /* ---------- Single-page router ---------- */
  var pages = $$('.page');
  var links = $$('#navlinks a[href^="#"]');
  var siteName = 'Owaisi Hospital & Research Centre';

  function showPage() {
    var id = location.hash.slice(1).toLowerCase();
    if (id === 'main' || id === 'top') return;

    var title = '';
    var navId = '';

    if (id.indexOf('dept-') === 0) {
      var key = id.slice(5);
      if (DEPTS[key]) {
        renderDept(key);
        title = DEPTS[key].name;
        id = 'department';
        navId = 'specialties';
      } else {
        id = 'specialties';
      }
    } else if (id.indexOf('doctor-') === 0) {
      var res = renderDoctor(id.slice(7));
      if (res) {
        title = res.title;
        navId = res.nav;
        id = 'doctor';
      } else {
        id = 'specialties';
      }
    } else if (id === 'photos') {
      renderPhotos();
    } else if (id === 'management') {
      buildMgmt();
    }

    if (!pages.some(function (p) { return p.id === id; })) id = 'home';
    if (!navId) navId = id;

    pages.forEach(function (p) { p.hidden = (p.id !== id); });

    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + navId;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    document.title = (title || document.getElementById(id).dataset.title) + ' | ' + siteName;

    var t = $('.menu-toggle');
    if (t && t.getAttribute('aria-expanded') === 'true') t.click();

    window.scrollTo(0, 0);
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 60);
  }

  window.addEventListener('hashchange', showPage);
  showPage();
})();
